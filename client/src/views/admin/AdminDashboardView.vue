<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users as UsersIcon,
  CalendarCheck,
  Clock,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAttendanceConfigStore } from '@/stores/attendanceConfig.store'

const router = useRouter()
const auth = useAuthStore()
const configStore = useAttendanceConfigStore()

const firstName = computed(() => {
  const name = auth.user?.fullName ?? ''
  return name.split(' ')[0] || 'Admin'
})

const todayLabel = computed(() => {
  const d = new Date()
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
  return `${dayNames[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
})

onMounted(async () => {
  if (!auth.user) await auth.fetchCurrentUser()
  await configStore.load()
})

const quickActions = [
  {
    title: 'Attendance Settings',
    description: 'Atur jam kerja, toleransi telat, batas absen',
    icon: Settings,
    to: '/admin/settings',
    tone: 'orange',
  },
]
</script>

<template>
  <AppLayout title="Admin Dashboard">
    <div class="flex flex-col gap-6 pb-12">
      <section
        class="relative flex items-center justify-between overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-[#924700] p-[33px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
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
            Kelola konfigurasi sistem absensi, aturan jam kerja, dan pengaturan lainnya dari
            sini.
          </p>
        </div>
      </section>

      <section class="grid grid-cols-3 gap-6">
        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(146,71,0,0.1)] text-[#924700]"
            >
              <Clock :size="20" :stroke-width="2" />
            </div>
            <span class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#924700]">
              Aktif
            </span>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Jam Kerja
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-semibold tracking-[-0.24px] text-[#191b23]"
            >
              {{ configStore.config?.workStartTime ?? '—' }} - {{ configStore.config?.workEndTime ?? '—' }}
            </div>
          </div>
          <div class="text-[11px] leading-[14px] text-[#424754]">
            Toleransi telat {{ configStore.config?.lateToleranceMinutes ?? '—' }} menit
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]"
            >
              <CalendarCheck :size="20" :stroke-width="2" />
            </div>
            <span class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#0058be]">
              Rule
            </span>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Minimum Kerja
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-semibold tracking-[-0.24px] text-[#191b23]"
            >
              {{ configStore.config?.minWorkDurationHours ?? '—' }} jam
            </div>
          </div>
          <div class="text-[11px] leading-[14px] text-[#424754]">
            Minimal durasi kerja sebelum check-out
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
          <div class="flex items-start justify-between">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,108,73,0.1)] text-[#006c49]"
            >
              <UsersIcon :size="20" :stroke-width="2" />
            </div>
            <span class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#006c49]">
              System
            </span>
          </div>
          <div class="flex flex-col">
            <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
              Total User
            </div>
            <div
              class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-semibold tracking-[-0.24px] text-[#191b23]"
            >
              —
            </div>
          </div>
          <div class="text-[11px] leading-[14px] text-[#424754]">Modul users belum tersedia</div>
        </div>
      </section>

      <section class="rounded-[12px] border border-[#c2c6d6] bg-white p-[25px]">
        <h4 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
          Aksi Cepat
        </h4>
        <div class="mt-4 flex flex-col gap-2">
          <button
            v-for="action in quickActions"
            :key="action.title"
            type="button"
            class="flex cursor-pointer items-center justify-between rounded-[8px] border border-[#c2c6d6] bg-white p-[17px] text-left transition hover:border-[#924700] hover:bg-[rgba(146,71,0,0.04)]"
            @click="router.push(action.to)"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(146,71,0,0.12)] text-[#924700]"
              >
                <component :is="action.icon" :size="20" :stroke-width="2" />
              </div>
              <div>
                <div class="text-sm leading-5 font-medium text-[#191b23]">
                  {{ action.title }}
                </div>
                <div class="text-[11px] leading-[14px] text-[#424754]">
                  {{ action.description }}
                </div>
              </div>
            </div>
            <ChevronRight :size="16" :stroke-width="2" class="text-[#424754]" />
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
