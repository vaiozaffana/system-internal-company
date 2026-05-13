<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => clearInterval(timer))

const pad = (n: number) => String(n).padStart(2, '0')
const timeStr = () => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`

const today = new Date()
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const todayStr = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`

const checkedIn = ref(false)
const checkedOut = ref(false)

const handleCheckin = () => { checkedIn.value = true }
const handleCheckout = () => { if (checkedIn.value) checkedOut.value = true }

const statusBadge = (s: string) => {
  if (s === 'Hadir') return 'inline-flex items-center px-3 py-1 rounded-md text-[13px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-600'
  if (s === 'Terlambat') return 'inline-flex items-center px-3 py-1 rounded-md text-[13px] font-semibold bg-transparent text-orange-500'
  if (s === 'Izin Pulang Awal') return 'inline-flex items-center px-3 py-1 rounded-md text-[13px] font-semibold bg-transparent text-red-500'
  return 'inline-flex items-center px-3 py-1 rounded-md text-[13px] font-semibold bg-blue-50 text-blue-600'
}

const attendanceHistory = [
  { date: 'Jumat, 08 Mei 2026', clockIn: '07:55 WIB', clockOut: '17:05 WIB', status: 'Hadir' },
  { date: 'Kamis, 07 Mei 2026', clockIn: '08:15 WIB', clockOut: '17:02 WIB', status: 'Terlambat' },
  { date: 'Rabu, 06 Mei 2026', clockIn: '07:48 WIB', clockOut: '17:10 WIB', status: 'Hadir' },
  { date: 'Selasa, 05 Mei 2026', clockIn: '08:00 WIB', clockOut: '15:00 WIB', status: 'Izin Pulang Awal' },
  { date: 'Senin, 04 Mei 2026', clockIn: '07:58 WIB', clockOut: '17:05 WIB', status: 'Hadir' },
]

const currentMonth = ref('Mei 2026')
const currentPage = ref(1)
const totalPages = 3
</script>

<template>
  <AppLayout>
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-[28px] font-bold text-gray-900 leading-tight">Absensi Hari Ini</h1>
        <p class="text-[14px] text-gray-400 mt-0.5">{{ todayStr }}</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-600 transition-all duration-150 hover:border-blue-400 hover:text-blue-600 shadow-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
        Export to PDF
      </button>
    </div>

    <div class="flex gap-4 mb-5">
      <div class="flex-1 bg-white rounded-2xl border border-gray-200 p-7 flex items-center justify-between shadow-sm">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            <span class="text-[11px] font-bold text-gray-400 tracking-[0.12em] uppercase">STATUS SEKARANG</span>
          </div>
          <h2 class="text-[38px] font-bold leading-tight text-gray-900 transition-colors duration-300">
            {{ checkedIn ? (checkedOut ? 'Selesai' : 'Sudah Absen Masuk') : 'Belum Absen' }}
          </h2>
          <div class="flex gap-10 mt-3">
            <div>
              <div class="text-[12px] text-gray-400 mb-0.5">Jadwal Masuk</div>
              <div class="text-[15px] font-semibold text-gray-700">08:00 WIB</div>
            </div>
            <div>
              <div class="text-[12px] text-gray-400 mb-0.5">Jadwal Pulang</div>
              <div class="text-[15px] font-semibold text-gray-700">17:00 WIB</div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 min-w-[200px]">
          <button
            class="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
            :class="checkedIn
              ? 'bg-emerald-500 text-white opacity-50 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] hover:-translate-y-0.5'"
            :disabled="checkedIn"
            @click="handleCheckin"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Absen Masuk
          </button>

          <button
            class="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
            :class="checkedOut
              ? 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed border border-gray-200'
              : !checkedIn
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:bg-gray-50'"
            :disabled="!checkedIn || checkedOut"
            @click="handleCheckout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Absen Pulang
          </button>
        </div>
      </div>

      <div class="w-[280px] bg-[#1a56db] rounded-2xl p-7 flex flex-col gap-1 relative overflow-hidden shadow-lg shadow-blue-200">
        <div class="absolute -top-10 -right-10 w-36 h-36 bg-white/[0.07] rounded-full pointer-events-none"></div>
        <div class="absolute bottom-2 -left-8 w-24 h-24 bg-white/[0.05] rounded-full pointer-events-none"></div>

        <div class="text-[11px] text-white/60 font-medium tracking-widest uppercase mb-1">Real-time Clock</div>
        <div class="text-[44px] font-bold text-white font-mono leading-none tracking-tight">{{ timeStr() }}</div>
        <div class="text-[12.5px] text-white/60 mt-1">Waktu Indonesia Barat (WIB)</div>
        <div class="flex items-center gap-2 mt-5 bg-white/[0.12] border border-white/20 rounded-full px-3.5 py-1.5 text-white text-[12px] font-medium w-fit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          GPS Verified: Office Area
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h3 class="text-[16px] font-bold text-gray-900">Riwayat Absensi (Bulan Ini)</h3>
          <div class="text-[13px] text-gray-400 mt-0.5">Mei 2026</div>
        </div>
        <select v-model="currentMonth" class="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 outline-none cursor-pointer bg-white shadow-sm">
          <option>Mei 2026</option>
          <option>April 2026</option>
          <option>Maret 2026</option>
        </select>
      </div>

      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50/70">
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Date</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Clock In</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Clock Out</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Status</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3.5">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="row in attendanceHistory"
            :key="row.date"
            class="hover:bg-gray-50/50 transition-colors duration-100"
          >
            <td class="px-6 py-4 text-[14px] text-gray-700 font-medium">{{ row.date }}</td>
            <td class="px-6 py-4 text-[14px] text-gray-600">{{ row.clockIn }}</td>
            <td class="px-6 py-4 text-[14px] text-gray-600">{{ row.clockOut }}</td>
            <td class="px-6 py-4">
              <span :class="statusBadge(row.status)">{{ row.status }}</span>
            </td>
            <td class="px-6 py-4">
              <a href="#" class="text-blue-600 font-semibold text-[13px] hover:text-blue-700 hover:underline">Details</a>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <span class="text-[13px] text-gray-400">Showing 5 of 21 entries</span>
        <div class="flex items-center gap-1">
          <button
            class="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center transition-all duration-150 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,18 9,12 15,6"/></svg>
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            class="w-8 h-8 rounded-lg border text-[13px] font-semibold flex items-center justify-center transition-all duration-150"
            :class="currentPage === p
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'"
            @click="currentPage = p"
          >{{ p }}</button>

          <button
            class="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center transition-all duration-150 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
          </button>
        </div>
      </div>
    </div>

  </AppLayout>
</template>