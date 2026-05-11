# Office Internal Management System

Sistem manajemen internal perusahaan berbasis web yang dibangun dengan Vue.js dan Express.js untuk mengelola kehadiran, tugas, penggajian, dan jadwal karyawan.

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
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

## ✨ Fitur Utama

- **Manajemen Kehadiran** - Pencatatan dan monitoring kehadiran karyawan
- **Manajemen Tugas** - Pengelolaan task dan assignment karyawan
- **Sistem Penggajian** - Perhitungan dan manajemen payroll
- **Penjadwalan** - Pengaturan jadwal kerja dan shift
- **Autentikasi & Otorisasi** - Sistem login dengan role-based access control
- **Dashboard Analytics** - Visualisasi data dan reporting

## 🛠 Teknologi

### Frontend
- **Vue.js 3** - Progressive JavaScript Framework
- **Pinia** - State Management
- **Vue Router** - Routing
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Vitest** - Unit Testing
- **Playwright** - E2E Testing

### Backend
- **Node.js** - Runtime Environment
- **Express.js 5** - Web Framework
- **PostgreSQL** - Database
- **dotenv** - Environment Configuration

### Development Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Oxlint** - Fast Linter

## 🏗 Arsitektur Sistem

Aplikasi ini menggunakan arsitektur **modular monolith** dengan pemisahan yang jelas antara frontend dan backend:

```
┌─────────────────┐
│   Vue.js SPA    │  ← Frontend (Port 5173)
└────────┬────────┘
         │ HTTP/REST API
┌────────▼────────┐
│   Express.js    │  ← Backend (Port 3000)
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │  ← Database (Port 5432)
└─────────────────┘
```

### Backend Architecture Pattern

Backend menggunakan **layered architecture** dengan struktur modular:

- **Routes** - Endpoint definitions
- **Controllers** - Request handling & validation
- **Services** - Business logic
- **Models** - Data access layer
- **Middlewares** - Cross-cutting concerns (auth, validation, error handling)

## 📦 Prasyarat

Pastikan sistem Anda telah terinstall:

- **Node.js** >= 20.19.0 atau >= 22.12.0
- **npm** atau **bun** (package manager)
- **PostgreSQL** >= 12
- **Git**

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd system-internal-company
```

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
# atau menggunakan bun
bun install
```

## ⚙️ Konfigurasi

### Database Setup

1. Buat database PostgreSQL:
```sql
CREATE DATABASE company_internal_db;
```

2. Jalankan migrations (jika tersedia):
```bash
cd server
npm run migrate
```

### Environment Variables

#### Backend (.env)

Buat file `.env` di folder `server/`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=company_internal_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
```

#### Frontend (.env)

Buat file `.env` di folder `client/` (jika diperlukan):

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🎯 Menjalankan Aplikasi

### Development Mode

#### 1. Jalankan Backend
```bash
cd server
npm run dev
```
Server akan berjalan di `http://localhost:3000`

#### 2. Jalankan Frontend
```bash
cd client
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`

### Production Build

#### Backend
```bash
cd server
npm start
```

#### Frontend
```bash
cd client
npm run build
npm run preview
```

## 📁 Struktur Project

```
system-internal-company/
├── client/                          # Vue.js Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, fonts, styles
│   │   ├── components/              # Reusable components
│   │   │   ├── common/              # Button, Modal, Table, Form
│   │   │   └── layout/              # Navbar, Sidebar, Footer
│   │   ├── views/                   # Page components
│   │   │   ├── attendance/          # Attendance pages
│   │   │   ├── tasks/               # Task management pages
│   │   │   ├── payroll/             # Payroll pages
│   │   │   └── schedule/            # Schedule pages
│   │   ├── stores/                  # Pinia state management
│   │   │   ├── auth.store.ts
│   │   │   ├── attendance.store.ts
│   │   │   ├── tasks.store.ts
│   │   │   ├── payroll.store.ts
│   │   │   └── schedule.store.ts
│   │   ├── services/                # API service layer
│   │   │   ├── api.service.ts       # Axios instance
│   │   │   ├── attendance.service.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── payroll.service.ts
│   │   │   └── schedule.service.ts
│   │   ├── router/                  # Vue Router config
│   │   ├── composables/             # Vue 3 composables
│   │   ├── utils/                   # Helper functions
│   │   └── main.ts                  # App entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection
│   │   │   └── app.js               # Express app setup
│   │   │
│   │   ├── modules/                 # Feature modules
│   │   │   ├── attendance/
│   │   │   │   ├── attendance.route.js
│   │   │   │   ├── attendance.controller.js
│   │   │   │   ├── attendance.service.js
│   │   │   │   └── attendance.model.js
│   │   │   ├── tasks/
│   │   │   ├── payroll/
│   │   │   ├── schedule/
│   │   │   └── users/
│   │   │
│   │   └── shared/                  # Shared resources
│   │       ├── middlewares/
│   │       │   ├── auth.middleware.js
│   │       │   ├── rbac.middleware.js
│   │       │   ├── validate.middleware.js
│   │       │   ├── rateLimitter.middleware.js
│   │       │   └── errorHandler.middleware.js
│   │       ├── services/
│   │       │   ├── auth.service.js
│   │       │   ├── notification.service.js
│   │       │   ├── file.service.js
│   │       │   ├── report.service.js
│   │       │   └── auditLog.service.js
│   │       └── utils/
│   │           ├── logger.js
│   │           ├── pagination.js
│   │           └── response.helper.js
│   │
│   ├── index.js                     # Server entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-11T13:48:45.268Z"
}
```

### Module Endpoints

#### Attendance
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Create attendance record
- `GET /api/attendance/:id` - Get specific attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

#### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll
- `GET /api/payroll/:id` - Get specific payroll
- `PUT /api/payroll/:id` - Update payroll

#### Schedule
- `GET /api/schedule` - Get schedules
- `POST /api/schedule` - Create schedule
- `GET /api/schedule/:id` - Get specific schedule
- `PUT /api/schedule/:id` - Update schedule
- `DELETE /api/schedule/:id` - Delete schedule

#### Users
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user

## 🧪 Testing

### Frontend Testing

#### Unit Tests
```bash
cd client
npm run test:unit
```

#### E2E Tests
```bash
cd client
npm run test:e2e
```

### Backend Testing
```bash
cd server
npm test
```

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update database credentials
- [ ] Configure CORS settings
- [ ] Enable SSL/TLS
- [ ] Set up reverse proxy (nginx)
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Enable database backups
- [ ] Configure environment variables

### Docker Deployment (Coming Soon)

```bash
docker-compose up -d
```

## 🤝 Kontribusi

### Development Workflow

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 👥 Team

Developed by Internal Development Team

## 📞 Support

Untuk pertanyaan atau dukungan, silakan hubungi tim development atau buat issue di repository.

---

**Last Updated:** May 2026
