<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Moon, CalendarDays, MapPin, Users, Bell } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import api from '@/services/api.service'

interface ScheduleDay {
  date: string
  shiftName: string
  startTime: string
  endTime: string
  room: string | null
  isActive: boolean
  leader: { id: number; fullName: string } | null
  members: { userId: number; fullName: string; employeeCode: string }[]
}

const loading = ref(true)
const schedules = ref<ScheduleDay[]>([])
const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const dayNamesShort = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']

const today = new Date()
const todayDow = today.getDay() === 0 ? 7 : today.getDay()

const weekOffset = ref(0)
const weekStart = computed(() => {
  const d = new Date(today)
  d.setDate(today.getDate() - (todayDow - 1) + weekOffset.value * 7)
  return d
})

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(weekStart.value.getDate() + i)
    return {
      dayOfWeek: i + 1,
      date: d,
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    }
  }),
)

const weekLabel = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${start.num} – ${end.num} ${monthNames[end.date.getMonth()]} ${end.date.getFullYear()}`
})

const getScheduleForDay = (dow: number) => {
  const wd = weekDays.value.find((w) => w.dayOfWeek === dow)
  if (!wd) return undefined
  const dateStr = wd.date.toISOString().slice(0, 10)
  return schedules.value.find((s) => s.date === dateStr)
}

const todayStr = computed(() => today.toISOString().slice(0, 10))
const todaySchedule = computed(() => schedules.value.find((s) => s.date === todayStr.value))

const tomorrowDate = computed(() => {
  const d = new Date(today)
  d.setDate(today.getDate() + 1)
  return d.toISOString().slice(0, 10)
})
const tomorrowSchedule = computed(() => schedules.value.find((s) => s.date === tomorrowDate.value))
const tomorrowDayName = computed(() => {
  const d = new Date(today)
  d.setDate(today.getDate() + 1)
  const dow = d.getDay() === 0 ? 7 : d.getDay()
  return dayNames[dow - 1]
})

const shiftColor = (name: string) => {
  if (name === 'PAGI') return { bg: 'bg-[rgba(0,108,73,0.06)]', border: 'border-[rgba(0,108,73,0.2)]', text: 'text-[#006c49]' }
  if (name === 'SIANG') return { bg: 'bg-[rgba(0,88,190,0.06)]', border: 'border-[rgba(0,88,190,0.2)]', text: 'text-[#0058be]' }
  return { bg: 'bg-[rgba(146,71,0,0.06)]', border: 'border-[rgba(146,71,0,0.2)]', text: 'text-[#924700]' }
}

const workDays = computed(() => schedules.value.filter((s) => s.isActive).length)
const offDays = computed(() => 7 - workDays.value)

const load = async () => {
  loading.value = true
  try {
    const start = weekDays.value[0].date.toISOString().slice(0, 10)
    const end = weekDays.value[6].date.toISOString().slice(0, 10)
    const { data } = await api.get('/schedules', { params: { start, end } })
    schedules.value = data.data
  } catch {
    schedules.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-4 pb-12">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex flex-col gap-0.5">
          <h1 class="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl leading-6 sm:leading-7 font-bold tracking-[-0.2px] text-[#191b23]">
            Jadwal Kerja Minggu Ini ({{ weekLabel }})
          </h1>
          <p class="text-sm leading-5 font-medium text-[#424754]">
            Kelola dan pantau rotasi shift harian Anda dengan presisi.
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] leading-5 font-medium text-[#424754] transition hover:-translate-y-px"
            @click="weekOffset--; load()"
          >
            <ChevronLeft :size="14" />
            Sebelumnya
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] leading-5 font-medium text-[#424754] transition hover:-translate-y-px"
            @click="weekOffset++; load()"
          >
            Berikutnya
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>

      <div v-if="loading" class="rounded-[12px] border border-[#c2c6d6] bg-white p-8 text-center text-sm text-[#424754]">Memuat jadwal...</div>

      <template v-else>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-6">
            <h3 class="font-['Plus_Jakarta_Sans'] text-sm leading-5 font-semibold text-[#191b23] mb-5">
              Prakiraan Jadwal Mingguan
            </h3>

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
              <div
                v-for="wd in weekDays"
                :key="wd.dayOfWeek"
                class="flex flex-col gap-2"
              >
                <div
                  class="text-center pb-2 border-b-2"
                  :class="wd.isToday ? 'border-[#0058be]' : 'border-[#ecedf7]'"
                >
                  <div class="text-[10px] leading-4 font-bold tracking-widest text-[#424754]">
                    {{ dayNamesShort[wd.dayOfWeek - 1] }}
                  </div>
                  <div class="text-lg leading-7 font-bold mt-1" :class="wd.isToday ? 'text-[#0058be]' : 'text-[#191b23]'">
                    {{ wd.num }}
                  </div>
                </div>

                <div v-if="getScheduleForDay(wd.dayOfWeek)?.isActive" :class="[
                  'rounded-[8px] px-2 py-3 text-center flex flex-col items-center gap-[3px] min-h-[110px] justify-center border',
                  shiftColor(getScheduleForDay(wd.dayOfWeek)!.shiftName).bg,
                  shiftColor(getScheduleForDay(wd.dayOfWeek)!.shiftName).border,
                ]">
                  <div :class="['text-[9px] leading-4 font-extrabold tracking-widest mb-1', shiftColor(getScheduleForDay(wd.dayOfWeek)!.shiftName).text]">
                    {{ getScheduleForDay(wd.dayOfWeek)!.shiftName }}
                  </div>
                  <div class="font-mono text-xs font-bold leading-tight text-[#191b23]">{{ getScheduleForDay(wd.dayOfWeek)!.startTime }}</div>
                  <div class="font-mono text-xs font-bold leading-tight text-[#191b23]">–</div>
                  <div class="font-mono text-xs font-bold leading-tight text-[#191b23]">{{ getScheduleForDay(wd.dayOfWeek)!.endTime }}</div>
                  <div v-if="getScheduleForDay(wd.dayOfWeek)!.room" class="text-[9px] leading-4 text-[#424754] mt-1">
                    {{ getScheduleForDay(wd.dayOfWeek)!.room }}
                  </div>
                </div>
                <div v-else class="rounded-[8px] px-2 py-3 text-center flex flex-col items-center gap-[3px] min-h-[110px] justify-center bg-[#f4f4fb] border border-dashed border-[#c2c6d6]">
                  <Moon :size="20" class="text-[#9499b0]" />
                  <div class="text-[9px] leading-4 font-semibold tracking-widest text-[#9499b0]">{{ getScheduleForDay(wd.dayOfWeek) ? 'OFF' : 'Belum diatur' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3.5">
            <div
              v-if="tomorrowSchedule?.isActive"
              class="relative rounded-[12px] overflow-hidden p-[22px]"
              style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);"
            >
              <div class="pointer-events-none absolute -top-5 -right-5 h-24 w-24 rounded-full" style="background: rgba(255,255,255,0.07);"></div>
              <div class="flex items-center gap-1.5 text-[11px] leading-4 font-bold tracking-widest mb-2" style="color: rgba(255,255,255,0.7);">
                <Bell :size="16" />
                SHIFT BESOK
              </div>
              <div class="font-['Plus_Jakarta_Sans'] font-mono text-[28px] leading-9 font-extrabold text-white mb-1">
                {{ tomorrowSchedule.startTime }} – {{ tomorrowSchedule.endTime }}
              </div>
              <div class="text-xs leading-5 mb-4" style="color: rgba(255,255,255,0.65);">
                {{ tomorrowDayName }} • Shift {{ tomorrowSchedule.shiftName }}
              </div>
              <div class="flex flex-col gap-2">
                <div v-if="tomorrowSchedule.room" class="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12.5px] leading-5" style="background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);">
                  <MapPin :size="14" />
                  {{ tomorrowSchedule.room }}
                </div>
                <div v-if="tomorrowSchedule.leader" class="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12.5px] leading-5" style="background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);">
                  <Users :size="14" />
                  Tim Leader: {{ tomorrowSchedule.leader.fullName }}
                </div>
              </div>
            </div>

            <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-5">
              <h3 class="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-sm leading-5 font-semibold text-[#191b23] mb-4">
                <CalendarDays :size="16" class="text-[#424754]" />
                Ringkasan Minggu
              </h3>
              <div class="flex flex-col gap-2.5">
                <div class="flex justify-between items-center">
                  <span class="text-sm leading-5 font-medium text-[#424754]">Hari Kerja</span>
                  <span class="text-sm leading-5 font-bold text-[#191b23]">{{ workDays }} Hari</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm leading-5 font-medium text-[#424754]">Hari Libur (OFF)</span>
                  <span class="text-sm leading-5 font-bold text-[#ba1a1a]">{{ offDays }} Hari</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="todaySchedule?.isActive && (todaySchedule.leader || todaySchedule.members.length > 0)" class="rounded-[12px] border border-[#c2c6d6] bg-white px-6 py-5">
          <div class="flex justify-between items-start mb-4">
            <div class="flex flex-col gap-0.5">
              <h3 class="font-['Plus_Jakarta_Sans'] text-sm leading-5 font-semibold text-[#191b23]">
                Rekan Kerja Tim (Shift {{ todaySchedule.shiftName }})
              </h3>
              <p class="text-xs leading-4 font-medium text-[#424754]">
                {{ (todaySchedule.leader ? 1 : 0) + todaySchedule.members.length }} rekan kerja bertugas hari ini.
              </p>
            </div>
          </div>
          <div class="flex gap-3 flex-wrap items-center">
            <div
              v-if="todaySchedule.leader"
              class="flex items-center gap-2.5 rounded-[10px] border-2 border-[#0058be] bg-[rgba(0,88,190,0.04)] px-3.5 py-2.5"
            >
              <div class="h-9 w-9 rounded-full bg-[#0058be] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                {{ todaySchedule.leader.fullName.charAt(0) }}
              </div>
              <div>
                <div class="text-[13px] leading-5 font-semibold text-[#191b23]">{{ todaySchedule.leader.fullName }}</div>
                <div class="text-[10px] font-semibold text-[#0058be]">Team Leader</div>
              </div>
            </div>

            <div
              v-for="m in todaySchedule.members"
              :key="m.userId"
              class="flex items-center gap-2.5 rounded-[10px] border border-[#c2c6d6] bg-[#f4f4fb] px-3.5 py-2.5"
            >
              <div class="h-9 w-9 rounded-full bg-[#424754] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                {{ m.fullName.charAt(0) }}
              </div>
              <div>
                <div class="text-[13px] leading-5 font-semibold text-[#191b23]">{{ m.fullName }}</div>
                <div class="text-[11px] text-[#727785]">{{ m.employeeCode }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
