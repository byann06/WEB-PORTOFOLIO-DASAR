// auth-navigation.js - Sistem Validasi dan Navigasi Lengkap

class AuthSystem {
  constructor() {
    this.STORAGE_KEY = 'cfc_users_db';
    this.SESSION_KEY = 'cfc_current_user';
    this.initializeStorage();
    this.currentUser = this.getCurrentUser();
  }

  // Initialize localStorage jika belum ada
  initializeStorage() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  // Get all users dari localStorage
  getUsers() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  // Save users ke localStorage
  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  // Get current logged in user
  getCurrentUser() {
    const user = sessionStorage.getItem(this.SESSION_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Validasi Email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validasi Password (min 8 karakter, harus ada huruf dan angka)
  validatePassword(password) {
    if (password.length < 8) {
      return { valid: false, message: 'Password minimal 8 karakter' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: 'Password harus mengandung huruf' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password harus mengandung angka' };
    }
    return { valid: true, message: 'Password valid' };
  }

  // Register User
  register(userData) {
    const { nama, email, password, jenis_kelamin, prodi } = userData;

    // Validasi input
    if (!nama || nama.trim().length < 3) {
      return { success: false, message: 'Nama minimal 3 karakter' };
    }

    if (!this.validateEmail(email)) {
      return { success: false, message: 'Format email tidak valid' };
    }

    const passCheck = this.validatePassword(password);
    if (!passCheck.valid) {
      return { success: false, message: passCheck.message };
    }

    if (!jenis_kelamin) {
      return { success: false, message: 'Pilih jenis kelamin' };
    }

    if (!prodi) {
      return { success: false, message: 'Pilih program studi' };
    }

    // Cek email sudah terdaftar
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email sudah terdaftar' };
    }

    // Simpan user baru
    const newUser = {
      id: Date.now().toString(),
      nama: nama.trim(),
      email: email.toLowerCase().trim(),
      password: btoa(password), // Simple encoding (gunakan bcrypt di production)
      jenis_kelamin,
      prodi,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto login setelah register
    this.login(email, password);

    return { success: true, message: 'Registrasi berhasil!', user: newUser };
  }

  // Login User
  login(email, password) {
    if (!this.validateEmail(email)) {
      return { success: false, message: 'Format email tidak valid' };
    }

    if (!password) {
      return { success: false, message: 'Password tidak boleh kosong' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Email belum terdaftar' };
    }

    if (user.password !== btoa(password)) {
      return { success: false, message: 'Password salah' };
    }

    // Simpan session
    const userSession = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      prodi: user.prodi,
      loginAt: new Date().toISOString()
    };

    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(userSession));
    this.currentUser = userSession;

    return { success: true, message: 'Login berhasil!', user: userSession };
  }

  // Logout User
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUser = null;
    return { success: true, message: 'Logout berhasil' };
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }
}

// Navigation Controller
class NavigationController {
  constructor(authSystem) {
    this.auth = authSystem;
    this.initializeEventListeners();
    this.checkAuthAndRedirect();
  }

  checkAuthAndRedirect() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Jika user sudah login dan mencoba akses login/register, redirect ke index
    if (this.auth.isLoggedIn()) {
      if (currentPage === 'formLogin.html' || currentPage === 'formRegister.html') {
        this.showNotification('Anda sudah login', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }
    }
  }

  initializeEventListeners() {
    // Handle form login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Handle form register
    const registerForm = document.getElementById('formulir');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Handle tombol login di index
    const loginButtons = document.querySelectorAll('a[href="formLogin.html"]');
    loginButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleNavigateToLogin(e));
    });

    // Handle tombol register di index
    const registerButtons = document.querySelectorAll('a[href="formRegister.html"]');
    registerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleNavigateToRegister(e));
    });

    // Update UI jika sudah login
    this.updateUIBasedOnAuth();
  }

  handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    const result = this.auth.login(email, password);

    if (result.success) {
      if (remember) {
        localStorage.setItem('cfc_remember', email);
      }
      this.showNotification(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      this.showNotification(result.message, 'error');
    }
  }

  handleRegister(e) {
    e.preventDefault();

    const userData = {
      nama: document.getElementById('nama').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      jenis_kelamin: document.querySelector('input[name="jenis_kelamin"]:checked')?.value,
      prodi: document.getElementById('Prodi').value
    };

    const result = this.auth.register(userData);

    if (result.success) {
      this.showNotification(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      this.showNotification(result.message, 'error');
    }
  }

  handleNavigateToLogin(e) {
    if (this.auth.isLoggedIn()) {
      e.preventDefault();
      this.showNotification('Anda sudah login!', 'info');
    }
  }

  handleNavigateToRegister(e) {
    if (this.auth.isLoggedIn()) {
      e.preventDefault();
      this.showNotification('Anda sudah login!', 'info');
    }
  }

  updateUIBasedOnAuth() {
    const user = this.auth.currentUser;
    
    if (user) {
      // Update header jika ada
      const loginBtn = document.querySelector('a[href="formLogin.html"]');
      const registerBtn = document.querySelector('a[href="formRegister.html"]');
      
      if (loginBtn && registerBtn) {
        const parent = loginBtn.parentElement.parentElement;
        parent.innerHTML = `
          <div class="flex items-center gap-4">
            <span class="text-yellow-700 font-medium">Halo, ${user.nama}!</span>
            <button id="logoutBtn" class="rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700">
              Logout
            </button>
          </div>
        `;

        // Add logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
          this.handleLogout();
        });
      }
    }
  }

  handleLogout() {
    const result = this.auth.logout();
    this.showNotification(result.message, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }

  showNotification(message, type = 'info') {
    // Hapus notifikasi lama jika ada
    const oldNotif = document.getElementById('authNotification');
    if (oldNotif) oldNotif.remove();

    // Buat notifikasi baru
    const notif = document.createElement('div');
    notif.id = 'authNotification';
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    const colors = {
      success: 'background: linear-gradient(135deg, #10b981, #059669);',
      error: 'background: linear-gradient(135deg, #ef4444, #dc2626);',
      info: 'background: linear-gradient(135deg, #3b82f6, #2563eb);'
    };

    notif.style.cssText += colors[type] || colors.info;
    notif.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notif);

    // Auto remove setelah 3 detik
    setTimeout(() => {
      notif.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }
}

// Initialize saat DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const authSystem = new AuthSystem();
  const navController = new NavigationController(authSystem);

  // Make authSystem available globally untuk debugging
  window.authSystem = authSystem;

  console.log('Auth System initialized');
  console.log('Current user:', authSystem.currentUser);
});