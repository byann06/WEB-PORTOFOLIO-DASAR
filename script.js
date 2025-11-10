// app.js - front-end logic + simpan sementara di localStorage
document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  yearSpan.textContent = new Date().getFullYear();

  // Element refs
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content-area');
  const pages = document.querySelectorAll('.page');
  const openLoginBtn = document.getElementById('open-login');
  const authArea = document.getElementById('auth-area');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const pageIdentitas = document.getElementById('page-identitas');
  const btnLogout = document.getElementById('btn-logout');
  const userGreet = document.getElementById('user-greet');
  const profileName = document.getElementById('profile-name');
  const profileProdi = document.getElementById('profile-prodi');
  const tblRiwayat = document.querySelector('#tbl-riwayat tbody');
  const btnAbsen = document.getElementById('btn-absen-sekarang');
  const nextMeeting = document.getElementById('next-meeting');
  const jadwalList = document.getElementById('jadwal-list');
  const strukturCards = document.getElementById('struktur-cards');
  const tblAnggota = document.querySelector('#tbl-anggota tbody');

  // Simpan data di localStorage sebagai demo (gantikan dengan server later)
  const DBKEY = 'cfc_demo_db_v1';

  function dbLoad() {
    const raw = localStorage.getItem(DBKEY);
    if (!raw) {
      const seed = {
        users: [], // {id, nama, email, passHash, identitas: {...}}
        attendance: [], // {userId, tanggal, pertemuan, status}
        schedule: [
          // contoh
          { id: 1, judul: 'Workshop Git', tanggal: '2025-11-15', waktu: '15:00', tempat: 'Lab Komputer' },
          { id: 2, judul: 'Coding Night', tanggal: '2025-11-20', waktu: '19:00', tempat: 'Ruang Kegiatan' }
        ],
        org: [
          { jabatan: 'Ketua', nama: 'Alya Putri' },
          { jabatan: 'Wakil Ketua', nama: 'Rizal' },
          { jabatan: 'Sekretaris', nama: 'Budi' }
        ]
      };
      localStorage.setItem(DBKEY, JSON.stringify(seed));
      return seed;
    } else return JSON.parse(raw);
  }
  function dbSave(db) { localStorage.setItem(DBKEY, JSON.stringify(db)); }

  let DB = dbLoad();
  let currentUser = JSON.parse(sessionStorage.getItem('cfc_current_user') || 'null');

  // Navigation helpers
  function hideAllPages() { pages.forEach(p => p.hidden = true); }
  function showPage(id) {
    hideAllPages();
    const el = document.getElementById('page-' + id) || document.getElementById(id);
    if (el) el.hidden = false;
  }

  // Initial render
  function renderAppState() {
    if (currentUser) {
      // show sidebar + user info
      sidebar.hidden = false;
      userGreet.hidden = false;
      btnLogout.hidden = false;
      document.getElementById('open-login')?.parentElement?.remove();
      userGreet.textContent = `Halo, ${currentUser.nama}`;
      profileName.textContent = currentUser.nama;
      const ident = currentUser.identitas || {};
      profileProdi.textContent = ident.prodi ? `${ident.prodi} • Sem ${ident.semester || '-'}` : 'Identitas belum lengkap';
      showPage('home');

      // render data-driven pages
      renderRiwayat();
      renderJadwal();
      renderStruktur();
      renderAnggota();
      renderNextMeeting();
    } else {
      sidebar.hidden = true;
      userGreet.hidden = true;
      btnLogout.hidden = true;
      showPage('home');
    }
  }

  // Auth UI toggles
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    formLogin.hidden = false; formRegister.hidden = true;
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    formRegister.hidden = false; formLogin.hidden = true;
  });
  openLoginBtn?.addEventListener('click', () => {
    hideAllPages(); authArea.hidden = false;
  });

  // Register
  formRegister.addEventListener('submit', e => {
    e.preventDefault();
    const nama = document.getElementById('reg-nama').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('reg-pass').value;
    // very simple validation
    if (!nama || !email || pass.length < 6) { alert('Lengkapi data dengan benar'); return; }
    // cek email unik
    if (DB.users.some(u => u.email === email)) { alert('Email sudah terdaftar'); return; }
    const id = Date.now().toString();
    const user = { id, nama, email, passHash: btoa(pass), identitas: null };
    DB.users.push(user);
    dbSave(DB);
    // simpan session utk langkah identitas
    sessionStorage.setItem('cfc_next_register', JSON.stringify({ id, email }));
    alert('Daftar berhasil. Silakan isi identitas.');
    // buka halaman identitas
    hideAllPages(); pageIdentitas.hidden = false;
  });

  // Identitas
  document.getElementById('form-identitas').addEventListener('submit', e => {
    e.preventDefault();
    const reg = JSON.parse(sessionStorage.getItem('cfc_next_register') || 'null');
    if (!reg) { alert('Tidak ada proses registrasi. Silakan login.'); hideAllPages(); authArea.hidden = false; return; }
    const user = DB.users.find(u => u.id === reg.id);
    if (!user) { alert('Pengguna tidak ditemukan.'); return; }
    const ident = {
      nim: document.getElementById('ident-nim').value.trim(),
      prodi: document.getElementById('ident-prodi').value.trim(),
      semester: document.getElementById('ident-semester').value,
      tempat: document.getElementById('ident-tempat').value.trim(),
      tgl_lahir: document.getElementById('ident-tgl').value,
      phone: document.getElementById('ident-phone').value.trim()
    };
    user.identitas = ident;
    dbSave(DB);
    // login otomatis
    currentUser = { id: user.id, nama: user.nama, email: user.email, identitas: user.identitas };
    sessionStorage.setItem('cfc_current_user', JSON.stringify(currentUser));
    sessionStorage.removeItem('cfc_next_register');
    renderAppState();
  });

  // Login
  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;
    const user = DB.users.find(u => u.email === email);
    if (!user) { alert('Email belum terdaftar'); return; }
    if (user.passHash !== btoa(pass)) { alert('Password salah'); return; }
    currentUser = { id: user.id, nama: user.nama, email: user.email, identitas: user.identitas };
    sessionStorage.setItem('cfc_current_user', JSON.stringify(currentUser));
    renderAppState();
  });

  // Logout
  btnLogout.addEventListener('click', () => {
    currentUser = null;
    sessionStorage.removeItem('cfc_current_user');
    renderAppState();
  });

  // Sidebar navigation
  document.querySelectorAll('.side-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      showPage(page);
    });
  });

  // Render functions
  function renderRiwayat() {
    tblRiwayat.innerHTML = '';
    if (!currentUser) return;
    const rows = DB.attendance.filter(a => a.userId === currentUser.id);
    if (rows.length === 0) {
      tblRiwayat.innerHTML = '<tr><td colspan="3">Belum ada riwayat absensi</td></tr>';
      return;
    }
    rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.tanggal}</td><td>${r.pertemuan}</td><td>${r.status}</td>`;
      tblRiwayat.appendChild(tr);
    }
  }

  function renderNextMeeting() {
    // ambil schedule yang tanggal >= hari ini (simple compare)
    const today = new Date().toISOString().slice(0, 10);
    const next = DB.schedule.find(s => s.tanggal >= today);
    if (!next) {
      nextMeeting.innerHTML = '<p>Tidak ada jadwal terdaftar.</p>';
    } else {
      nextMeeting.innerHTML = `<strong>${next.judul}</strong><p>${next.tanggal} ${next.waktu}</p><p>${next.tempat}</p>`;
    }
  }

  // Absen sekarang (sederhana: pertemuan = "Umum" + timestamp)
  btnAbsen.addEventListener('click', () => {
    if (!currentUser) { alert('Silakan login terlebih dahulu'); return; }
    const tanggal = new Date().toISOString().slice(0, 10);
    const pertemuan = `Pertemuan - ${new Date().toLocaleString()}`;
    DB.attendance.push({ userId: currentUser.id, tanggal, pertemuan, status: 'Hadir' });
    dbSave(DB);
    renderRiwayat();
    alert('Absensi berhasil dicatat.');
  });

  function renderJadwal() {
    jadwalList.innerHTML = '';
    if (DB.schedule.length === 0) {
      jadwalList.textContent = 'Belum ada jadwal';
      return;
    }
    DB.schedule.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<h4>${ev.judul}</h4><p>${ev.tanggal} ${ev.waktu} • ${ev.tempat}</p>`;
      jadwalList.appendChild(div);
    });
  }

  function renderStruktur() {
    strukturCards.innerHTML = '';
    DB.org.forEach(o => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<strong>${o.jabatan}</strong><p>${o.nama}</p>`;
      strukturCards.appendChild(div);
    });
  }

  function renderAnggota() {
    tblAnggota.innerHTML = '';
    DB.users.forEach(u => {
      const ident = u.identitas || {};
      const tr = document.createElement('tr');
      const ttl = ident.tempat ? `${ident.tempat}, ${ident.tgl_lahir || '-'}` : '-';
      tr.innerHTML = `<td>${u.nama}</td><td>${ident.prodi || '-'}</td><td>${ident.semester || '-'}</td><td>${ttl}</td>`;
      tblAnggota.appendChild(tr);
    });
  }

  // Top nav
  document.getElementById('nav-home').addEventListener('click', () => showPage('home'));
  document.getElementById('nav-about').addEventListener('click', () => showPage('about'));

  // Initial app render
  renderAppState();

  // --- OPTIONAL: example placeholder for fetch to backend ---
  async function apiFetch(path, opts) {
    // when backend siap, ganti baseURL
    const baseURL = '/api';
    return fetch(baseURL + path, opts).then(r => r.json()).catch(e => {
      console.warn('API fetch failed (placeholder):', e);
      return { error: 'network' };
    });
  }
});
