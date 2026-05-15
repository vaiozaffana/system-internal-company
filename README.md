# Office Internal Management System

Sistem manajemen internal perusahaan berbasis web yang dibangun dengan Vue.js dan Express.js untuk mengelola kehadiran, penggajian, izin/cuti, lembur, dan jadwal kerja karyawan.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Project](#-struktur-project)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Kontribusi](#-kontribusi)

## ✨ Fitur Utama

### Karyawan (User)
- **Kehadiran GPS** — Check-in/check-out berbasis lokasi dengan validasi radius kantor, deteksi keterlambatan, dan pencatatan lembur otomatis
- **Izin / Cuti** — Pengajuan izin/cuti dengan status tracking
- **Slip Gaji** — Melihat slip gaji per bulan (hanya tersedia setelah admin generate)
- **Jadwal Kerja** — Kalender mingguan dinamis (Senin–Sabtu), navigasi antar minggu, status absen rekan kerja, ekspor PDF
- **Notifikasi** — Notifikasi in-app dengan status baca/belum baca
- **Profil** — Manajemen profil dan ganti password

### Admin
- **Dashboard Analytics** — Ringkasan kehadiran, karyawan aktif, dan statistik harian
- **Monitoring Absensi** — Pantau kehadiran seluruh karyawan secara real-time
- **Rekap Absensi** — Laporan bulanan kehadiran per karyawan
- **Kelola Izin/Cuti** — Review dan approve/reject pengajuan izin
- **Payroll** — Atur gaji pokok & tunjangan per karyawan, generate slip gaji bulanan, kelola lembur, konfigurasi potongan (BPJS, PPh 21)
- **Audit Log** — Pencatatan seluruh aktivitas sistem
- **Pengaturan Kehadiran** — Konfigurasi jam kerja, toleransi keterlambatan, radius kantor
- **Manajemen User** — CRUD karyawan, reset password

### Umum
- **Autentikasi JWT** — Login dengan role-based access control (admin/user)
- **Dark / Light Mode** — Toggle tema gelap/terang yang persisten
- **Search** — Pencarian halaman dari topbar

## 🛠 Teknologi

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Vue.js | 3.5 | Progressive JavaScript Framework |
| TypeScript | 6 | Type Safety |
| Vite | 8 | Build Tool & Dev Server |
| Vue Router | 5 | Routing |
| Pinia | 3 | State Management |
| Tailwind CSS | 4 | Utility-first CSS |
| Axios | — | HTTP Client |
| Lucide Vue Next | — | Icon Library |
| jsPDF + jspdf-autotable | — | Export PDF |
| Vitest | — | Unit Testing |
| Playwright | — | E2E Testing |

### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Node.js | ≥20.19.0 | Runtime Environment |
| Express.js | 5 | Web Framework |
| Prisma ORM | 7.8 | Database ORM |
| PostgreSQL | ≥12 | Database |
| JSON Web Token | — | Autentikasi |
| bcrypt | — | Password Hashing |
| express-validator | — | Input Validation |
| express-rate-limit | — | Rate Limiting |

## 🏗 Arsitektur Sistem

```
┌─────────────────┐
│   Vue.js SPA    │  ← Frontend (Port 5173)
└────────┬────────┘
         │ HTTP/REST API
┌────────▼────────┐
│   Express.js    │  ← Backend (Port 3000)
└────────┬────────┘
         │ Prisma ORM
┌────────▼────────┐
│   PostgreSQL    │  ← Database (Port 5432)
└─────────────────┘
```

### Backend — Layered Architecture

```
modules/
├── auth/           # Login, profil, ganti password
├── users/          # CRUD karyawan
├── attendance/     # Check-in/out, laporan
├── attendance-config/  # Konfigurasi jam kerja
├── leave/          # Izin/cuti
├── payroll/        # Gaji, lembur, slip
├── notification/   # Notifikasi in-app
└── audit/          # Audit log
```

Setiap modul terdiri dari: `route.js` → `controller.js` → `service.js` → `model.js`

## 📦 Prasyarat

- **Node.js** ≥ 20.19.0 atau ≥ 22.12.0
- **PostgreSQL** ≥ 12
- **npm** atau **bun**

## 🚀 Instalasi

```bash
git clone <repository-url>
cd system-internal-company
```

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

## ⚙️ Konfigurasi

### Database

```sql
CREATE DATABASE company_internal_db;
```

Jalankan migrasi Prisma:
```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

Isi data awal (opsional):
```bash
npx prisma db seed
```

### Environment Variables

#### Backend — `server/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=company_internal_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# CORS
CLIENT_URL=http://localhost:5173

# Lokasi Kantor (untuk validasi GPS check-in)
OFFICE_LATITUDE=-6.200000
OFFICE_LONGITUDE=106.816666
OFFICE_RADIUS_METERS=100

# Jam Kerja (default, bisa diubah via Admin Settings)
WORK_START_TIME=08:30
WORK_END_TIME=16:30
LATE_TOLERANCE_MINUTES=15
EARLY_CHECKIN_MAX_HOURS=3
LATE_CHECKIN_MAX_HOURS=4
MIN_WORK_DURATION_HOURS=4
```

#### Frontend — `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🎯 Menjalankan Aplikasi

### Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Production

```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
npm run preview
```

## 📁 Struktur Project

```
system-internal-company/
├── client/                          # Vue.js Frontend
│   ├── src/
│   │   ├── assets/                  # CSS global, fonts
│   │   ├── components/
│   │   │   └── layout/              # AppLayout, AppSidebar, AppTopbar
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── AttendanceView.vue
│   │   │   ├── LeaveView.vue
│   │   │   ├── SalaryView.vue
│   │   │   ├── ScheduleView.vue
│   │   │   ├── SupportView.vue
│   │   │   ├── ProfileView.vue
│   │   │   └── admin/
│   │   │       ├── AdminDashboardView.vue
│   │   │       ├── AdminAttendanceView.vue
│   │   │       ├── AdminReportView.vue
│   │   │       ├── AdminLeaveView.vue
│   │   │       ├── AdminPayrollView.vue
│   │   │       ├── AdminAuditView.vue
│   │   │       ├── AdminSettingsView.vue
│   │   │       └── AdminUsersView.vue
│   │   ├── stores/                  # Pinia stores (auth)
│   │   ├── services/                # Axios API service
│   │   └── router/                  # Vue Router
│   └── package.json
│
└── server/                          # Express.js Backend
    ├── prisma/
    │   ├── schema.prisma            # Database schema
    │   ├── migrations/              # Prisma migrations
    │   └── seed.js                  # Data seeder
    ├── src/
    │   ├── config/
    │   │   ├── app.js               # App configuration
    │   │   └── database.js          # Prisma client
    │   ├── modules/                 # Feature modules
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── attendance/
    │   │   ├── attendance-config/
    │   │   ├── leave/
    │   │   ├── payroll/
    │   │   ├── notification/
    │   │   └── audit/
    │   └── shared/
    │       ├── middlewares/         # auth, rbac, validate, errorHandler, rateLimiter
    │       └── utils/               # logger, response helper, GPS helper
    ├── index.js
    └── package.json
```

## 📚 API Documentation

**Base URL:** `http://localhost:3000/api`

### Health Check
```
GET /health
```

### Auth
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/auth/login` | Public | Login |
| GET | `/auth/me` | Auth | Profil saya |
| PUT | `/auth/profile` | Auth | Update profil |
| PUT | `/auth/change-password` | Auth | Ganti password |

### Users
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/users/colleagues` | Auth | Daftar rekan kerja aktif |
| GET | `/users` | Admin | Semua user |
| POST | `/users` | Admin | Buat user baru |
| GET | `/users/:id` | Admin | Detail user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Hapus user |
| PUT | `/users/:id/reset-password` | Admin | Reset password |

### Attendance
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/attendance/check-in` | Auth | Check-in (GPS) |
| POST | `/attendance/check-out` | Auth | Check-out (GPS) |
| GET | `/attendance/check-location` | Auth | Validasi lokasi |
| GET | `/attendance/me/today` | Auth | Kehadiran hari ini |
| GET | `/attendance/me` | Auth | Riwayat kehadiran saya |
| GET | `/attendance` | Auth | Semua kehadiran |
| GET | `/attendance/report` | Auth | Laporan bulanan |

### Leave
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/leave` | Auth | Ajukan izin/cuti |
| GET | `/leave/me` | Auth | Izin saya |
| DELETE | `/leave/:id` | Auth | Batalkan izin |
| GET | `/leave` | Admin | Semua pengajuan |
| PUT | `/leave/:id/review` | Admin | Approve/reject |

### Payroll
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/payroll/my-slip` | Auth | Slip gaji saya (`?month=&year=`) |
| GET | `/payroll/slips` | Admin | Semua slip tersimpan |
| POST | `/payroll/generate` | Admin | Generate slip bulan ini |
| GET | `/payroll/config` | Admin | Konfigurasi payroll |
| PUT | `/payroll/config` | Admin | Update konfigurasi |
| GET | `/payroll/overtime` | Admin | Record lembur |
| PUT | `/payroll/overtime/:id/approve` | Admin | Approve lembur |
| PUT | `/payroll/overtime/:id/reject` | Admin | Reject lembur |
| GET | `/payroll/employee-salaries` | Admin | Gaji semua karyawan |
| PUT | `/payroll/employee-salaries/:userId` | Admin | Atur gaji karyawan |

### Notifications
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/notifications` | Auth | Notifikasi saya |
| PUT | `/notifications/read-all` | Auth | Tandai semua dibaca |

## 🗄 Database Schema

Model utama dalam `prisma/schema.prisma`:

| Model | Deskripsi |
|-------|-----------|
| `User` | Data karyawan dan akun |
| `Attendance` | Record check-in/check-out |
| `AttendanceConfig` | Konfigurasi jam kerja |
| `LeaveRequest` | Pengajuan izin/cuti |
| `PayrollConfig` | Konfigurasi perhitungan gaji |
| `EmployeeSalary` | Gaji pokok per karyawan |
| `SalaryComponent` | Komponen gaji (tunjangan, potongan) |
| `OvertimeRecord` | Record lembur |
| `PayrollPeriod` | Periode penggajian |
| `Payroll` | Slip gaji tersimpan |
| `Notification` | Notifikasi in-app |
| `AuditLog` | Log aktivitas sistem |

## 🧪 Testing

```bash
# Unit tests (frontend)
cd client
npm run test:unit

# E2E tests (frontend)
cd client
npm run test:e2e

# Type check
cd client
npm run type-check
```

## 🤝 Kontribusi

### Commit Convention

```
feat: tambah fitur baru
fix: perbaikan bug
docs: update dokumentasi
style: formatting kode
refactor: refactoring
test: tambah/update test
chore: maintenance
```

### Development Workflow

1. Buat branch dari `main`: `git checkout -b feat/nama-fitur`
2. Commit perubahan
3. Push dan buat Pull Request

---

**Last Updated:** Mei 2026
