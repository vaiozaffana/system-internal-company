<script setup lang="ts">
import { ChevronLeft, ChevronRight, Download, Bell, MapPin, Users, Moon, CalendarDays } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'

const today = new Date()
const weekStart = new Date(today)
weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday

const days = Array.from({ length: 5 }, (_, i) => {
  const d = new Date(weekStart)
  d.setDate(weekStart.getDate() + i)
  return {
    name: ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'][i],
    num: d.getDate(),
    isToday: d.toDateString() === today.toDateString(),
  }
})

type ShiftType = 'PAGI' | 'SIANG' | 'OFF'

const shifts: { type: ShiftType; start?: string; end?: string; room?: string }[] = [
  { type: 'PAGI', start: '08:00', end: '17:00', room: 'Ruang Utama A' },
  { type: 'PAGI', start: '08:00', end: '17:00', room: 'Ruang Utama A' },
  { type: 'OFF' },
  { type: 'SIANG', start: '12:00', end: '21:00' },
  { type: 'SIANG', start: '12:00', end: '21:00' },
]

const teamMembers = [
  { name: 'Rasya Rayhan', status: 'Hadir', initial: 'R' },
  { name: 'Vaio Prasa', status: 'Hadir', initial: 'V' },
  { name: 'Nabil Fauzan', status: 'Belum Absen', initial: 'N' },
]

