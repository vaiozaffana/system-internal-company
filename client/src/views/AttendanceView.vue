<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  LogIn,
  LogOut,
  MapPin,
  MapPinOff,
  MapPinned,
  FileDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAttendanceStore } from '@/stores/attendance.store'
import { attendanceService, getCurrentPosition } from '@/services/attendance.service'

const store = useAttendanceStore()

const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

const pageSize = 5
const currentPage = ref(1)

const WORK_START = computed(() => `${store.config.workStartTime} WIB`)
const WORK_END = computed(() => `${store.config.workEndTime} WIB`)

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const formatIndonesianDate = (date: Date) => {
  const d = dayNames[date.getDay()]
  return `${d}, ${date.getDate().toString().padStart(2, '0')} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

const formatIndonesianTime = (date: Date) => {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

const formatShortTime = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`
}

const todayLabel = computed(() => formatIndonesianDate(now.value))
const clockLabel = computed(() => formatIndonesianTime(now.value))
const currentMonthLabel = computed(
  () => `${monthNames[now.value.getMonth()]} ${now.value.getFullYear()}`,
)

const statusLabel = computed(() => {
  switch (store.currentStatus) {
    case 'checked-in':
      return 'Sudah Absen Masuk'
    case 'checked-out':
      return 'Sudah Pulang'
    default:
      return 'Belum Absen'
  }
})

const statusDotColor = computed(() => {
  switch (store.currentStatus) {
    case 'checked-in':
      return 'bg-[#006c49]'
    case 'checked-out':
      return 'bg-[#424754]'
    default:
      return 'bg-[#ba1a1a]'
  }
})

type StatusTone =
  | 'present'
  | 'late'
  | 'early-leave'
  | 'late-and-early-leave'
  | 'absent'
  | 'default'

const statusStyles: Record<StatusTone, { bg: string; text: string }> = {
  present: { bg: 'bg-[rgba(108,248,187,0.2)]', text: 'text-[#006c49]' },
  late: { bg: 'bg-[rgba(255,220,198,0.2)]', text: 'text-[#924700]' },
  'early-leave': { bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]' },
  'late-and-early-leave': { bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]' },
  absent: { bg: 'bg-[rgba(186,26,26,0.1)]', text: 'text-[#ba1a1a]' },
  default: { bg: 'bg-[#e1e2ec]', text: 'text-[#424754]' },
}

const resolveStatus = (raw: string | null): { tone: StatusTone; label: string } => {
  const value = (raw ?? '').toLowerCase()
  if (value === 'late') return { tone: 'late', label: 'Terlambat' }
  if (value === 'early-leave' || value === 'early_leave') {
    return { tone: 'early-leave', label: 'Izin Pulang Awal' }
  }
  if (value === 'late-and-early-leave') {
    return { tone: 'late-and-early-leave', label: 'Terlambat & Pulang Awal' }
  }
  if (value === 'absent') return { tone: 'absent', label: 'Tidak Hadir' }
  if (value === 'present') return { tone: 'present', label: 'Hadir' }
  return { tone: 'default', label: raw ?? '—' }
}

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.history.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.max(1, Math.ceil(store.history.length / pageSize)))

const visiblePages = computed(() => {
  const pages: number[] = []
  const max = Math.min(3, totalPages.value)
  const start = Math.min(
    Math.max(1, currentPage.value - 1),
    Math.max(1, totalPages.value - max + 1),
  )
  for (let i = 0; i < max; i++) pages.push(start + i)
  return pages
})

const handleCheckIn = async () => {
  const ok = await store.checkIn()
  if (ok) currentPage.value = 1
}

const handleCheckOut = async () => {
  await store.checkOut()
}

const handleExportPdf = () => {
  alert('Export PDF belum tersedia')
}

interface GpsTestResult {
  latitude: number
  longitude: number
  accuracy: number
  distance: number
  allowedRadius: number
  isWithinRadius: boolean
  timestamp: Date
}

const gpsTesting = ref(false)
const gpsTestResult = ref<GpsTestResult | null>(null)
const gpsTestError = ref<string | null>(null)

