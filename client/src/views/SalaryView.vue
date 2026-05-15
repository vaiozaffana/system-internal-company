<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Wallet, CalendarDays, TrendingUp, TrendingDown, AlertCircle } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import api from '@/services/api.service'

interface SlipData {
  baseSalary: number
  allowances: { name: string; amount: number }[]
  totalAllowance: number
  overtimeHours: number
  overtimeAmount: number
  totalEarnings: number
  deductions: {
    bpjsKetenagakerjaan: number
    bpjsKesehatan: number
    incomeTax: number
    absenceCount: number
    absenceDeduction: number
  }
  totalDeductions: number
  netSalary: number
}

const slip = ref<SlipData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const notFound = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const periodLabel = computed(() => `${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`)

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const load = async () => {
  loading.value = true
  error.value = null
  notFound.value = false
  try {
    const { data } = await api.get('/payroll/my-slip', {
      params: { month: selectedMonth.value, year: selectedYear.value },
    })
    slip.value = data.data
  } catch (err: unknown) {
    slip.value = null
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) {
      notFound.value = true
    } else {
      error.value =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Gagal memuat data gaji'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <AppLayout title="Slip Gaji">
    <div class="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[28px] leading-9 font-bold tracking-[-0.5px] text-[#191b23]">
            Slip Gaji
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Detail penghasilan dan potongan bulanan Anda.</p>
        </div>
        <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-[7px]">
          <CalendarDays :size="16" :stroke-width="2" class="text-[#424754]" />
          <select v-model="selectedMonth" class="border-0 bg-transparent text-sm outline-none" @change="load()">
            <option v-for="(m, i) in monthNames" :key="i" :value="i + 1">{{ m }}</option>
          </select>
          <input v-model.number="selectedYear" type="number" min="2020" max="2030" class="w-16 border-0 bg-transparent text-sm outline-none" @change="load()" />
        </div>
      </div>

      <div v-if="loading" class="rounded-[12px] border border-[#c2c6d6] bg-white p-8 text-center text-sm text-[#424754]">
        Memuat data gaji...
      </div>

      <div v-else-if="error" class="flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <AlertCircle :size="20" :stroke-width="2" class="mt-0.5 shrink-0" />
        <div>
          <div class="font-semibold">Terjadi kesalahan</div>
          <div class="mt-1">{{ error }}</div>
        </div>
      </div>

      <div v-else-if="notFound" class="flex flex-col items-center gap-3 rounded-[12px] border border-[#c2c6d6] bg-white p-8 text-center">
        <CalendarDays :size="40" :stroke-width="1.5" class="text-[#c2c6d6]" />
        <div>
          <div class="text-sm font-semibold text-[#191b23]">Belum ada data gaji</div>
          <div class="mt-1 text-sm text-[#424754]">Slip gaji untuk periode {{ periodLabel }} belum tersedia. Admin belum mengatur data gaji untuk bulan ini.</div>
        </div>
      </div>

      <template v-else-if="slip">
        <div class="rounded-[12px] border border-[#c2c6d6] bg-[#0058be] p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-medium text-white/70">Gaji Bersih — {{ periodLabel }}</div>
              <div class="mt-1 font-['Plus_Jakarta_Sans'] text-3xl font-bold">{{ formatRp(slip.netSalary) }}</div>
            </div>
            <Wallet :size="40" :stroke-width="1.5" class="text-white/30" />
          </div>
        </div>

        <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white">
          <div class="flex items-center gap-2 border-b border-[#c2c6d6] px-6 py-4">
            <TrendingUp :size="18" :stroke-width="2" class="text-[#006c49]" />
            <h3 class="text-sm font-semibold text-[#191b23]">Penghasilan</h3>
          </div>
          <div class="divide-y divide-[#c2c6d6]">
            <div class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">Gaji Pokok</span>
              <span class="text-sm font-semibold text-[#191b23]">{{ formatRp(slip.baseSalary) }}</span>
            </div>
            <div v-for="alw in slip.allowances" :key="alw.name" class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">{{ alw.name }}</span>
              <span class="text-sm font-semibold text-[#191b23]">{{ formatRp(alw.amount) }}</span>
            </div>
            <div v-if="slip.overtimeAmount > 0" class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">Lembur ({{ slip.overtimeHours }} jam)</span>
              <span class="text-sm font-semibold text-[#191b23]">{{ formatRp(slip.overtimeAmount) }}</span>
            </div>
            <div class="flex items-center justify-between bg-[#f2f3fd] px-6 py-3">
              <span class="text-sm font-semibold text-[#191b23]">Total Penghasilan</span>
              <span class="text-sm font-bold text-[#006c49]">{{ formatRp(slip.totalEarnings) }}</span>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white">
          <div class="flex items-center gap-2 border-b border-[#c2c6d6] px-6 py-4">
            <TrendingDown :size="18" :stroke-width="2" class="text-[#ba1a1a]" />
            <h3 class="text-sm font-semibold text-[#191b23]">Potongan</h3>
          </div>
          <div class="divide-y divide-[#c2c6d6]">
            <div class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">BPJS Ketenagakerjaan</span>
              <span class="text-sm font-semibold text-[#ba1a1a]">- {{ formatRp(slip.deductions.bpjsKetenagakerjaan) }}</span>
            </div>
            <div class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">BPJS Kesehatan</span>
              <span class="text-sm font-semibold text-[#ba1a1a]">- {{ formatRp(slip.deductions.bpjsKesehatan) }}</span>
            </div>
            <div class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">PPh 21</span>
              <span class="text-sm font-semibold text-[#ba1a1a]">- {{ formatRp(slip.deductions.incomeTax) }}</span>
            </div>
            <div v-if="slip.deductions.absenceDeduction > 0" class="flex items-center justify-between px-6 py-3">
              <span class="text-sm text-[#424754]">Potongan Absensi ({{ slip.deductions.absenceCount }}x telat)</span>
              <span class="text-sm font-semibold text-[#ba1a1a]">- {{ formatRp(slip.deductions.absenceDeduction) }}</span>
            </div>
            <div class="flex items-center justify-between bg-[rgba(186,26,26,0.05)] px-6 py-3">
              <span class="text-sm font-semibold text-[#191b23]">Total Potongan</span>
              <span class="text-sm font-bold text-[#ba1a1a]">- {{ formatRp(slip.totalDeductions) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
