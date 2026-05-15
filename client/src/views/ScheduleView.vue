<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Download, MapPin, Users, Wallet } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import api from '@/services/api.service'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Colleague {
  id: number
  fullName: string
  employeeCode: string
  department: string | null
  position: string | null
}

interface SlipData {
  netSalary: number
  baseSalary: number
  totalAllowance: number
  totalDeductions: number
}

const SHIFT = { start: '08:30', end: '16:30', label: 'Shift Pagi' }
const SATURDAY_SHIFT = { start: '08:30', end: '14:30', label: 'Shift Pagi' }
const DAY_NAMES = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const colleagues = ref<Colleague[]>([])
const attendedIds = ref<Set<number>>(new Set())
const slip = ref<SlipData | null>(null)
const loading = ref(true)

const withStatus = computed(() =>
  colleagues.value.map((c) => ({ ...c, attended: attendedIds.value.has(c.id) }))
)
const attendedCount = computed(() => attendedIds.value.size)

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

// Week offset from current week (0 = this week)
const weekOffset = ref(0)

const weekStart = computed(() => {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset.value * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
})

const days = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(weekStart.value.getDate() + i)
    return {
      name: DAY_NAMES[i],
      num: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      date: new Date(d),
      isToday: d.getTime() === today.getTime(),
      isSaturday: i === 5,
    }
  })
})

const weekLabel = computed(() => {
  const first = days.value[0]
  const last = days.value[5]
  if (first.month === last.month) {
    return `${first.num} – ${last.num} ${MONTH_NAMES[first.month]} ${first.year}`
  }
  return `${first.num} ${MONTH_NAMES[first.month]} – ${last.num} ${MONTH_NAMES[last.month]} ${last.year}`
})

const tomorrowShift = computed(() => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dow = tomorrow.getDay() // 0=Sun, 6=Sat
  if (dow === 0) return null // Sunday = off
  const isSaturday = dow === 6
  const shift = getShiftForDay(isSaturday)
  return {
    date: `${DAY_NAMES[(dow + 5) % 7]}, ${tomorrow.getDate()} ${MONTH_NAMES[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`,
    shift,
  }
})

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const getAvatarColor = (id: number) => {
  const colors = ['#0058be', '#006c49', '#924700', '#6b21a8', '#be123c', '#0e7490']
  return colors[id % colors.length]
}

const getShiftForDay = (isSaturday: boolean) => isSaturday ? SATURDAY_SHIFT : SHIFT

onMounted(async () => {
  try {
    const today = new Date()
    // Use full day range in local time to avoid UTC offset issues
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const [colleaguesRes, attendanceRes, slipRes] = await Promise.allSettled([
      api.get('/users/colleagues'),
      api.get('/attendance', {
        params: {
          start_date: startOfDay.toISOString(),
          end_date: endOfDay.toISOString(),
        },
      }),
      api.get('/payroll/my-slip', { params: { month: currentMonth, year: currentYear } }),
    ])

    if (colleaguesRes.status === 'fulfilled') colleagues.value = colleaguesRes.value.data.data
    if (attendanceRes.status === 'fulfilled') {
      attendedIds.value = new Set(
        (attendanceRes.value.data.data as { userId: number }[]).map((a) => a.userId)
      )
    }
    if (slipRes.status === 'fulfilled') slip.value = slipRes.value.data.data
  } finally {
    loading.value = false
  }
})

