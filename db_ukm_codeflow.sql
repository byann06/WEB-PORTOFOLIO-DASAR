-- 1. TABEL USER(ADMIN DAN ANGGOTA)
CREATE TABLE users (
    id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'anggota')),
    status_aktif BOOLEAN DEFAULT 1,
    tanggal_daftar DATETIME DEFAULT CURRENT_TIMESTAMP
);
    -- Penjelasan:
    -- role menentukan peran (admin atau anggota).
    -- status_aktif bisa buat nonaktifkan akun.
    -- tanggal_daftar otomatis diisi saat akun dibuat.

-- 2. TABEL IDENTITAS (DATA PRIBADI ANGGOTA DAN ADMIN)
CREATE TABLE identitas (
    id_identitas INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    nama_lengkap VARCHAR(100),
    nim VARCHAR(30),
    jurusan VARCHAR(100),
    no_hp VARCHAR(20),
    email VARCHAR(100),
    alamat TEXT,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);
    -- PENJELASAN IDENTITAS : 
    -- Menyimpan detail pribadi dari users.
    -- Kalau user dihapus, identitasnya ikut hilang.

-- 3. TABEL ABSENSI
CREATE TABLE absensi (
    id_absensi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    jam_masuk TIME,
    jam_keluar TIME,
    keterangan VARCHAR(100),
    status_kehadiran VARCHAR(20) CHECK (status_kehadiran IN ('hadir', 'izin', 'alpha', 'terlambat')),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);
    -- PENJELASAN TABEL ABSENSI : 
    -- Menyimpan catatan kehadiran tiap anggota.
    -- Admin bisa lihat & rekap absensi.

-- 4. TABEL JADWAL
CREATE TABLE jadwal_kegiatan (
    id_kegiatan INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kegiatan VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    tanggal_kegiatan DATE NOT NULL,
    waktu_mulai TIME,
    waktu_selesai TIME,
    lokasi VARCHAR(100),
    dibuat_oleh INTEGER,
    FOREIGN KEY (dibuat_oleh) REFERENCES users(id_user)
);
    -- PENJELASAN TABEL JADWAL KEGIATAN :
    -- Jadwal kegiatan yang dibuat admin.
    -- Nanti anggota bisa lihat daftar kegiatannya.

-- 5. TABEL PENGUMUMAN 
CREATE TABLE pengumuman (
    id_pengumuman INTEGER PRIMARY KEY AUTOINCREMENT,
    judul VARCHAR(100) NOT NULL,
    isi TEXT NOT NULL,
    tanggal_dibuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    dibuat_oleh INTEGER,
    FOREIGN KEY (dibuat_oleh) REFERENCES users(id_user)
);
    -- PENJELASAN TABEL PENGUMUMAN :
    -- Admin yang membuat pengumuman.
    -- Anggota bisa lihat di dashboard dan beri komentar.

-- 6. TABEL KOMENTAR PENGUMUMAN
CREATE TABLE komentar_pengumuman (
    id_komentar INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pengumuman INTEGER NOT NULL,
    id_user INTEGER NOT NULL,
    isi_komentar TEXT NOT NULL,
    tanggal_komentar DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pengumuman) REFERENCES pengumuman(id_pengumuman) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);
    -- PENJELASAN TABEL KOMENTAR PENGUMUMAN : 
    -- Anggota bisa beri komentar di pengumuman.
    -- Kalau pengumuman dihapus, komentarnya juga hilang.

-- 7.TABEL STRUKTUR PENGURUS
CREATE TABLE struktur_organisasi (
    id_struktur INTEGER PRIMARY KEY AUTOINCREMENT,
    jabatan VARCHAR(50) NOT NULL,
    id_user INTEGER,
    periode VARCHAR(20),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

    -- PENJELASAN TABEL STRUKTUR PENGURUS : 
    -- Menentukan posisi (ketua, sekretaris, bendahara, dll).
    -- Admin bisa atur anggota mana yang menjabat posisi tertentu.



-- TOTAL TABEL : 
-- 1. users
-- 2. identitas
-- 3. absensi
-- 4. jadwal_kegiatan
-- 5. pengumuman
-- 6. komentar_pengumuman
-- 7. struktur_organisasi
