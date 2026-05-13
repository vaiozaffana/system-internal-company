<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { FileDown, CalendarDays } from 'lucide-vue-next'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import AppLayout from '@/components/layout/AppLayout.vue'
import api from '@/services/api.service'

interface ReportRow {
  userId: number
  employeeCode: string
  fullName: string
  department: string
  totalPresent: number
  totalLate: number
  totalEarlyLeave: number
  totalDays: number
}

interface ReportResponse {
  success: boolean
  data: { month: number; year: number; summary: ReportRow[] }
}

const loading = ref(true)
const rows = ref<ReportRow[]>([])
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const periodLabel = computed(() => `${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`)

const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get<ReportResponse>('/attendance/report', {
      params: { month: selectedMonth.value, year: selectedYear.value },
    })
    rows.value = data.data.summary
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

const handleExportPdf = () => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Rekap Absensi - ${periodLabel.value}`, 14, 20)
  doc.setFontSize(10)
  doc.text(`Digenerate: ${new Date().toLocaleString('id-ID')}`, 14, 28)

  autoTable(doc, {
    startY: 35,
    head: [['Kode', 'Nama', 'Department', 'Hadir', 'Telat', 'Pulang Awal', 'Total Hari']],
    body: rows.value.map((r) => [
      r.employeeCode,
      r.fullName,
      r.department || '—',
      r.totalPresent,
      r.totalLate,
      r.totalEarlyLeave,
      r.totalDays,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 88, 190] },
  })

  doc.save(`rekap-absensi-${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}.pdf`)
}

onMounted(() => load())
</script>

<template>
  <AppLayout title="Rekap Absensi">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Rekap Absensi
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Laporan kehadiran bulanan per karyawan.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-[7px]">
            <CalendarDays :size="16" :stroke-width="2" class="text-[#424754]" />
            <select v-model="selectedMonth" class="border-0 bg-transparent text-sm outline-none" @change="load()">
              <option v-for="(m, i) in monthNames" :key="i" :value="i + 1">{{ m }}</option>
            </select>
            <input v-model.number="selectedYear" type="number" min="2020" max="2030" class="w-16 border-0 bg-transparent text-sm outline-none" @change="load()" />
          </div>
          <button
            type="button"
            :disabled="rows.length === 0"
            class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#0058be] px-5 py-[9px] text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:-translate-y-px hover:bg-[#004999] disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleExportPdf"
          >
            <FileDown :size="18" :stroke-width="2" />
            Download PDF
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            {{ periodLabel }} ({{ rows.length }} karyawan)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Kode</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Nama</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Department</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-center text-xs leading-4 font-bold tracking-[0.24px] text-[#006c49]">Hadir</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-center text-xs leading-4 font-bold tracking-[0.24px] text-[#924700]">Telat</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-center text-xs leading-4 font-bold tracking-[0.24px] text-[#ba1a1a]">Pulang Awal</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-center text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Total Hari</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="7" class="px-6 py-6 text-center text-sm text-[#424754]">Memuat...</td></tr>
              <tr v-else-if="rows.length === 0"><td colspan="7" class="px-6 py-6 text-center text-sm text-[#424754]">Tidak ada data untuk periode ini</td></tr>
              <tr v-for="row in rows" v-else :key="row.userId" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px] text-xs font-mono text-[#424754]">{{ row.employeeCode }}</td>
                <td class="px-6 py-[14px] text-sm font-medium text-[#191b23]">{{ row.fullName }}</td>
                <td class="px-6 py-[14px] text-sm text-[#424754]">{{ row.department || '—' }}</td>
                <td class="px-6 py-[14px] text-center text-sm font-semibold text-[#006c49]">{{ row.totalPresent }}</td>
                <td class="px-6 py-[14px] text-center text-sm font-semibold text-[#924700]">{{ row.totalLate }}</td>
                <td class="px-6 py-[14px] text-center text-sm font-semibold text-[#ba1a1a]">{{ row.totalEarlyLeave }}</td>
                <td class="px-6 py-[14px] text-center text-sm font-semibold text-[#191b23]">{{ row.totalDays }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
