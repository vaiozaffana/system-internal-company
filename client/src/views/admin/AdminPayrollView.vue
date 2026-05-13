<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { CalendarDays, Wallet, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import api from '@/services/api.service'

interface SlipRow {
  userId: number
  employeeCode: string
  fullName: string
  department: string | null
  baseSalary: number
  totalAllowance: number
  overtimeAmount: number
  totalEarnings: number
  totalDeductions: number
  netSalary: number
}

interface OvertimeRow {
  id: number
  userId: number
  date: string
  hours: number
  hourlyRate: number
  totalAmount: number
  status: string
  notes: string | null
  user?: { employeeCode: string; fullName: string; department: string | null }
}

const tab = ref<'slips' | 'overtime' | 'config'>('slips')
const loading = ref(true)
const slips = ref<SlipRow[]>([])
const overtime = ref<OvertimeRow[]>([])
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const periodLabel = computed(() => `${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`)

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const config = ref({
  overtimeHourlyRate: 50000,
  absenceDeductionPerDay: 50000,
  bpjsKetenagakerjaanPercent: 2,
  bpjsKesehatanPercent: 1,
  incomeTaxPercent: 21,
})
const savingConfig = ref(false)

const loadSlips = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/payroll/generate', {
      params: { month: selectedMonth.value, year: selectedYear.value },
    })
    slips.value = data.data.slips
  } catch {
    slips.value = []
  } finally {
    loading.value = false
  }
}

const loadOvertime = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/payroll/overtime', {
      params: { month: selectedMonth.value, year: selectedYear.value },
    })
    overtime.value = data.data
  } catch {
    overtime.value = []
  } finally {
    loading.value = false
  }
}

const loadConfig = async () => {
  try {
    const { data } = await api.get('/payroll/config')
    config.value = data.data
  } catch {}
}

const saveConfig = async () => {
  savingConfig.value = true
  error.value = null
  success.value = null
  try {
    await api.put('/payroll/config', {
      overtimeHourlyRate: Number(config.value.overtimeHourlyRate),
      absenceDeductionPerDay: Number(config.value.absenceDeductionPerDay),
      bpjsKetenagakerjaanPercent: Number(config.value.bpjsKetenagakerjaanPercent),
      bpjsKesehatanPercent: Number(config.value.bpjsKesehatanPercent),
      incomeTaxPercent: Number(config.value.incomeTaxPercent),
    })
    success.value = 'Konfigurasi payroll disimpan'
  } catch (err: unknown) {
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan'
  } finally {
    savingConfig.value = false
  }
}

const handleApprove = async (id: number) => {
  try {
    await api.put(`/payroll/overtime/${id}/approve`)
    success.value = 'Lembur disetujui'
    await loadOvertime()
  } catch (err: unknown) {
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
  }
}

const handleReject = async (id: number) => {
  try {
    await api.put(`/payroll/overtime/${id}/reject`)
    success.value = 'Lembur ditolak'
    await loadOvertime()
  } catch (err: unknown) {
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal'
  }
}

const switchTab = (t: 'slips' | 'overtime' | 'config') => {
  tab.value = t
  if (t === 'slips') loadSlips()
  else if (t === 'overtime') loadOvertime()
  else loadConfig()
}

onMounted(async () => {
  await loadConfig()
  await loadSlips()
})
</script>

