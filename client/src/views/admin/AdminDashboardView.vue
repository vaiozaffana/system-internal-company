<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users as UsersIcon,
  CalendarCheck,
  Clock,
  Settings,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  UserX,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAttendanceConfigStore } from '@/stores/attendanceConfig.store'
import { usersService } from '@/services/users.service'
import { attendanceService, type AttendanceRecord } from '@/services/attendance.service'

const router = useRouter()
const auth = useAuthStore()
const configStore = useAttendanceConfigStore()

const totalUsers = ref(0)
const todayAttendance = ref<(AttendanceRecord & { user?: { employeeCode: string; fullName: string; department: string | null } })[]>([])
const loading = ref(true)

const firstName = computed(() => {
  const name = auth.user?.fullName ?? ''
  return name.split(' ')[0] || 'Admin'
})

const todayLabel = computed(() => {
  const d = new Date()
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${dayNames[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
})

const todayISO = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const checkedInCount = computed(() => todayAttendance.value.length)
const checkedOutCount = computed(() => todayAttendance.value.filter((a) => a.checkOutTime).length)

const formatTime = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

type StatusTone = 'present' | 'late' | 'early-leave' | 'late-and-early-leave' | 'default'
const statusStyles: Record<StatusTone, { bg: string; text: string }> = {
  present: { bg: 'bg-[rgba(108,248,187,0.2)]', text: 'text-[#006c49]' },
  late: { bg: 'bg-[rgba(255,183,134,0.2)]', text: 'text-[#924700]' },
  'early-leave': { bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]' },
  'late-and-early-leave': { bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]' },
  default: { bg: 'bg-[#e1e2ec]', text: 'text-[#424754]' },
}

const resolveStatus = (raw: string | null): { tone: StatusTone; label: string } => {
  const value = (raw ?? '').toLowerCase()
  if (value === 'late') return { tone: 'late', label: 'Terlambat' }
  if (value === 'early-leave' || value === 'early_leave') return { tone: 'early-leave', label: 'Pulang Awal' }
  if (value === 'late-and-early-leave') return { tone: 'late-and-early-leave', label: 'Telat & Pulang Awal' }
  if (value === 'present') return { tone: 'present', label: 'Hadir' }
  return { tone: 'default', label: raw ?? '—' }
}

onMounted(async () => {
  if (!auth.user) await auth.fetchCurrentUser()
  await configStore.load()
  try {
    totalUsers.value = await usersService.getCount()
    todayAttendance.value = await attendanceService.getAllAttendance({
      startDate: todayISO.value,
      endDate: todayISO.value + 'T23:59:59',
    })
  } catch {
    totalUsers.value = 0
    todayAttendance.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout title="Admin Dashboard">
    <div class="flex flex-col gap-6 pb-12">
      <section
        class="relative flex items-center justify-between overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-[#2170e4] p-[33px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div
          class="pointer-events-none absolute -top-20 -right-10 h-64 w-64 rounded-full bg-[#fefcff] opacity-10 blur-[32px]"
        ></div>
        <div class="relative flex flex-col gap-1">
          <div class="flex items-center gap-2 text-xs leading-4 font-medium tracking-[0.24px] text-[#fefcff] opacity-90">
            <ShieldCheck :size="14" :stroke-width="2" />
            Admin Panel &bull; {{ todayLabel }}
          </div>
          <h2
            class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#fefcff]"
          >
            Selamat datang, {{ firstName }}
          </h2>
          <p class="max-w-[520px] pt-1 text-sm leading-5 text-[#fefcff] opacity-90">
            Kelola konfigurasi sistem absensi, aturan jam kerja, dan pengaturan lainnya dari sini.
          </p>
        </div>
      </section>

      <section class="grid grid-cols-4 gap-6">
        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]">
              <Clock :size="20" :stroke-width="2" />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">Jam Kerja</div>
            <div class="font-['Plus_Jakarta_Sans'] text-xl leading-7 font-semibold tracking-[-0.24px] text-[#191b23]">
              {{ configStore.config?.workStartTime ?? '—' }} - {{ configStore.config?.workEndTime ?? '—' }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,108,73,0.1)] text-[#006c49]">
              <UsersIcon :size="20" :stroke-width="2" />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">Total User</div>
            <div class="font-['Plus_Jakarta_Sans'] text-xl leading-7 font-semibold tracking-[-0.24px] text-[#191b23]">
              {{ loading ? '...' : totalUsers }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,108,73,0.1)] text-[#006c49]">
              <UserCheck :size="20" :stroke-width="2" />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">Sudah Absen Hari Ini</div>
            <div class="font-['Plus_Jakarta_Sans'] text-xl leading-7 font-semibold tracking-[-0.24px] text-[#191b23]">
              {{ loading ? '...' : checkedInCount }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(186,26,26,0.1)] text-[#ba1a1a]">
              <UserX :size="20" :stroke-width="2" />
            </div>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">Belum Absen</div>
            <div class="font-['Plus_Jakarta_Sans'] text-xl leading-7 font-semibold tracking-[-0.24px] text-[#191b23]">
              {{ loading ? '...' : Math.max(0, totalUsers - checkedInCount) }}
            </div>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <div>
            <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
              Absensi Hari Ini
            </h3>
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Monitoring real-time kehadiran karyawan
            </div>
          </div>
          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent text-xs leading-4 font-medium tracking-[0.24px] text-[#0058be] hover:underline"
            @click="router.push({ name: 'admin-attendance' })"
          >
            Lihat Semua
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Karyawan</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Department</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Masuk</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Pulang</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">Memuat data...</td>
              </tr>
              <tr v-else-if="todayAttendance.length === 0">
                <td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">Belum ada yang absen hari ini</td>
              </tr>
              <tr v-for="item in todayAttendance.slice(0, 10)" v-else :key="item.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px]">
                  <div class="text-sm font-medium text-[#191b23]">{{ item.user?.fullName ?? '—' }}</div>
                  <div class="text-[11px] text-[#424754]">{{ item.user?.employeeCode ?? '' }}</div>
                </td>
                <td class="px-6 py-[14px] text-sm text-[#424754]">{{ item.user?.department ?? '—' }}</td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">{{ formatTime(item.checkInTime) }}</td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">{{ formatTime(item.checkOutTime) }}</td>
                <td class="px-6 py-[14px]">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="[statusStyles[resolveStatus(item.status).tone].bg, statusStyles[resolveStatus(item.status).tone].text]"
                  >
                    {{ resolveStatus(item.status).label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
        <h4 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
          Aksi Cepat
        </h4>
        <div class="mt-4 flex flex-col gap-2">
          <button
            type="button"
            class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#0058be] hover:bg-[rgba(0,88,190,0.04)]"
            @click="router.push('/admin/settings')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]">
                <Settings :size="20" :stroke-width="2" />
              </div>
              <div>
                <div class="text-sm leading-5 font-medium text-[#191b23]">Attendance Settings</div>
                <div class="text-[11px] leading-[14px] text-[#424754]">Atur jam kerja, toleransi telat, batas absen</div>
              </div>
            </div>
            <ChevronRight :size="16" :stroke-width="2" class="text-[#424754]" />
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#0058be] hover:bg-[rgba(0,88,190,0.04)]"
            @click="router.push('/admin/users')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,108,73,0.1)] text-[#006c49]">
                <UsersIcon :size="20" :stroke-width="2" />
              </div>
              <div>
                <div class="text-sm leading-5 font-medium text-[#191b23]">Manajemen User</div>
                <div class="text-[11px] leading-[14px] text-[#424754]">Tambah, edit, hapus akun karyawan</div>
              </div>
            </div>
            <ChevronRight :size="16" :stroke-width="2" class="text-[#424754]" />
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#0058be] hover:bg-[rgba(0,88,190,0.04)]"
            @click="router.push('/admin/attendance')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]">
                <CalendarCheck :size="20" :stroke-width="2" />
              </div>
              <div>
                <div class="text-sm leading-5 font-medium text-[#191b23]">Monitoring Absensi</div>
                <div class="text-[11px] leading-[14px] text-[#424754]">Lihat riwayat absensi seluruh karyawan</div>
              </div>
            </div>
            <ChevronRight :size="16" :stroke-width="2" class="text-[#424754]" />
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
