document.addEventListener('DOMContentLoaded', function() {
  // Cek status login pengguna (dari sessionStorage atau localStorage)
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  const welcomeMessage = document.getElementById('welcomeMessage');
  const dataContainer = document.getElementById('dataContainer');

  if (isLoggedIn) {
    // Jika sudah login, sembunyikan pesan selamat datang dan tampilkan tabel
    welcomeMessage.style.display = 'none';
    dataContainer.style.display = 'block'; // Menampilkan tabel
  } else {
    // Jika belum login, tampilkan pesan selamat datang dan sembunyikan tabel
    welcomeMessage.style.display = 'block';
    dataContainer.style.display = 'none'; // Menyembunyikan tabel
  }
});

// Fungsi untuk menangani login
async function handleLogin() {
  // Simulasi login sukses
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'user',
      password: 'password'
    })
  });

  if (response.ok) {
    localStorage.setItem('isLoggedIn', 'true'); // Set status login
    window.location.reload(); // Reload halaman setelah login sukses
  } else {
    alert('Login gagal');
  }
}

// Fungsi logout
async function handleLogout() {
  localStorage.removeItem('isLoggedIn'); // Hapus status login
  window.location.reload(); // Reload halaman setelah logout
}

//===========================================================
function clearDataTable() {
  const tbody = document.querySelector('#activeTable tbody');
  tbody.innerHTML = ''; // Kosongkan tabel sebelum menampilkan data baru
}

    // Fungsi untuk mengambil data active users dari backend
    async function fetchActiveUsers() {
      try {
        clearDataTable(); // Kosongkan tabel sebelum mengambil data baru
        const response = await fetch('/api/hotspot-active');
        const data = await response.json();
        console.log('Respons API:', data); // Debug respons
        if (response.ok) {
          displayActiveUsers(data); // Memanggil fungsi untuk menampilkan data
        } else {
          console.error('Server mengembalikan error:', data);
          alert('Gagal mengambil data active users');
        }
      } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat mengambil data.');
      }
    }

    // Fungsi untuk menampilkan data active users di tabel
    function displayActiveUsers(users) {
      if (!Array.isArray(users) || users.length === 0) {
        console.warn('Data active users kosong atau tidak sesuai:', users);
        alert('Tidak ada data active users untuk ditampilkan.');
        return;
      }
      const tbody = document.querySelector('#activeTable tbody');
      tbody.innerHTML = ''; // Kosongkan tabel sebelum menambahkan data baru
      users.forEach((user, index) => {
        const bytesOut = user['bytes-out'] || 0; // Ambil nilai bytes-out (default ke 0 jika tidak ada)
        const mbps = (bytesOut * 8 / 10000000).toFixed(2); // Konversi ke Mbps dan bulatkan 2 desimal
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.user}</td>
          <td>${user.address}</td>
          <td>${user['mac-address']}</td>
          <td>${user['login-by']}</td>
          <td>${mbps} Mbps</td>
          <td>${user.uptime}</td>
          <td>${user.comment || 'N/A'}</td>
        `;
        tbody.appendChild(row);
      });
      document.getElementById('dataContainer').style.display = 'block'; // Menampilkan tabel
      document.getElementById('UsersContainer').style.display = 'none'; // Menyembunyikan tabel list users
    }

    // Fungsi untuk mengambil data list users dari backend
    async function fetchHotspotUsers() {
      try {
        clearDataTable(); // Kosongkan tabel sebelum mengambil data baru
        const response = await fetch('/api/hotspot-users');
        const data = await response.json();
        console.log('Respons API:', data); // Debug respons
        if (response.ok) {
          displayHotspotUsers(data); // Memanggil fungsi untuk menampilkan data
        } else {
          console.error('Server mengembalikan error:', data);
          alert('Gagal mengambil data list users');
        }
      } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat mengambil data.');
      }
    }

    // Fungsi untuk menampilkan data list users di tabel
    function displayHotspotUsers(users) {
      if (!Array.isArray(users) || users.length === 0) {
        console.warn('Data list users kosong atau tidak sesuai:', users);
        alert('Tidak ada data list users untuk ditampilkan.');
        return;
      }
      const tbody = document.querySelector('#UsersTable tbody');
      tbody.innerHTML = ''; // Kosongkan tabel sebelum menambahkan data baru
      users.forEach((user, index) => {
        const bytesOut = user['bytes-out'] || 0; // Ambil nilai bytes-out (default ke 0 jika tidak ada)
        const gbps = (bytesOut * 8 / 10000000000).toFixed(1); // Konversi ke Mbps dan bulatkan 2 desimal
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.server }</td>
          <td>${user.name}</td>
          <td>${user['mac-address'] || 'N/A'}</td>
          <td>${user.profile}</td> 
          <td>${gbps} Gbps</td>
          <td>${user.uptime}</td>
          <td>${user.comment || 'N/A'}</td>
        `;
        tbody.appendChild(row);
      });
      document.getElementById('UsersContainer').style.display = 'block'; // Menampilkan tabel
      document.getElementById('dataContainer').style.display = 'none'; // Menyembunyikan tabel list users
    }

    // Event listener untuk tombol "Currently Active"
    document.getElementById('ActiveBtn').addEventListener('click', (event) => {
      event.preventDefault(); // Mencegah navigasi
      fetchActiveUsers(); // Mengambil data active users saat tombol diklik
    });

    // Event listener untuk tombol "List User Wifi"
    document.getElementById('UserBtn').addEventListener('click', (event) => {
      event.preventDefault(); // Mencegah navigasi
      fetchHotspotUsers(); // Mengambil data list users saat tombol diklik
    });

    // Fungsi untuk toggle submenu
    function toggleSubMenu(event, submenuId) {
      event.preventDefault();
      const submenu = document.getElementById(submenuId);
      const allSubmenus = document.querySelectorAll('.submenu');

      // Tutup semua submenu kecuali yang sedang diklik
      allSubmenus.forEach((menu) => {
        if (menu !== submenu && menu.classList.contains('show')) {
          menu.classList.remove('show');
        }
      });

      // Toggle kelas "show" untuk submenu yang diklik
      if (submenu.classList.contains('show')) {
        submenu.classList.remove('show');
      } else {
        submenu.classList.add('show');
      }
    }

   // Fungsi untuk melakukan pencarian dalam tabel dengan ID tertentu