<template>
  <AppLayout title="Payroll">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Payroll
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Kelola gaji, lembur, dan konfigurasi payroll.</p>
        </div>
        <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-[7px]">
          <CalendarDays :size="16" :stroke-width="2" class="text-[#424754]" />
          <select v-model="selectedMonth" class="border-0 bg-transparent text-sm outline-none" @change="switchTab(tab)">
            <option v-for="(m, i) in monthNames" :key="i" :value="i + 1">{{ m }}</option>
          </select>
          <input v-model.number="selectedYear" type="number" min="2020" max="2030" class="w-16 border-0 bg-transparent text-sm outline-none" @change="switchTab(tab)" />
        </div>
      </div>

      <div
        v-if="error || success"
        class="flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm"
        :class="error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'"
      >
        <AlertCircle v-if="error" :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <CheckCircle2 v-else :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <span class="flex-1">{{ error ?? success }}</span>
        <button type="button" class="cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100" @click="error = null; success = null">Tutup</button>
      </div>

      <div class="flex gap-1 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] p-1">
        <button
          v-for="t in (['slips', 'overtime', 'config'] as const)"
          :key="t"
          type="button"
          class="flex-1 cursor-pointer rounded-[6px] border-0 px-4 py-2 text-sm font-medium transition"
          :class="tab === t ? 'bg-white text-[#0058be] shadow-sm' : 'bg-transparent text-[#424754] hover:text-[#191b23]'"
          @click="switchTab(t)"
        >
          {{ t === 'slips' ? 'Slip Gaji' : t === 'overtime' ? 'Lembur' : 'Konfigurasi' }}
        </button>
      </div>

      <div v-if="tab === 'slips'" class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            Slip Gaji — {{ periodLabel }} ({{ slips.length }} karyawan)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Karyawan</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#424754]">Gaji Pokok</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#424754]">Tunjangan</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#424754]">Lembur</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#006c49]">Total</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#ba1a1a]">Potongan</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#0058be]">Bersih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="7" class="px-4 py-6 text-center text-sm text-[#424754]">Memuat...</td></tr>
              <tr v-else-if="slips.length === 0"><td colspan="7" class="px-4 py-6 text-center text-sm text-[#424754]">Tidak ada data (pastikan EmployeeSalary sudah diatur)</td></tr>
              <tr v-for="s in slips" v-else :key="s.userId" class="border-b border-[#c2c6d6]">
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-[#191b23]">{{ s.fullName }}</div>
                  <div class="text-[11px] text-[#424754]">{{ s.employeeCode }}</div>
                </td>
                <td class="px-4 py-3 text-right text-sm text-[#191b23]">{{ formatRp(s.baseSalary) }}</td>
                <td class="px-4 py-3 text-right text-sm text-[#191b23]">{{ formatRp(s.totalAllowance) }}</td>
                <td class="px-4 py-3 text-right text-sm text-[#191b23]">{{ formatRp(s.overtimeAmount) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-[#006c49]">{{ formatRp(s.totalEarnings) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-[#ba1a1a]">{{ formatRp(s.totalDeductions) }}</td>
                <td class="px-4 py-3 text-right text-sm font-bold text-[#0058be]">{{ formatRp(s.netSalary) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="tab === 'overtime'" class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            Record Lembur — {{ periodLabel }}
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Karyawan</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Tanggal</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#424754]">Jam</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-right text-xs font-bold tracking-[0.24px] text-[#424754]">Total</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Status</th>
                <th class="border-b border-[#c2c6d6] px-4 pt-4 pb-3 text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="px-4 py-6 text-center text-sm text-[#424754]">Memuat...</td></tr>
              <tr v-else-if="overtime.length === 0"><td colspan="6" class="px-4 py-6 text-center text-sm text-[#424754]">Tidak ada record lembur</td></tr>
              <tr v-for="ot in overtime" v-else :key="ot.id" class="border-b border-[#c2c6d6]">
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-[#191b23]">{{ ot.user?.fullName ?? '—' }}</div>
                  <div class="text-[11px] text-[#424754]">{{ ot.user?.employeeCode ?? '' }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-[#191b23]">{{ new Date(ot.date).toLocaleDateString('id-ID') }}</td>
                <td class="px-4 py-3 text-right text-sm text-[#191b23]">{{ Number(ot.hours).toFixed(1) }} jam</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-[#191b23]">{{ formatRp(Number(ot.totalAmount)) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="ot.status === 'approved' ? 'bg-[rgba(108,248,187,0.2)] text-[#006c49]' : ot.status === 'rejected' ? 'bg-[rgba(255,218,214,0.2)] text-[#ba1a1a]' : 'bg-[rgba(0,88,190,0.1)] text-[#0058be]'"
                  >
                    <CheckCircle2 v-if="ot.status === 'approved'" :size="12" :stroke-width="2" />
                    <XCircle v-else-if="ot.status === 'rejected'" :size="12" :stroke-width="2" />
                    <Clock v-else :size="12" :stroke-width="2" />
                    {{ ot.status === 'approved' ? 'Disetujui' : ot.status === 'rejected' ? 'Ditolak' : 'Pending' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div v-if="ot.status === 'pending'" class="flex items-center gap-2">
                    <button type="button" class="cursor-pointer rounded-[6px] border-0 bg-[rgba(0,108,73,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#006c49] hover:bg-[rgba(0,108,73,0.2)]" @click="handleApprove(ot.id)">Approve</button>
                    <button type="button" class="cursor-pointer rounded-[6px] border-0 bg-[rgba(186,26,26,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#ba1a1a] hover:bg-[rgba(186,26,26,0.2)]" @click="handleReject(ot.id)">Reject</button>
                  </div>
                  <span v-else class="text-[11px] text-[#727785]">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="tab === 'config'" class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white">
        <div class="flex items-center gap-2 border-b border-[#c2c6d6] px-6 py-4">
          <Wallet :size="18" :stroke-width="2" class="text-[#0058be]" />
          <h3 class="text-sm font-semibold text-[#191b23]">Konfigurasi Payroll</h3>
        </div>
        <form class="grid grid-cols-2 gap-5 p-6" @submit.prevent="saveConfig">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]">Rate Lembur / Jam (Rp)</label>
            <input v-model.number="config.overtimeHourlyRate" type="number" min="0" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]">Potongan Absensi / Hari (Rp)</label>
            <input v-model.number="config.absenceDeductionPerDay" type="number" min="0" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]">BPJS Ketenagakerjaan (%)</label>
            <input v-model.number="config.bpjsKetenagakerjaanPercent" type="number" min="0" max="100" step="0.1" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]">BPJS Kesehatan (%)</label>
            <input v-model.number="config.bpjsKesehatanPercent" type="number" min="0" max="100" step="0.1" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]">PPh 21 (%)</label>
            <input v-model.number="config.incomeTaxPercent" type="number" min="0" max="100" step="0.1" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
          </div>
          <div class="col-span-2 flex justify-end pt-2">
            <button type="submit" :disabled="savingConfig" class="cursor-pointer rounded-[8px] border-0 bg-[#0058be] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {{ savingConfig ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
