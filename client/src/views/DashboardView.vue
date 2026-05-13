<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  LogIn,
  LogOut,
  CalendarCheck,
  Wallet,
  Clock,
  Calendar,
  FileEdit,
  Receipt,
  ChevronRight,
  Info,
  HelpCircle,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAttendanceStore } from '@/stores/attendance.store'

const router = useRouter()
const auth = useAuthStore()
const attendance = useAttendanceStore()

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

const formatFullDate = (d: Date) =>
  `${dayNames[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`

const formatShortDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

const formatTimeHM = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const todayLabel = computed(() => formatFullDate(new Date()))

const firstName = computed(() => {
  const name = auth.user?.fullName ?? ''
  return name.split(' ')[0] || 'User'
})

const currentMonth = computed(() => new Date().getMonth())
const currentYear = computed(() => new Date().getFullYear())
const currentMonthLabel = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`)

const thisMonthAttendance = computed(() =>
  attendance.history.filter((item) => {
    const d = new Date(item.checkInTime)
    return d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
  }),
)

const totalKehadiran = computed(() => thisMonthAttendance.value.length)
const kehadiranTarget = 22
const kehadiranPercent = computed(() =>
  Math.min(100, Math.round((totalKehadiran.value / kehadiranTarget) * 100)),
)

const gajiEstimasi = 5_420_000

const latestHistory = computed(() => attendance.history.slice(0, 5))

type StatusTone =
  | 'present'
  | 'late'
  | 'early-leave'
  | 'late-and-early-leave'
  | 'absent'
  | 'default'
const statusStyles: Record<StatusTone, { bg: string; text: string }> = {
  present: { bg: 'bg-[rgba(78,222,163,0.2)]', text: 'text-[#006c49]' },
  late: { bg: 'bg-[rgba(255,183,134,0.2)]', text: 'text-[#924700]' },
  'early-leave': { bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]' },
  'late-and-early-leave': { bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]' },
  absent: { bg: 'bg-[rgba(186,26,26,0.1)]', text: 'text-[#ba1a1a]' },
  default: { bg: 'bg-[#e1e2ec]', text: 'text-[#424754]' },
}

const resolveStatus = (raw: string | null): { tone: StatusTone; label: string } => {
  const value = (raw ?? '').toLowerCase()
  if (value === 'late') return { tone: 'late', label: 'Terlambat' }
  if (value === 'early-leave' || value === 'early_leave')
    return { tone: 'early-leave', label: 'Izin Pulang Awal' }
  if (value === 'late-and-early-leave')
    return { tone: 'late-and-early-leave', label: 'Terlambat & Pulang Awal' }
  if (value === 'absent') return { tone: 'absent', label: 'Tidak Hadir' }
  if (value === 'present') return { tone: 'present', label: 'Hadir' }
  return { tone: 'default', label: raw ?? '—' }
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

interface Announcement {
  title: string
  body: string
  time: string
  accent: string
}

const announcements: Announcement[] = [
  {
    title: 'Update Kebijakan WFO',
    body: 'Mulai Juni, kehadiran di kantor minimal 3 hari seminggu.',
    time: '2 jam yang lalu',
    accent: 'bg-[#0058be]',
  },
  {
    title: 'Maintenance System',
    body: 'Portal akan offline pada Sabtu, 25 Mei pukul 22:00 WIB.',
    time: '1 hari yang lalu',
    accent: 'bg-[#924700]',
  },
]

const handleCheckIn = () => router.push({ name: 'attendance' })
const handleCheckOut = () => router.push({ name: 'attendance' })

const goToSchedule = () => router.push({ name: 'schedule' })
const goToSalary = () => router.push({ name: 'salary' })
const goToLeave = () => alert('Izin / Cuti belum tersedia')
const openHelp = () => alert('Pusat bantuan belum tersedia')

onMounted(async () => {
  if (!auth.user) await auth.fetchCurrentUser()
  await attendance.refresh()
})
</script>

<template>
  <AppLayout title="Dashboard">
    <div class="flex flex-col gap-6 pb-12">
      <section
        class="relative flex items-center justify-between overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-[#2170e4] p-[33px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div
          class="pointer-events-none absolute -top-20 -right-10 h-64 w-64 rounded-full bg-[#fefcff] opacity-10 blur-[32px]"
        ></div>
        <div class="relative flex flex-col gap-1">
          <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#fefcff] opacity-90">
            {{ todayLabel }}
          </div>
          <h2
            class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#fefcff]"
          >
            Halo, {{ firstName }}!
          </h2>
          <p class="max-w-[448px] pt-1 text-sm leading-5 text-[#fefcff] opacity-90">
            Jangan lupa untuk mencatat kehadiran Anda hari ini. Tetap produktif dan jaga kesehatan!
          </p>
        </div>
        <div class="relative flex items-center gap-4">
          <button
            type="button"
            :disabled="attendance.hasCheckedIn"
            class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-white px-6 py-[17px] text-base leading-6 font-semibold text-[#0058be] shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:enabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleCheckIn"
          >
            <LogIn :size="18" :stroke-width="2" />
            Absen Masuk
          </button>
          <button
            type="button"
            :disabled="!attendance.hasCheckedIn || attendance.hasCheckedOut"
            class="flex cursor-pointer items-center gap-2 rounded-[8px] border border-white bg-[#0058be] px-[25px] py-[17px] text-base leading-6 font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:enabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleCheckOut"
          >
            <LogOut :size="18" :stroke-width="2" />
            Absen Pulang
          </button>
        </div>
      </section>

      <section class="grid grid-cols-3 gap-6">
        <div
          class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white px-[25px] pt-[25px] pb-[33px]"
        >
          <div class="flex items-start justify-between">
            <div
              class="flex h-[38px] w-[38px] items-center justify-center rounded-[8px] bg-[rgba(0,108,73,0.1)] text-[#006c49]"
            >
              <CalendarCheck :size="20" :stroke-width="2" />
            </div>
            <span
              class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#006c49]"
            >
              {{ totalKehadiran >= kehadiranTarget ? 'Target tercapai' : `+${totalKehadiran} hari` }}
            </span>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Total Kehadiran
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-semibold tracking-[-0.24px] text-[#191b23]"
            >
              {{ totalKehadiran }} hari
            </div>
          </div>
          <div class="h-[6px] w-full overflow-hidden rounded-full bg-[#ecedf7]">
            <div
              class="h-[6px] rounded-full bg-[#006c49] transition-all"
              :style="{ width: `${kehadiranPercent}%` }"
            ></div>
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div
              class="flex h-8 w-[38px] items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]"
            >
              <Wallet :size="18" :stroke-width="2" />
            </div>
            <span
              class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#0058be]"
            >
              Bulan Ini
            </span>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Gaji Bulan Ini
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-semibold tracking-[-0.24px] text-[#191b23]"
            >
              {{ formatRupiah(gajiEstimasi) }}
            </div>
          </div>
          <div class="flex items-center gap-1 text-[11px] leading-[14px] text-[#424754]">
            <Info :size="12" :stroke-width="2" />
            Estimasi sebelum pajak &amp; bonus
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(146,71,0,0.1)] text-[#924700]"
            >
              <Clock :size="20" :stroke-width="2" />
            </div>
            <span
              class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#924700]"
            >
              Aktif
            </span>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Jadwal Kerja
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-semibold tracking-[-0.24px] text-[#191b23]"
            >
              Shift Pagi
            </div>
          </div>
          <div class="text-[11px] leading-[14px] text-[#424754]">
            {{ attendance.config.workStartTime }} WIB - {{ attendance.config.workEndTime }} WIB
          </div>
        </div>
      </section>

      <section class="grid grid-cols-12 gap-6">
        <div
          class="col-span-8 overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white"
        >
          <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
            <h3
              class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
            >
              Riwayat Kehadiran Terakhir
            </h3>
            <button
              type="button"
              class="cursor-pointer border-0 bg-transparent text-xs leading-4 font-medium tracking-[0.24px] text-[#0058be] hover:underline"
              @click="router.push({ name: 'attendance' })"
            >
              Lihat Semua
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-[#f2f3fd]">
                  <th
                    class="border-b border-[#c2c6d6] px-6 py-4 text-left text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]"
                  >
                    Tanggal
                  </th>
                  <th
                    class="border-b border-[#c2c6d6] px-6 py-4 text-left text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]"
                  >
                    Masuk
                  </th>
                  <th
                    class="border-b border-[#c2c6d6] px-6 py-4 text-left text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]"
                  >
                    Pulang
                  </th>
                  <th
                    class="border-b border-[#c2c6d6] px-6 py-4 text-left text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]"
                  >
                    Status
                  </th>
                  <th
                    class="border-b border-[#c2c6d6] px-6 py-4 text-left text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]"
                  >
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="attendance.loading">
                  <td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">
                    Memuat data...
                  </td>
                </tr>
                <tr v-else-if="latestHistory.length === 0">
                  <td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">
                    Belum ada riwayat absensi
                  </td>
                </tr>
                <tr
                  v-for="item in latestHistory"
                  v-else
                  :key="item.id"
                  class="border-t border-[#c2c6d6]"
                >
                  <td class="px-6 py-[17px] text-sm leading-5 text-[#191b23]">
                    {{ formatShortDate(item.checkInTime) }}
                  </td>
                  <td class="px-6 py-[17px] text-sm leading-5 text-[#191b23]">
                    {{ formatTimeHM(item.checkInTime) }}
                  </td>
                  <td class="px-6 py-[17px] text-sm leading-5 text-[#191b23]">
                    {{ formatTimeHM(item.checkOutTime) }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
                      :class="[
                        statusStyles[resolveStatus(item.status).tone].bg,
                        statusStyles[resolveStatus(item.status).tone].text,
                      ]"
                    >
                      {{ resolveStatus(item.status).label }}
                    </span>
                  </td>
                  <td class="px-6 py-5 text-[11px] leading-[14px] text-[#424754]">
                    {{ item.notes || '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside class="col-span-4 flex flex-col gap-6">
          <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
            <h4
              class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
            >
              Aksi Cepat
            </h4>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#0058be] hover:bg-[#f2f3fd]"
                @click="goToSchedule"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-9 w-[34px] items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]"
                  >
                    <Calendar :size="18" :stroke-width="2" />
                  </div>
                  <span class="text-sm leading-5 text-[#191b23]">Lihat Jadwal</span>
                </div>
                <ChevronRight :size="14" :stroke-width="2" class="text-[#424754]" />
              </button>
              <button
                type="button"
                class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#0058be] hover:bg-[#f2f3fd]"
                @click="goToLeave"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-9 w-[34px] items-center justify-center rounded-[8px] bg-[rgba(146,71,0,0.1)] text-[#924700]"
                  >
                    <FileEdit :size="18" :stroke-width="2" />
                  </div>
                  <span class="text-sm leading-5 text-[#191b23]">Izin / Cuti</span>
                </div>
                <ChevronRight :size="14" :stroke-width="2" class="text-[#424754]" />
              </button>
              <button
                type="button"
                class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#0058be] hover:bg-[#f2f3fd]"
                @click="goToSalary"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-9 w-8 items-center justify-center rounded-[8px] bg-[rgba(0,108,73,0.1)] text-[#006c49]"
                  >
                    <Receipt :size="18" :stroke-width="2" />
                  </div>
                  <span class="text-sm leading-5 text-[#191b23]">Slip Gaji</span>
                </div>
                <ChevronRight :size="14" :stroke-width="2" class="text-[#424754]" />
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
            <h4
              class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
            >
              Pengumuman
            </h4>
            <div class="flex flex-col gap-6">
              <div
                v-for="a in announcements"
                :key="a.title"
                class="flex items-stretch gap-4"
              >
                <div class="w-[3.3px] shrink-0 rounded-full" :class="a.accent"></div>
                <div class="flex flex-col gap-1">
                  <h5
                    class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#191b23]"
                  >
                    {{ a.title }}
                  </h5>
                  <p class="text-[11px] leading-[14px] text-[#424754]">{{ a.body }}</p>
                  <span class="text-[10px] leading-[15px] text-[#727785]">{{ a.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <footer class="-mx-6 -mb-12 border-t border-[#c2c6d6] bg-[#f2f3fd] px-6 pt-[25px] pb-6">
        <div class="text-center text-[11px] leading-[14px] text-[#424754]">
          © {{ currentYear }} EMS Core Internal Operations. All rights reserved.
        </div>
      </footer>
    </div>

    <button
      type="button"
      class="fixed right-6 bottom-6 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-[#0058be] text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition hover:-translate-y-px hover:bg-[#004999]"
      aria-label="Bantuan"
      @click="openHelp"
    >
      <HelpCircle :size="20" :stroke-width="2" />
    </button>

  </AppLayout>
</template>
