<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'

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
  if (s === 'Hadir') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700'
  if (s === 'Terlambat') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600'
  return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600'
}
</script>

<template>
  <AppLayout>

    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-8 py-7 flex items-center justify-between gap-6 mb-5">
      <div class="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/[0.06] pointer-events-none"></div>
      <div class="absolute -bottom-14 right-20 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none"></div>

      <div class="relative z-10">
        <p class="text-[12.5px] text-white/65 mb-1">{{ dateStr }}</p>
        <h1 class="text-[28px] font-extrabold text-white mb-1.5">Halo, Budi!</h1>
        <p class="text-[13.5px] text-white/75 max-w-sm leading-relaxed">
          Jangan lupa untuk mencatat kehadiran Anda hari ini. Tetap produktif dan jaga kesehatan!
        </p>
      </div>

      <div class="relative z-10 flex gap-3 shrink-0">
        <button class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-white/20 border border-white/35 backdrop-blur-sm hover:bg-white/30 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Absen Masuk
        </button>
        <button class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-blue-800 bg-white border border-white hover:bg-gray-50 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Absen Pulang
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-5">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3.5">
          <div class="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <span class="text-[11.5px] font-semibold text-green-600">+2 hari</span>
        </div>
        <p class="text-[12.5px] text-gray-500 mb-1">Total Kehadiran</p>
        <p class="text-[22px] font-bold text-gray-800 mb-2">18 hari</p>
        <div class="h-[5px] bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 rounded-full" style="width: 72%"></div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3.5">
          <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <span class="text-[11.5px] font-semibold text-blue-600">Bulan Ini</span>
        </div>
        <p class="text-[12.5px] text-gray-500 mb-1">Gaji Bulan Ini</p>
        <p class="text-[18px] font-bold text-gray-800 mb-2">Rp 5.420.000</p>
        <p class="text-[11.5px] text-gray-400 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Estimasi sebelum pajak & bonus
        </p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3.5">
          <div class="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <span class="text-[11.5px] font-semibold text-orange-500">Aktif</span>
        </div>
        <p class="text-[12.5px] text-gray-500 mb-1">Jadwal Kerja</p>
        <p class="text-[18px] font-bold text-gray-800 mb-2">Shift Pagi</p>
        <p class="text-[11.5px] text-gray-400">08:00 WIB - 17:00 WIB</p>
      </div>
    </div>

    <div class="grid gap-4" style="grid-template-columns: 1fr 300px;">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[14.5px] font-bold text-gray-800">Riwayat Kehadiran Terakhir</h3>
          <a href="#" class="text-[12.5px] font-semibold text-blue-600 hover:underline">Lihat Semua</a>
        </div>
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">Tanggal</th>
              <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">Masuk</th>
              <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">Pulang</th>
              <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">Status</th>
              <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in recentAttendance" :key="row.date" class="last:[&>td]:border-0">
              <td class="px-3 py-3.5 text-[13px] text-gray-700 border-b border-gray-100">{{ row.date }}</td>
              <td class="px-3 py-3.5 text-[13px] text-gray-700 border-b border-gray-100">{{ row.masuk }}</td>
              <td class="px-3 py-3.5 text-[13px] text-gray-700 border-b border-gray-100">{{ row.pulang }}</td>
              <td class="px-3 py-3.5 border-b border-gray-100">
                <span :class="statusBadge(row.status)">{{ row.status }}</span>
              </td>
              <td class="px-3 py-3.5 text-[12.5px] text-gray-400 border-b border-gray-100">{{ row.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-[14px] font-bold text-gray-800 mb-3.5">Aksi Cepat</h3>
          <div class="flex flex-col gap-2">
            <button class="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 bg-white text-[13.5px] font-medium text-gray-700 text-left transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 group">
              <div class="w-[34px] h-[34px] rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span>Lihat Jadwal</span>
              <svg class="ml-auto text-gray-300 group-hover:text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </button>

            <button class="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 bg-white text-[13.5px] font-medium text-gray-700 text-left transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 group">
              <div class="w-[34px] h-[34px] rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <span>Izin / Cuti</span>
              <svg class="ml-auto text-gray-300 group-hover:text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </button>

            <button class="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 bg-white text-[13.5px] font-medium text-gray-700 text-left transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 group">
              <div class="w-[34px] h-[34px] rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <span>Slip Gaji</span>
              <svg class="ml-auto text-gray-300 group-hover:text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-[14px] font-bold text-gray-800 mb-3.5">Pengumuman</h3>
          <div class="flex flex-col gap-2.5">
            <div
              v-for="ann in announcements"
              :key="ann.title"
              class="p-3 rounded-lg bg-gray-50 border-l-[3px]"
              :class="ann.type === 'blue' ? 'border-blue-600' : 'border-orange-500'"
            >
              <p class="text-[13px] font-semibold text-gray-800 mb-0.5">{{ ann.title }}</p>
              <p class="text-[12px] text-gray-500 leading-snug mb-1.5">{{ ann.desc }}</p>
              <p class="text-[11px] text-gray-400">{{ ann.time }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- FAB -->
    <button class="fixed bottom-7 right-7 w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,0.4)] border-0 transition-all hover:scale-105 hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] z-50"
      style="width: 52px; height: 52px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

  </AppLayout>
</template>