function searchInTable(searchInputId, tableId) {
  const input = document.getElementById(searchInputId);
  const filter = input.value.toLowerCase(); // Ubah input menjadi lowercase untuk pencarian tidak sensitif huruf
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName('tr');

  // Iterasi untuk setiap baris dalam tabel, kecuali header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getElementsByTagName('td');
    let rowContainsSearchTerm = false;

    // Periksa setiap kolom dalam baris untuk mencocokkan input pencarian
    for (let j = 0; j < cells.length; j++) {
      if (cells[j].textContent.toLowerCase().includes(filter)) {
        rowContainsSearchTerm = true;
        break;
      }
    }

    // Tampilkan atau sembunyikan baris berdasarkan pencarian
    if (rowContainsSearchTerm) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
     // Update nomor baris setelah filter diterapkan
  updateRowNumbers('UsersTable');
  }
}

// Event listener untuk pencarian pada tabel activeTable
document.getElementById('searchactiveTable').addEventListener('input', () => {
  searchInTable('searchactiveTable', 'activeTable');
});

// Event listener untuk pencarian pada tabel UsersTable
document.getElementById('searchUsersTable').addEventListener('input', () => {
  searchInTable('searchUsersTable', 'UsersTable');
});

//untuk mengetahui/menghitung jumlah data yang sudah di filter/cari
function searchData(tableId, resultId) {
  const input = document.getElementById(`search${tableId}`);
  console.log(input.value);
  const filter = input.value.toLowerCase(); // Ubah input menjadi lowercase untuk pencarian tidak sensitif huruf
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName('tr');
  let visibleCount = 0;

  // Iterasi untuk setiap baris dalam tabel, kecuali header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getElementsByTagName('td');
    let rowContainsSearchTerm = false;

    // Periksa setiap kolom dalam baris untuk mencocokkan input pencarian
    for (let j = 0; j < cells.length; j++) {
      if (cells[j].textContent.toLowerCase().includes(filter)) {
        rowContainsSearchTerm = true;
        break;
      }
    }

    // Tampilkan atau sembunyikan baris berdasarkan pencarian
    if (rowContainsSearchTerm) {
      row.style.display = '';
      visibleCount++; // Hitung baris yang terlihat
    } else {
      row.style.display = 'none';
    }
    // Update nomor baris setelah filter diterapkan
  updateRowNumbers('activeTable');
  }
  // Tampilkan jumlah item yang sesuai dengan pencarian
  const resultElement = document.getElementById(resultId);
  resultElement.textContent = `Menampilkan ${visibleCount} item dari ${rows.length - 1} total.`;
}



 //untuk penomoran dinamis berdasarkan pencarian
