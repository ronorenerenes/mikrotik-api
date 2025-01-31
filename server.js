import express from 'express';
import { config } from 'dotenv';
import MikroNode from 'mikrotik';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';

// Memuat variabel lingkungan dari file .env
config();

const app = express();
const port = 3000;

// Menggunakan import.meta.url untuk mendapatkan __dirname di ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 3, // Batasi setiap IP ke 3 percobaan login per windowMs
    message: "Terlalu banyak percobaan login, coba lagi setelah 5 menit",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.static(path.join(__dirname, "public", "adduser.html")));

// Middleware (URUTAN SANGAT PENTING!)

app.use(cors());
app.use(express.json()); // Memastikan body request dapat diakses
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 3600000,
    }
}));

// Data user (sementara, sebaiknya gunakan database)
const users = [
    { username: '', password: await bcrypt.hash(process.env.ADMIN_PASSWORD || '', 10) },
];

// Middleware untuk memeriksa apakah user sudah login
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// Variabel global untuk koneksi MikroTik
let connection = null;

// Fungsi untuk menginisialisasi koneksi MikroTik
async function initializeMikroTikConnection() {
    try {
        const host = process.env.MIKROTIK_HOST;
        const port = process.env.MIKROTIK_PORT;
        const username = process.env.MIKROTIK_USERNAME;
        const password = process.env.MIKROTIK_PASSWORD;

        if (!host || !port || !username || !password) {
            throw new Error("MikroTik configuration is incomplete.");
        }

        connection = MikroNode.getConnection(host, username, password, {
            closeOnDone: false, // Koneksi tetap terbuka
            port: port,
        });

        const conn = await connection.getConnectPromise();
        console.log("MikroTik connection established.");
        return conn;
    } catch (err) {
        console.error("Failed to connect to MikroTik:", err.message);
        throw err;
    }
}

// Fungsi untuk mendapatkan koneksi MikroTik
async function getMikroTikConnection() {
    if (!connection) {
        return await initializeMikroTikConnection();
    }
    return connection;
}

// Endpoint Login
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.session.user = username;
        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint Logout
app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Middleware Redirect ke Login
const redirectToLogin = (req, res, next) => {
    if (!req.session.user && req.path !== '/login.html' && req.path !== '/auth/login' && req.path !== '/auth/logout') {
        return res.redirect('/login.html');
    }
    next();
};

app.use(redirectToLogin);

// Menyajikan File Statis
app.use('/', express.static(path.join(__dirname, 'public')));

// API Routes
const apiRoutes = express.Router();

apiRoutes.get('/hotspot-users', isLoggedIn, async (req, res) => {
    try {
        const conn = await getMikroTikConnection();
        const hotspotUsers = await conn.getCommandPromise('/ip/hotspot/user/print');
        res.json(hotspotUsers);
    } catch (err) {
        console.error('An error occurred:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});

apiRoutes.get('/hotspot-active', isLoggedIn, async (req, res) => {
    try {
        const conn = await getMikroTikConnection();
        const hotspotActive = await conn.getCommandPromise('/ip/hotspot/active/print');
        res.json(hotspotActive);
    } catch (err) {
        console.error('An error occurred:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});

app.use('/api', apiRoutes);

// Pastikan Anda memanggil fungsi initializeMikroTikConnection() saat server dijalankan
initializeMikroTikConnection()
    .then(() => {
        console.log("MikroTik connection initialized.");
    })
    .catch(err => {
        console.error("Error initializing MikroTik connection:", err.message);
        process.exit(1); // Matikan server jika koneksi gagal
    });


// Menjalankan server
const PORT = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