const weekLabel = `${days[0].num} – ${days[4].num} Mei ${today.getFullYear()}`
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-4 pb-12">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-0.5">
          <h1 class="font-['Plus_Jakarta_Sans'] text-xl leading-7 font-bold tracking-[-0.2px] text-[#191b23]">
            Jadwal Kerja Minggu Ini ({{ weekLabel }})
          </h1>
          <p class="text-sm leading-5 font-medium text-[#424754]">
            Kelola dan pantau rotasi shift harian Anda dengan presisi.
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] leading-5 font-medium text-[#424754] transition hover:-translate-y-px">
            <ChevronLeft :size="14" />
            Minggu Sebelumnya
          </button>
          <button class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] leading-5 font-medium text-[#424754] transition hover:-translate-y-px">
            Minggu Depan
            <ChevronRight :size="14" />
          </button>
          <button class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border-0 bg-[#0058be] px-4 py-2 text-[13px] leading-5 font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:-translate-y-px">
            <Download :size="14" />
            Ekspor PDF
          </button>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_300px] gap-4">
        <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-6">
          <h3 class="font-['Plus_Jakarta_Sans'] text-sm leading-5 font-semibold text-[#191b23] mb-5">
            Prakiraan Jadwal Mingguan
          </h3>

          <div class="grid grid-cols-5 gap-2">
            <div
              v-for="day in days"
              :key="day.name"
              class="text-center pb-3 border-b-2"
              :class="day.isToday ? 'border-[#0058be]' : 'border-[#ecedf7]'">
              <div class="text-[10.5px] leading-4 font-bold tracking-widest text-[#424754]">
                {{ day.name }}
              </div>
              <div
                class="text-lg leading-7 font-bold mt-1"
                :class="day.isToday ? 'text-[#0058be]' : 'text-[#191b23]'">
                {{ day.num }}
              </div>
            </div>

            <template v-for="(shift, i) in shifts" :key="i">
              <div
                v-if="shift.type === 'PAGI'"
                class="rounded-[8px] px-2.5 py-3.5 text-center flex flex-col items-center gap-[3px] min-h-[120px] justify-center bg-[rgba(0,108,73,0.06)] border border-[rgba(0,108,73,0.2)]">
                <div class="text-[10px] leading-4 font-extrabold tracking-widest text-[#006c49] mb-1">
                  {{ shift.type }}
                </div>
                <div class="font-mono text-sm font-bold leading-tight text-[#191b23]">{{ shift.start }}</div>
                <div class="font-mono text-sm font-bold leading-tight text-[#191b23]">–</div>
                <div class="font-mono text-sm font-bold leading-tight text-[#191b23]">{{ shift.end }}</div>
                <div v-if="shift.room" class="text-[10.5px] leading-4 text-[#424754] mt-1.5">
                  {{ shift.room }}
                </div>
              </div>

              <div
                v-else-if="shift.type === 'SIANG'"
                class="rounded-[8px] px-2.5 py-3.5 text-center flex flex-col items-center gap-[3px] min-h-[120px] justify-center bg-[rgba(0,88,190,0.06)] border border-[rgba(0,88,190,0.2)]">
                <div class="text-[10px] leading-4 font-extrabold tracking-widest text-[#0058be] mb-1">
                  {{ shift.type }}
                </div>
                <div class="font-mono text-sm font-bold leading-tight text-[#191b23]">{{ shift.start }}</div>
                <div class="font-mono text-sm font-bold leading-tight text-[#191b23]">–</div>
                <div class="font-mono text-sm font-bold leading-tight text-[#191b23]">{{ shift.end }}</div>
              </div>

              <div
                v-else
                class="rounded-[8px] px-2.5 py-3.5 text-center flex flex-col items-center gap-[3px] min-h-[120px] justify-center bg-[#f4f4fb] border border-dashed border-[#c2c6d6]">
                <Moon :size="24" class="text-[#9499b0]" />
                <div class="text-[10px] leading-4 font-semibold tracking-widest text-[#9499b0]">OFF DAY</div>
              </div>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-3.5">
          <div
            class="relative rounded-[12px] overflow-hidden p-[22px]"
            style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);"
          >
            <div
              class="pointer-events-none absolute -top-5 -right-5 h-24 w-24 rounded-full"
              style="background: rgba(255,255,255,0.07);"
            ></div>

            <div
              class="flex items-center gap-1.5 text-[11px] leading-4 font-bold tracking-widest mb-2"
              style="color: rgba(255,255,255,0.7);"
            >
              <Bell :size="16" />
              SHIFT BESOK
            </div>
            <div class="font-['Plus_Jakarta_Sans'] font-mono text-[30px] leading-9 font-extrabold text-white mb-1">
              08:00 – 17:00
            </div>
            <div class="text-xs leading-5 mb-4" style="color: rgba(255,255,255,0.65);">
              Selasa, {{ days[1].num }} Mei {{ today.getFullYear() }} • Shift Pagi
            </div>

            <div class="flex flex-col gap-2">
              <div
                class="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12.5px] leading-5"
                style="background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);"
              >
                <MapPin :size="14" />
                Headquarters - Lt. 4, Zona A
              </div>
              <div
                class="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12.5px] leading-5"
                style="background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);"
              >
                <Users :size="14" />
                Tim Leader: Aris Setiawan
              </div>
            </div>
          </div>

          <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-5">
            <h3 class="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-sm leading-5 font-semibold text-[#191b23] mb-4">
              <CalendarDays :size="16" class="text-[#424754]" />
              Detail Jadwal Bulan Ini
            </h3>

            <div class="flex flex-col gap-2.5 mb-4">
              <div class="flex justify-between items-center">
                <span class="text-sm leading-5 font-medium text-[#424754]">Total Hari Kerja</span>
                <span class="text-sm leading-5 font-bold text-[#191b23]">22 Hari</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm leading-5 font-medium text-[#424754]">Hari Libur (OFF)</span>
                <span class="text-sm leading-5 font-bold text-[#ba1a1a]">8 Hari</span>
              </div>
            </div>

            <div class="text-[10.5px] leading-4 font-bold tracking-widest text-[#9499b0] mb-2.5">
              DISTRIBUSI SHIFT
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-[8px] p-3.5 text-center bg-[rgba(0,108,73,0.06)] border border-[rgba(0,108,73,0.2)]">
                <div class="text-[11px] leading-4 font-semibold text-[#006c49] mb-1">Pagi (M1)</div>
                <div class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-extrabold text-[#006c49]">12</div>
              </div>
              <div class="rounded-[8px] p-3.5 text-center bg-[rgba(0,88,190,0.06)] border border-[rgba(0,88,190,0.2)]">
                <div class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-extrabold text-[#0058be]">10</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[12px] border border-[#c2c6d6] bg-white px-6 py-5">
        <div class="flex justify-between items-start mb-4">
          <div class="flex flex-col gap-0.5">
            <h3 class="font-['Plus_Jakarta_Sans'] text-sm leading-5 font-semibold text-[#191b23]">
              Rekan Kerja Tim (Shift Pagi)
            </h3>
            <p class="text-xs leading-4 font-medium text-[#424754]">
              5 rekan kerja bertugas bersama Anda hari ini.
            </p>
          </div>
          <a href="#" class="text-[13px] leading-5 font-semibold text-[#0058be] hover:underline">
            Lihat Semua Tim
          </a>
        </div>

        <div class="flex gap-3 flex-wrap items-center">
          <div
            v-for="m in teamMembers"
            :key="m.name"
            class="flex items-center gap-2.5 rounded-[10px] border border-[#c2c6d6] bg-[#f4f4fb] px-3.5 py-2.5"
          >
            <div class="h-9 w-9 rounded-full bg-[#0058be] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              {{ m.initial }}
            </div>
            <div>
              <div class="text-[13px] leading-5 font-semibold text-[#191b23]">{{ m.name }}</div>
              <div
                class="flex items-center gap-1.5 text-xs leading-4 font-medium mt-0.5"
                :class="m.status === 'Hadir' ? 'text-[#006c49]' : 'text-[#9499b0]'"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="m.status === 'Hadir' ? 'bg-[#006c49]' : 'bg-[#9499b0]'"
                ></span>
                {{ m.status }}
              </div>
            </div>
          </div>

          <div class="h-[46px] w-[46px] rounded-full border-2 border-dashed border-[#c2c6d6] bg-[#ecedf7] flex items-center justify-center text-[13px] font-bold text-[#9499b0]">
            +2
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>