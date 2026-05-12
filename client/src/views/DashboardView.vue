<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import {} from 'vue'

const today = new Date()
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const dateStr = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`

const recentAttendance = [
  { date: '23 Mei 2024', masuk: '07:55', pulang: '17:05', status: 'Hadir', note: '-' },
  { date: '22 Mei 2024', masuk: '08:15', pulang: '17:00', status: 'Terlambat', note: 'Macet total di Tol' },
  { date: '21 Mei 2024', masuk: '07:48', pulang: '17:15', status: 'Hadir', note: '-' },
  { date: '20 Mei 2024', masuk: '07:58', pulang: '17:02', status: 'Hadir', note: '-' },
  { date: '19 Mei 2024', masuk: '08:02', pulang: '17:30', status: 'Hadir', note: 'Lembur meeting client' },
]

const announcements = [
  { title: 'Update Kebijakan WFO', desc: 'Mulai Juni, kehadiran di kantor minimal 3 hari seminggu.', time: '2 jam yang lalu', type: 'blue' },
  { title: 'Maintenance System', desc: 'Portal akan offline pada Sabtu, 25 Mei pukul 22:00 WIB.', time: '1 hari yang lalu', type: 'orange' },
]

const statusBadge = (s: string) => {
  if (s === 'Hadir') return 'badge badge-green'
  if (s === 'Terlambat') return 'badge badge-orange'
  return 'badge badge-red'
}
</script>

<template>
  <AppLayout>
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-date">{{ dateStr }}</div>
        <h1 class="hero-greeting">Halo, Budi!</h1>
        <p class="hero-sub">Jangan lupa untuk mencatat kehadiran Anda hari ini. Tetap produktif dan jaga kesehatan!</p>
      </div>
      <div class="hero-actions">
        <button class="absen-btn absen-masuk">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Absen Masuk
        </button>
        <button class="absen-btn absen-pulang">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Absen Pulang
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <span class="stat-badge">+2 hari</span>
        </div>
        <div class="stat-label">Total Kehadiran</div>
        <div class="stat-value">18 hari</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 72%"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <span class="stat-badge blue">Bulan Ini</span>
        </div>
        <div class="stat-label">Gaji Bulan Ini</div>
        <div class="stat-value salary">Rp 5.420.000</div>
        <div class="stat-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Estimasi sebelum pajak & bonus
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <span class="stat-badge orange">Aktif</span>
        </div>
        <div class="stat-label">Jadwal Kerja</div>
        <div class="stat-value shift">Shift Pagi</div>
        <div class="stat-note">08:00 WIB - 17:00 WIB</div>
      </div>
    </div>

    <div class="bottom-grid">
      <div class="card">
        <div class="card-header">
          <h3>Riwayat Kehadiran Terakhir</h3>
          <a href="#" class="card-link">Lihat Semua</a>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Masuk</th>
              <th>Pulang</th>
              <th>Status</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in recentAttendance" :key="row.date">
              <td>{{ row.date }}</td>
              <td>{{ row.masuk }}</td>
              <td>{{ row.pulang }}</td>
              <td><span :class="statusBadge(row.status)">{{ row.status }}</span></td>
              <td class="note-cell">{{ row.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="side-panel">
        <div class="card">
          <h3 class="card-title-sm">Aksi Cepat</h3>
          <div class="quick-actions">
            <button class="quick-action-item">
              <div class="qa-icon blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span>Lihat Jadwal</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
            <button class="quick-action-item">
              <div class="qa-icon green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <span>Izin / Cuti</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
            <button class="quick-action-item">
              <div class="qa-icon orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <span>Slip Gaji</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title-sm">Pengumuman</h3>
          <div class="announcements">
            <div v-for="ann in announcements" :key="ann.title" class="announcement-item" :class="`border-${ann.type}`">
              <div class="ann-title">{{ ann.title }}</div>
              <div class="ann-desc">{{ ann.desc }}</div>
              <div class="ann-time">{{ ann.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="fab">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </AppLayout>
</template>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 60%, #1E40AF 100%);
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}

.hero-banner::after {
  content: '';
  position: absolute;
  bottom: -60px; right: 80px;
  width: 220px; height: 220px;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
}

.hero-date { font-size: 12.5px; color: rgba(255,255,255,0.65); margin-bottom: 4px; }
.hero-greeting { font-size: 28px; font-weight: 800; color: white; margin-bottom: 6px; }
.hero-sub { font-size: 13.5px; color: rgba(255,255,255,0.75); max-width: 380px; line-height: 1.5; }

.hero-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  z-index: 1;
}

.absen-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: var(--radius);
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
}

.absen-masuk {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1.5px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(8px);
}

.absen-masuk:hover {
  background: rgba(255,255,255,0.3);
}

.absen-pulang {
  background: white;
  color: var(--primary-dark);
  border: 1.5px solid white;
}

.absen-pulang:hover {
  background: var(--gray-50);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid var(--gray-200);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon.green { background: var(--green-light); color: var(--green); }
.stat-icon.blue { background: var(--primary-light); color: var(--primary); }
.stat-icon.orange { background: var(--orange-light); color: var(--orange); }

.stat-badge {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--green);
}
.stat-badge.blue { color: var(--primary); }
.stat-badge.orange { color: var(--orange); }

.stat-label { font-size: 12.5px; color: var(--gray-500); margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
.stat-value.salary { font-size: 18px; }
.stat-value.shift { font-size: 18px; }
.stat-note { font-size: 11.5px; color: var(--gray-400); display: flex; align-items: center; gap: 4px; }

.progress-bar {
  height: 5px;
  background: var(--gray-100);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--green);
  border-radius: 99px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
}

.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid var(--gray-200);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--gray-800);
}

.card-link {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--primary);
}

.card-title-sm {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 12px;
  border-bottom: 1px solid var(--gray-100);
}

.data-table td {
  padding: 13px 12px;
  font-size: 13px;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-100);
}

.data-table tr:last-child td { border-bottom: none; }

.note-cell { color: var(--gray-400); font-size: 12.5px; }

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
  background: white;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--gray-700);
  transition: all 0.15s;
  text-align: left;
}

.quick-action-item:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.quick-action-item svg:last-child {
  margin-left: auto;
  color: var(--gray-300);
}

.quick-action-item:hover svg:last-child { color: var(--primary); }

.qa-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-icon.blue { background: var(--primary-light); color: var(--primary); }
.qa-icon.green { background: var(--green-light); color: var(--green); }
.qa-icon.orange { background: var(--orange-light); color: var(--orange); }

.announcements {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.announcement-item {
  padding: 12px;
  border-radius: var(--radius);
  background: var(--gray-50);
  border-left: 3px solid;
}

.border-blue { border-color: var(--primary); }
.border-orange { border-color: var(--orange); }

.ann-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 3px;
}

.ann-desc {
  font-size: 12px;
  color: var(--gray-500);
  line-height: 1.4;
  margin-bottom: 5px;
}

.ann-time {
  font-size: 11px;
  color: var(--gray-400);
}

.fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(37,99,235,0.4);
  border: none;
  transition: all 0.2s;
  z-index: 100;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(37,99,235,0.5);
}
</style>
