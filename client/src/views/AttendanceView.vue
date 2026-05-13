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
  if (s === 'Hadir') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700'
  if (s === 'Terlambat') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700'
  if (s === 'Izin Pulang Awal') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700'
  return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700'
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
    <div class="flex items-start justify-between mb-5">
      <div>
        <h1 class="text-[22px] font-extrabold text-gray-800">Absensi Hari Ini</h1>
        <p class="text-[13px] text-gray-400 mt-0.5">{{ todayStr }}</p>
      </div>
      <button class="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-600 transition-all duration-150 hover:border-blue-500 hover:text-blue-500">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Export to PDF
      </button>
    </div>

    <div class="grid grid-cols-[1fr_320px] gap-4 mb-5">
      <div class="bg-white rounded-2xl p-7 border border-gray-200">
        <div class="flex items-center gap-2 mb-2.5">
          <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span class="text-[11px] font-bold text-gray-400 tracking-widest">STATUS SEKARANG</span>
        </div>

        <h2
          class="text-[36px] font-extrabold mb-5 transition-colors duration-300"
          :class="checkedIn ? 'text-emerald-500' : 'text-gray-800'"
        >
          {{ checkedIn ? (checkedOut ? 'Selesai' : 'Sudah Absen Masuk') : 'Belum Absen' }}
        </h2>

        <div class="flex gap-8 mb-6">
          <div>
            <div class="text-[12px] text-gray-400 mb-0.5">Jadwal Masuk</div>
            <div class="text-[17px] font-bold text-gray-700 font-mono">08:00 WIB</div>
          </div>
          <div>
            <div class="text-[12px] text-gray-400 mb-0.5">Jadwal Pulang</div>
            <div class="text-[17px] font-bold text-gray-700 font-mono">17:00 WIB</div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex items-center gap-2 px-[22px] py-[13px] rounded-lg text-[14px] font-semibold border-none transition-all duration-200"
            :class="checkedIn
              ? 'bg-emerald-500 text-white opacity-50 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:bg-emerald-600'"
            :disabled="checkedIn"
            @click="handleCheckin"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Absen Masuk
          </button>

          <button
            class="flex items-center gap-2 px-[22px] py-[13px] rounded-lg text-[14px] font-semibold border-none transition-all duration-200"
            :class="checkedOut
              ? 'bg-gray-700 text-white opacity-50 cursor-not-allowed'
              : !checkedIn
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-800'"
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

      <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-7 flex flex-col gap-1.5 relative overflow-hidden">
        <div class="absolute -top-7 -right-7 w-[120px] h-[120px] bg-white/[0.08] rounded-full pointer-events-none"></div>
        <div class="text-[11px] text-white/60 font-medium tracking-wide uppercase">Real-time Clock</div>
        <div class="text-[42px] font-extrabold text-white font-mono leading-none my-1">{{ timeStr() }}</div>
        <div class="text-[12.5px] text-white/65">Waktu Indonesia Barat (WIB)</div>
        <div class="flex items-center gap-1.5 mt-4 bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 text-white text-[12.5px] font-medium w-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          GPS Verified: Office Area
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex items-start justify-between mb-5">
        <div>
          <h3 class="text-[15px] font-bold text-gray-800">Riwayat Absensi (Bulan Ini)</h3>
          <div class="text-[12px] text-gray-400 mt-0.5">Mei 2026</div>
        </div>
        <select v-model="currentMonth" class="border border-gray-200 rounded-md px-3 py-1.5 text-[13px] text-gray-700 outline-none cursor-pointer">
          <option>Mei 2026</option>
          <option>April 2026</option>
          <option>Maret 2026</option>
        </select>
      </div>

      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-100">Date</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-100">Clock In</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-100">Clock Out</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-100">Status</th>
            <th class="text-left text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-100">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in attendanceHistory" :key="row.date" class="last:[&>td]:border-b-0">
            <td class="px-4 py-[15px] text-[13.5px] text-gray-700 border-b border-gray-100">{{ row.date }}</td>
            <td class="px-4 py-[15px] text-[13.5px] text-gray-700 border-b border-gray-100">{{ row.clockIn }}</td>
            <td class="px-4 py-[15px] text-[13.5px] text-gray-700 border-b border-gray-100">{{ row.clockOut }}</td>
            <td class="px-4 py-[15px] border-b border-gray-100">
              <span :class="statusBadge(row.status)">{{ row.status }}</span>
            </td>
            <td class="px-4 py-[15px] border-b border-gray-100">
              <a href="#" class="text-blue-600 font-semibold text-[13px] hover:underline">Details</a>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-1">
        <span class="text-[12.5px] text-gray-400">Showing 5 of 21 entries</span>
        <div class="flex gap-1">
          <button
            class="w-8 h-8 rounded-md border border-gray-200 bg-white text-[13px] text-gray-600 flex items-center justify-center transition-all duration-150 hover:border-blue-500 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            class="w-8 h-8 rounded-md border text-[13px] flex items-center justify-center transition-all duration-150"
            :class="currentPage === p
              ? 'bg-blue-600 border-blue-600 text-white font-semibold'
              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-500'"
            @click="currentPage = p"
          >{{ p }}</button>

          <button
            class="w-8 h-8 rounded-md border border-gray-200 bg-white text-[13px] text-gray-600 flex items-center justify-center transition-all duration-150 hover:border-blue-500 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>