const handleTestGps = async () => {
  gpsTesting.value = true
  gpsTestError.value = null
  try {
    const pos = await getCurrentPosition()
    const locCheck = await attendanceService.checkLocation(
      pos.coords.latitude,
      pos.coords.longitude,
    )
    gpsTestResult.value = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy),
      distance: locCheck.distance,
      allowedRadius: locCheck.allowedRadius,
      isWithinRadius: locCheck.isWithinRadius,
      timestamp: new Date(),
    }
    await store.refreshPermission()
  } catch (err) {
    gpsTestError.value = (err as Error).message
    gpsTestResult.value = null
    await store.refreshPermission()
  } finally {
    gpsTesting.value = false
  }
}

const dismissGpsTest = () => {
  gpsTestResult.value = null
  gpsTestError.value = null
}

const requestGeoPermission = async () => {
  store.dismissMessages()
  try {
    await getCurrentPosition()
    await store.refreshPermission()
    store.successMessage = 'Akses lokasi diberikan. Silakan klik Absen Masuk.'
  } catch (err) {
    store.error = (err as Error).message
    await store.refreshPermission()
  }
}

onMounted(async () => {
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  await store.refreshPermission()
  await store.refresh()
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <AppLayout title="Attendance">
    <div class="flex flex-col gap-6 pb-[60px]">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <h2
            class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]"
          >
            Absensi Hari Ini
          </h2>
          <p class="text-base leading-6 text-[#424754]">{{ todayLabel }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="gpsTesting"
            class="flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-[17px] py-[9px] text-xs leading-4 font-medium tracking-[0.24px] text-[#191b23] transition hover:border-[#0058be] hover:text-[#0058be] disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleTestGps"
          >
            <MapPinned :size="18" :stroke-width="2" />
            {{ gpsTesting ? 'Testing...' : 'Test GPS' }}
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-white px-[17px] py-[9px] text-xs leading-4 font-medium tracking-[0.24px] text-[#191b23] shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:border-[#0058be] hover:text-[#0058be]"
            @click="handleExportPdf"
          >
            <FileDown :size="18" :stroke-width="2" />
            Export to PDF
          </button>
        </div>
      </div>

      <div
        v-if="store.permissionState === 'denied'"
        class="flex items-start justify-between gap-4 rounded-[12px] border border-[#ba1a1a]/30 bg-[rgba(255,218,214,0.35)] p-4 text-sm text-[#ba1a1a]"
      >
        <div class="flex gap-3">
          <MapPinOff :size="20" :stroke-width="2" class="mt-0.5 shrink-0" />
          <div class="flex flex-col gap-1">
            <div class="font-semibold">Akses lokasi diblokir</div>
            <div class="text-[13px] leading-5">
              Klik ikon
              <span class="font-semibold">gembok</span> atau
              <span class="font-semibold">info</span> di samping URL, pilih
              <span class="font-semibold">Site settings</span>, lalu ubah
              <span class="font-semibold">Location</span> menjadi
              <span class="font-semibold">Allow</span>. Setelah itu refresh halaman ini.
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="store.permissionState === 'prompt'"
        class="flex items-center justify-between gap-4 rounded-[12px] border border-[#0058be]/30 bg-[#f2f3fd] p-4 text-sm text-[#191b23]"
      >
        <div class="flex items-center gap-3">
          <MapPin :size="20" :stroke-width="2" class="text-[#0058be]" />
          <div>
            Aplikasi membutuhkan akses lokasi untuk verifikasi absensi. Izinkan lebih dulu biar
            tombol absen aktif.
          </div>
        </div>
        <button
          type="button"
          class="shrink-0 cursor-pointer rounded-[8px] border-0 bg-[#0058be] px-4 py-2 text-xs leading-4 font-semibold tracking-[0.24px] text-white transition hover:bg-[#004999]"
          @click="requestGeoPermission"
        >
          Izinkan Lokasi
        </button>
      </div>

      <div
        v-if="gpsTestResult || gpsTestError"
        class="rounded-[12px] border p-4 text-sm"
        :class="
          gpsTestError
            ? 'border-red-200 bg-red-50 text-red-700'
            : gpsTestResult?.isWithinRadius
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-orange-200 bg-orange-50 text-orange-800'
        "
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <XCircle v-if="gpsTestError" :size="20" :stroke-width="2" class="mt-0.5 shrink-0" />
            <CheckCircle2
              v-else-if="gpsTestResult?.isWithinRadius"
              :size="20"
              :stroke-width="2"
              class="mt-0.5 shrink-0"
            />
            <MapPinOff v-else :size="20" :stroke-width="2" class="mt-0.5 shrink-0" />

            <div class="flex flex-col gap-2">
              <div v-if="gpsTestError" class="font-semibold">{{ gpsTestError }}</div>
              <template v-else-if="gpsTestResult">
                <div class="font-semibold">
                  {{
                    gpsTestResult.isWithinRadius
                      ? 'GPS OK. Kamu dalam area kantor.'
                      : `Di luar radius kantor (${gpsTestResult.distance}m / max ${gpsTestResult.allowedRadius}m)`
                  }}
                </div>
                <div
                  class="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[12px] tabular-nums md:grid-cols-4"
                >
                  <div>
                    <div class="text-[11px] opacity-70">Latitude</div>
                    <div class="font-semibold">{{ gpsTestResult.latitude.toFixed(6) }}</div>
                  </div>
                  <div>
                    <div class="text-[11px] opacity-70">Longitude</div>
                    <div class="font-semibold">{{ gpsTestResult.longitude.toFixed(6) }}</div>
                  </div>
                  <div>
                    <div class="text-[11px] opacity-70">Jarak ke kantor</div>
                    <div class="font-semibold">{{ gpsTestResult.distance }} m</div>
                  </div>
                  <div>
                    <div class="text-[11px] opacity-70">Akurasi GPS</div>
                    <div class="font-semibold">± {{ gpsTestResult.accuracy }} m</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100"
            @click="dismissGpsTest"
          >
            Tutup
          </button>
        </div>
      </div>

      <div
        v-if="store.error || store.successMessage"
        class="flex items-center justify-between rounded-[8px] border px-4 py-3 text-sm"
        :class="
          store.error
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-green-200 bg-green-50 text-green-700'
        "
      >
        <span>{{ store.error ?? store.successMessage }}</span>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100"
          @click="store.dismissMessages()"
        >
          Tutup
        </button>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <div
          class="col-span-8 flex items-center gap-8 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
        >
          <div class="flex flex-1 flex-col gap-4">
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full" :class="statusDotColor"></div>
              <div class="text-xs leading-4 font-medium tracking-[0.6px] text-[#424754] uppercase">
                STATUS SEKARANG
              </div>
            </div>
            <h3
              class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]"
            >
              {{ statusLabel }}
            </h3>
            <div class="grid grid-cols-2 gap-6 pt-1">
              <div class="flex flex-col">
                <div class="text-[11px] leading-[14px] text-[#424754]">Jadwal Masuk</div>
                <div
                  class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
                >
                  {{ WORK_START }}
                </div>
              </div>
              <div class="flex flex-col">
                <div class="text-[11px] leading-[14px] text-[#424754]">Jadwal Pulang</div>
                <div
                  class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
                >
                  {{ WORK_END }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <button
              type="button"
              :disabled="store.actionLoading || store.hasCheckedIn"
              class="flex h-14 w-56 cursor-pointer items-center justify-center gap-4 rounded-[12px] border-0 bg-[#006c49] text-base leading-6 text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-all hover:enabled:-translate-y-px hover:enabled:bg-[#005237] disabled:cursor-not-allowed disabled:bg-[#e1e2ec] disabled:text-[#424754] disabled:opacity-60 disabled:shadow-none"
              @click="handleCheckIn"
            >
              <LogIn :size="18" :stroke-width="2" />
              Absen Masuk
            </button>
            <button
              type="button"
              :disabled="store.actionLoading || !store.hasCheckedIn || store.hasCheckedOut"
              class="flex h-14 w-56 cursor-pointer items-center justify-center gap-4 rounded-[12px] border-0 bg-[#ba1a1a] text-base leading-6 text-white transition-all hover:enabled:-translate-y-px hover:enabled:bg-[#8a1010] disabled:cursor-not-allowed disabled:bg-[#e1e2ec] disabled:text-[#424754] disabled:opacity-60"
              @click="handleCheckOut"
            >
              <LogOut :size="18" :stroke-width="2" />
              Absen Pulang
            </button>
          </div>
        </div>

        <div
          class="relative col-span-4 flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[12px] bg-[#0058be] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <div
            class="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-[rgba(33,112,228,0.3)] blur-[32px]"
          ></div>
          <div class="relative flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#adc6ff] opacity-90">
              Real-time Clock
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-[48px] leading-[60px] font-bold tracking-[-1.2px] text-[#fefcff] tabular-nums"
            >
              {{ clockLabel }}
            </div>
            <div class="text-sm leading-5 text-[#adc6ff]">Waktu Indonesia Barat (WIB)</div>
          </div>
          <div
            class="relative flex items-center gap-2 self-start rounded-full border border-[rgba(173,198,255,0.3)] bg-[rgba(33,112,228,0.2)] px-[17px] py-[5px]"
          >
            <MapPin :size="14" color="#fefcff" :stroke-width="2" />
            <span class="text-[11px] leading-[14px] text-[#fefcff]">
              GPS Verified: Office Area
            </span>
          </div>
        </div>
      </div>

      <div
        class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <div class="flex flex-col">
            <h4
              class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
            >
              Riwayat Absensi (Bulan Ini)
            </h4>
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              {{ currentMonthLabel }}
            </div>
          </div>
          <div
            class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-[17px] py-[9px] text-xs leading-4 font-medium tracking-[0.24px] text-[#191b23]"
          >
            <CalendarDays :size="18" :stroke-width="2" class="text-[#424754]" />
            {{ currentMonthLabel }}
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th
                  class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]"
                >
                  Date
                </th>
                <th
                  class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]"
                >
                  Clock In
                </th>
                <th
                  class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]"
                >
                  Clock Out
                </th>
                <th
                  class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]"
                >
                  Status
                </th>
                <th
                  class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.loading">
                <td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">
                  Memuat data...
                </td>
              </tr>
              <tr v-else-if="paginatedHistory.length === 0">
                <td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">
                  Belum ada riwayat absensi
                </td>
              </tr>
              <tr
                v-for="item in paginatedHistory"
                v-else
                :key="item.id"
                class="border-b border-[#c2c6d6]"
              >
                <td class="px-6 py-[18px] text-sm leading-5 font-medium text-[#191b23]">
                  {{ formatIndonesianDate(new Date(item.checkInTime)) }}
                </td>
                <td class="px-6 py-[18px] text-sm leading-5 text-[#191b23]">
                  {{ formatShortTime(item.checkInTime) }}
                </td>
                <td class="px-6 py-[18px] text-sm leading-5 text-[#191b23]">
                  {{ formatShortTime(item.checkOutTime) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs leading-4 font-semibold tracking-[0.24px]"
                    :class="[
                      statusStyles[resolveStatus(item.status).tone].bg,
                      statusStyles[resolveStatus(item.status).tone].text,
                    ]"
                  >
                    {{ resolveStatus(item.status).label }}
                  </span>
                </td>
                <td class="px-6 py-[18px]">
                  <button
                    type="button"
                    class="cursor-pointer border-0 bg-transparent text-sm leading-5 font-medium text-[#0058be] hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between bg-white p-4">
          <div class="text-[11px] leading-[14px] text-[#424754]">
            Showing {{ paginatedHistory.length }} of {{ store.history.length }} entries
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center rounded-[4px] border border-[#c2c6d6] bg-white px-[5px] py-[7px] text-[#191b23] transition hover:bg-[#f2f3fd] disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              <ChevronLeft :size="14" :stroke-width="2" />
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="flex min-w-[32px] cursor-pointer items-center justify-center rounded-[4px] px-2 py-[5px] text-base leading-6 transition"
              :class="
                page === currentPage
                  ? 'border-0 bg-[#0058be] text-white'
                  : 'border border-[#c2c6d6] bg-white text-[#191b23] hover:bg-[#f2f3fd]'
              "
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center rounded-[4px] border border-[#c2c6d6] bg-white px-[5px] py-[7px] text-[#191b23] transition hover:bg-[#f2f3fd] disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              <ChevronRight :size="14" :stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