const exportPDF = () => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Jadwal Kerja Mingguan', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Periode: ${weekLabel.value}`, 14, 23)
  doc.text(`Shift: ${SHIFT.label} • ${SHIFT.start} – ${SHIFT.end} • Senin – Sabtu`, 14, 29)

  // Calendar table
  autoTable(doc, {
    startY: 35,
    head: [DAY_NAMES],
    body: [
      DAY_NAMES.map((_, i) => {
        const shift = i === 5 ? SATURDAY_SHIFT : SHIFT
        return `${shift.start} – ${shift.end}\n${shift.label}`
      }),
    ],
    styles: { fontSize: 9, halign: 'center', cellPadding: 4 },
    headStyles: { fillColor: [0, 88, 190], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fillColor: [240, 245, 255] },
  })

  // Colleagues table
  const tableEnd = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Rekan Kerja (Shift Pagi)', 14, tableEnd)

  autoTable(doc, {
    startY: tableEnd + 4,
    head: [['No', 'Nama', 'Kode Karyawan', 'Departemen', 'Posisi', 'Shift']],
    body: colleagues.value.map((c, i) => [
      i + 1,
      c.fullName,
      c.employeeCode,
      c.department ?? '—',
      c.position ?? '—',
      `${SHIFT.label} (${SHIFT.start}–${SHIFT.end})\nSabtu: ${SATURDAY_SHIFT.start}–${SATURDAY_SHIFT.end}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 88, 190], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 255] },
  })

  doc.save(`jadwal-kerja-${weekLabel.value.replace(/\s/g, '-')}.pdf`)
}
</script>

<template>
  <AppLayout title="Jadwal Kerja">
    <div class="flex flex-col gap-4 pb-12">

      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="font-['Plus_Jakarta_Sans'] text-xl leading-7 font-bold tracking-[-0.2px] text-[#191b23]">
            Jadwal Kerja — {{ weekLabel }}
          </h1>
          <p class="text-sm leading-5 font-medium text-[#424754]">
            Shift Pagi {{ SHIFT.start }}–{{ SHIFT.end }} • Senin sampai Sabtu
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] font-medium text-[#424754] hover:bg-[#f4f4fb]"
            @click="weekOffset--"
          >
            <ChevronLeft :size="14" />
            Sebelumnya
          </button>
          <button
            v-if="weekOffset !== 0"
            class="rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] font-medium text-[#0058be] hover:bg-[#f4f4fb]"
            @click="weekOffset = 0"
          >
            Minggu Ini
          </button>
          <button
            class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3.5 py-2 text-[13px] font-medium text-[#424754] hover:bg-[#f4f4fb]"
            @click="weekOffset++"
          >
            Berikutnya
            <ChevronRight :size="14" />
          </button>
          <button
            class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border-0 bg-[#0058be] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0047a0]"
            @click="exportPDF"
          >
            <Download :size="14" />
            Ekspor PDF
          </button>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_280px] gap-4">

        <!-- Calendar grid -->
        <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-6">
          <h3 class="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#191b23] mb-5">
            Jadwal Mingguan
          </h3>

          <div class="grid grid-cols-6 gap-2">
            <!-- Day headers -->
            <div
              v-for="day in days"
              :key="day.name"
              class="text-center pb-3 border-b-2"
              :class="day.isToday ? 'border-[#0058be]' : 'border-[#ecedf7]'"
            >
              <div class="text-[10.5px] font-bold tracking-widest text-[#424754]">{{ day.name }}</div>
              <div
                class="text-lg font-bold mt-1"
                :class="day.isToday ? 'text-[#0058be]' : 'text-[#191b23]'"
              >
                {{ day.num }}
              </div>
              <div class="text-[10px] text-[#9499b0]">{{ MONTH_NAMES[day.month].slice(0, 3) }}</div>
            </div>

            <!-- Shift cards — all 6 days are morning shift -->
            <div
              v-for="day in days"
              :key="`shift-${day.name}`"
              class="rounded-[8px] px-2.5 py-3.5 text-center flex flex-col items-center gap-[3px] min-h-[110px] justify-center border"
              :class="day.isSaturday
                ? 'bg-[rgba(0,108,73,0.04)] border-[rgba(0,108,73,0.15)]'
                : 'bg-[rgba(0,108,73,0.06)] border-[rgba(0,108,73,0.2)]'"
            >
              <div class="text-[10px] font-extrabold tracking-widest text-[#006c49] mb-1">PAGI</div>
              <div class="font-mono text-sm font-bold text-[#191b23]">{{ getShiftForDay(day.isSaturday).start }}</div>
              <div class="font-mono text-xs text-[#9499b0]">–</div>
              <div class="font-mono text-sm font-bold text-[#191b23]">{{ getShiftForDay(day.isSaturday).end }}</div>
              <div v-if="day.isSaturday" class="text-[9px] text-[#9499b0] mt-1">Setengah hari</div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-3.5">

          <!-- Tomorrow shift card -->
          <div
            class="relative rounded-[12px] overflow-hidden p-[22px]"
            style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);"
          >
            <div class="pointer-events-none absolute -top-5 -right-5 h-24 w-24 rounded-full" style="background: rgba(255,255,255,0.07);"></div>
            <div class="text-[11px] font-bold tracking-widest mb-2" style="color: rgba(255,255,255,0.7);">
              SHIFT BESOK
            </div>
            <template v-if="tomorrowShift">
              <div class="font-mono text-[28px] font-extrabold text-white mb-1">
                {{ tomorrowShift.shift.start }} – {{ tomorrowShift.shift.end }}
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12.5px]" style="background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);">
                  <MapPin :size="14" />
                  Lokasi kerja
                </div>
                <div class="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[12.5px]" style="background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);">
                  <Users :size="14" />
                  {{ colleagues.length }} rekan kerja
                </div>
              </div>
            </template>
            <template v-else>
              <div class="font-mono text-[22px] font-extrabold text-white mb-1">Hari Libur</div>
              <div class="text-xs" style="color: rgba(255,255,255,0.65);">Besok adalah hari Minggu</div>
            </template>
          </div>

          <!-- Salary info -->
          <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-5">
            <h3 class="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#191b23] mb-4">
              <Wallet :size="16" class="text-[#424754]" />
              Gaji {{ MONTH_NAMES[currentMonth - 1] }} {{ currentYear }}
            </h3>
            <div v-if="slip" class="flex flex-col gap-2.5">
              <div class="flex justify-between items-center">
                <span class="text-sm text-[#424754]">Gaji Pokok</span>
                <span class="text-sm font-bold text-[#191b23]">{{ formatRp(slip.baseSalary) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-[#424754]">Tunjangan</span>
                <span class="text-sm font-bold text-[#006c49]">{{ formatRp(slip.totalAllowance) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-[#424754]">Potongan</span>
                <span class="text-sm font-bold text-[#ba1a1a]">-{{ formatRp(slip.totalDeductions) }}</span>
              </div>
              <div class="flex justify-between items-center border-t border-[#c2c6d6] pt-2.5 mt-0.5">
                <span class="text-sm font-semibold text-[#191b23]">Gaji Bersih</span>
                <span class="text-sm font-bold text-[#0058be]">{{ formatRp(slip.netSalary) }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-[#9499b0] italic">
              Slip gaji bulan ini belum tersedia.
            </div>
          </div>
        </div>
      </div>

      <!-- Colleagues section -->
      <div class="rounded-[12px] border border-[#c2c6d6] bg-white px-6 py-5">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#191b23]">
              Daftar Karyawan — Shift Pagi
            </h3>
            <p class="text-xs text-[#424754] mt-0.5">
              <template v-if="loading">Memuat...</template>
              <template v-else>{{ attendedCount }} / {{ colleagues.length }} sudah absen hari ini</template>
            </p>
          </div>
        </div>

        <div v-if="loading" class="text-sm text-[#424754] py-4 text-center">Memuat data karyawan...</div>

        <div v-else-if="colleagues.length === 0" class="text-sm text-[#9499b0] italic py-4 text-center">
          Belum ada karyawan terdaftar.
        </div>

        <table v-else class="w-full border-collapse">
          <thead>
            <tr class="bg-[#f2f3fd]">
              <th class="border-b border-[#c2c6d6] px-4 py-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Karyawan</th>
              <th class="border-b border-[#c2c6d6] px-4 py-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Departemen</th>
              <th class="border-b border-[#c2c6d6] px-4 py-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Posisi</th>
              <th class="border-b border-[#c2c6d6] px-4 py-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Shift</th>
              <th class="border-b border-[#c2c6d6] px-4 py-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Status Absen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in withStatus" :key="c.id" class="border-b border-[#c2c6d6] last:border-0">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div
                    class="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    :style="{ backgroundColor: getAvatarColor(c.id) }"
                  >
                    {{ getInitials(c.fullName) }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-[#191b23]">{{ c.fullName }}</div>
                    <div class="text-[11px] text-[#9499b0]">{{ c.employeeCode }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-[#424754]">{{ c.department ?? '—' }}</td>
              <td class="px-4 py-3 text-sm text-[#424754]">{{ c.position ?? '—' }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-[rgba(0,108,73,0.1)] px-2 py-0.5 text-[11px] font-semibold text-[#006c49]">
                  Pagi {{ SHIFT.start }}–{{ SHIFT.end }}
                </span>
                <span v-if="c.attended" class="text-[10px] text-[#9499b0] block mt-1">Sabtu: {{ SATURDAY_SHIFT.start }}–{{ SATURDAY_SHIFT.end }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  :class="c.attended
                    ? 'bg-[rgba(0,108,73,0.1)] text-[#006c49]'
                    : 'bg-[rgba(146,71,0,0.1)] text-[#924700]'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="c.attended ? 'bg-[#006c49]' : 'bg-[#924700]'"></span>
                  {{ c.attended ? 'Sudah Absen' : 'Belum Absen' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </AppLayout>
</template>