function updateRowNumbers(tableId) {
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName('tr');
  let rowNumber = 1; // Nomor awal

  // Mulai dari baris kedua (abaikan header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.style.display !== 'none') { // Pastikan hanya baris yang terlihat
      const firstCell = row.getElementsByTagName('td')[0];
      firstCell.textContent = rowNumber;
      rowNumber++;
    }
  }
}

//=========================================================================================
    // Event listener untuk tombol logout
      // Event listener untuk tombol logout
      document.getElementById('logoutButton').addEventListener('click', async () => {
      const confirmLogout = confirm('Apakah Anda yakin ingin logout?');
      if (!confirmLogout) return;

      try {
        logoutButton.textContent = 'Logging out...';
        logoutButton.disabled = true;

        const response = await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          window.location.href = '/login.html';
        } 
        else {
          alert(data.message || 'Logout gagal. Harap coba lagi.');
        }
      } catch (error) {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan saat logout. Harap coba lagi.');
      } finally {
        logoutButton.textContent = 'Logout';
        logoutButton.disabled = false;
      }
    });

// Fungsi untuk mengonversi tabel menjadi CSV dan mendownloadnya
function downloadCSV(tableId) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error(`Tabel dengan ID "${tableId}" tidak ditemukan`);
        return;
    }

    const rows = table.querySelectorAll('tr');
    let csvContent = '';

    rows.forEach((row, index) => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => rowData.push(col.textContent.trim()));
        csvContent += rowData.join(',') + '\n';
    });

    if (csvContent === '') {
        console.warn('Tabel kosong atau tidak ada data untuk diunduh');
        alert('Tabel kosong atau tidak ada data untuk diunduh');
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${tableId}_data.csv`; // Nama file CSV berdasarkan ID tabel
    link.click();
}

// Event listener untuk tombol Download CSV berdasarkan ID tabel
document.getElementById('downloadUserCSVButton').addEventListener('click', function() {
    console.log('Tombol download CSV untuk UsersTable diklik');
    downloadCSV('UsersTable'); 
});

// Event listener untuk tombol Download CSV berdasarkan ID tabel
document.getElementById('downloaddataCSVButton').addEventListener('click', function() {
    console.log('Tombol download CSV untuk activeTable diklik');
    downloadCSV('activeTable'); 
});


document.addEventListener('DOMContentLoaded', function () {
    // Tambahkan event listener ke setiap header tabel
    document.querySelectorAll('#activeTable th').forEach((header, columnIndex) => {
        header.addEventListener('click', () => {
            sortTableByColumn('activeTable', columnIndex);
        });
    });

    document.querySelectorAll('#UsersTable th').forEach((header, columnIndex) => {
        header.addEventListener('click', () => {
            sortTableByColumn('UsersTable', columnIndex);
        });
    });
});

// Fungsi untuk sorting tabel
function sortTableByColumn(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Tentukan apakah harus di-sort ascending atau descending
    const isAscending = table.dataset.sortOrder !== 'asc'; // Toggle sorting
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';

    // Sorting rows berdasarkan data di kolom
    rows.sort((a, b) => {
        const aText = a.children[columnIndex].textContent.trim();
        const bText = b.children[columnIndex].textContent.trim();

        // Cek apakah nilai berupa angka
        const aValue = parseFloat(aText.replace(/,/g, '')) || aText.toLowerCase();
        const bValue = parseFloat(bText.replace(/,/g, '')) || bText.toLowerCase();

        return isAscending
            ? aValue > bValue ? 1 : -1
            : aValue < bValue ? 1 : -1;
    });

    // Masukkan kembali row yang telah di-sort ke dalam tabel
    rows.forEach(row => tbody.appendChild(row));
}

fetch('http://localhost:3000/api/users')
    .then(response => response.json())
    .then(data => {
        console.log('Users:', data);
        // Lakukan sesuatu dengan data, misalnya render ke tabel
    })
    //.catch(error => console.error('Error:', error));

//=========update
fetch('http://localhost:3000/api/hotspot-users')
    .then(response => response.json())
    .then(data => {

    console.log('AddUser:',data);
    })
    //.catch(error => console.error('Error:', error));

