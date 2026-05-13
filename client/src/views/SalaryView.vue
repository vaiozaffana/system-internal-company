<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'

const selectedMonth = ref('October 2023')

const slipData = {
  ref: '#SG-202310-0452',
  company: 'PT. EMS CORE DIGITAL',
  companyAddr: 'Sudirman Central Business District, Jakarta',
  name: 'John Doe',
  dept: 'Technology & Development',
  nip: 'EMP-882901',
  jabatan: 'Senior Backend Engineer',
  income: [
    { label: 'Gaji Pokok', amount: 5000000 },
    { label: 'Tunjangan Jabatan', amount: 500000 },
    { label: 'Tunjangan Transportasi', amount: 250000 },
    { label: 'Lembur (12 Jam)', amount: 180000 },
  ],
  deductions: [
    { label: 'BPJS Ketenagakerjaan (2%)', amount: 100000 },
    { label: 'BPJS Kesehatan (1%)', amount: 50000 },
    { label: 'Pajak PPh 21', amount: 310000 },
    { label: 'Potongan Absensi (Alpha/Late)', amount: 50000 },
  ]
}

const totalIncome = slipData.income.reduce((s, i) => s + i.amount, 0)
const totalDeduction = slipData.deductions.reduce((s, i) => s + i.amount, 0)
const takehome = totalIncome - totalDeduction

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n)

const historySlips = [
  { month: 'September 2023', amount: 5380000, date: '28 Sep 2023' },
  { month: 'August 2023', amount: 5450000, date: '27 Aug 2023' },
  { month: 'July 2023', amount: 5300000, date: '28 Jul 2023' },
  { month: 'June 2023', amount: 5420000, date: '27 Jun 2023' },
  { month: 'May 2023', amount: 5420000, date: '28 May 2023' },
]
</script>

<template>
  <AppLayout>
    <div class="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <h1 class="text-[18px] font-bold text-gray-800">EMS Core</h1>
        <span class="text-gray-300">|</span>
        <span class="text-[16px] text-gray-500">Salary Slip</span>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="selectedMonth" class="border border-gray-200 rounded-md px-3 py-1.5 text-[13px] text-gray-700 outline-none">
          <option>October 2023</option>
          <option>September 2023</option>
          <option>August 2023</option>
        </select>
        <button class="w-[34px] h-[34px] rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        <button class="w-[34px] h-[34px] rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
        </button>
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white text-[13px] font-bold flex items-center justify-center">R</div>
      </div>
    </div>

    <div class="grid grid-cols-[1fr_300px] gap-5 items-start">
      <div class="flex flex-col gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-7">
          <div class="flex justify-between items-start pb-5 border-b border-dashed border-gray-200 mb-5">
            <div>
              <div class="text-[18px] font-extrabold text-gray-800">SLIP GAJI</div>
              <div class="text-[12px] text-gray-400 mt-0.5 font-mono">REF: {{ slipData.ref }}</div>
            </div>
            <div class="flex items-start gap-2 text-right">
              <div class="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div>
                <div class="text-[13px] font-bold text-blue-600">{{ slipData.company }}</div>
                <div class="text-[11.5px] text-gray-400">{{ slipData.companyAddr }}</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pb-5 border-b border-gray-100 mb-5">
            <div>
              <div class="text-[10.5px] font-semibold text-gray-400 tracking-wide uppercase mb-1">NAMA KARYAWAN</div>
              <div class="text-[13.5px] font-semibold text-gray-800">{{ slipData.name }}</div>
            </div>
            <div>
              <div class="text-[10.5px] font-semibold text-gray-400 tracking-wide uppercase mb-1">DEPARTEMEN / DIVISI</div>
              <div class="text-[13.5px] font-semibold text-gray-800">{{ slipData.dept }}</div>
            </div>
            <div>
              <div class="text-[10.5px] font-semibold text-gray-400 tracking-wide uppercase mb-1">NOMOR INDUK PEGAWAI</div>
              <div class="text-[13.5px] font-semibold text-gray-800">{{ slipData.nip }}</div>
            </div>
            <div>
              <div class="text-[10.5px] font-semibold text-gray-400 tracking-wide uppercase mb-1">JABATAN</div>
              <div class="text-[13.5px] font-semibold text-gray-800">{{ slipData.jabatan }}</div>
            </div>
          </div>

          <div class="mb-5">
            <div class="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.06em] uppercase text-emerald-500 mb-3">
              <div class="w-[22px] h-[22px] rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              PENGHASILAN
            </div>
            <div class="flex flex-col">
              <div
                v-for="item in slipData.income"
                :key="item.label"
                class="flex justify-between items-center py-[9px] border-b border-gray-100 text-[13.5px] text-gray-700">
                <span>{{ item.label }}</span>
                <span>Rp {{ fmt(item.amount) }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 text-[13.5px] font-bold text-gray-800">
                <span>Total Penghasilan Kotor</span>
                <span>Rp {{ fmt(totalIncome) }}</span>
              </div>
            </div>
          </div>

          <div class="mb-5">
            <div class="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.06em] uppercase text-red-500 mb-3">
              <div class="w-[22px] h-[22px] rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              POTONGAN
            </div>
            <div class="flex flex-col">
              <div
                v-for="item in slipData.deductions"
                :key="item.label"
                class="flex justify-between items-center py-[9px] border-b border-gray-100 text-[13.5px] text-gray-700">
                <span>{{ item.label }}</span>
                <span class="text-red-500 font-medium">- Rp {{ fmt(item.amount) }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 text-[13.5px] font-bold text-gray-800">
                <span>Total Potongan</span>
                <span class="text-red-500 font-bold">Rp {{ fmt(totalDeduction) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl px-7 py-4 mb-4">
            <div>
              <div class="text-[11px] font-bold text-white/70 tracking-[0.06em] mb-1">TOTAL GAJI BERSIH (TAKE HOME PAY)</div>
              <div class="text-[12px] text-white/55">Dibayarkan via Transfer Bank Mandiri - 1220000000</div>
            </div>
            <div class="text-[32px] font-extrabold text-white flex items-start gap-1">
              <span class="text-[18px] font-bold pt-1.5">Rp</span>
              {{ fmt(takehome) }}
            </div>
          </div>

          <div class="flex justify-around pt-5">
            <div class="flex flex-col items-center gap-2 min-w-[160px]">
              <div class="text-[12px] text-gray-400 self-start">Penerima,</div>
              <div class="border-b border-gray-300 w-full min-h-[32px] flex items-end justify-center pb-1">
              </div>
              <div class="text-[12px] text-gray-400 italic">Digitally Signed</div>
              <div class="text-[13.5px] font-bold text-gray-800 border-t-2 border-gray-800 pt-1 w-full text-center">{{ slipData.name }}</div>
            </div>
            <div class="flex flex-col items-center gap-2 min-w-[160px]">
              <div class="text-[12px] text-gray-400 self-start">Finance Manager,</div>
              <div class="border-b border-gray-300 w-full min-h-[32px] flex items-end justify-center pb-1">
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                  <path d="M5 18 Q10 8 15 14 Q20 20 25 12 Q30 4 35 10" stroke="#334155" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
              <div class="text-[13.5px] font-bold text-gray-800 border-t-2 border-gray-800 pt-1 w-full text-center">Anita Wijaya</div>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <button class="flex items-center gap-2 px-6 py-3 rounded-lg border-[1.5px] border-gray-200 bg-white text-[14px] font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Slip
          </button>
          <button class="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white text-[14px] font-semibold border-none transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-[14.5px] font-bold text-gray-800 mb-3.5">Yearly Summary</h3>
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div class="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>
              </div>
              <div>
                <div class="text-[11.5px] text-gray-500 mb-0.5">Total Earned YtD</div>
                <div class="text-[16px] font-bold text-emerald-500">Rp 54.2M</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div class="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,17 13.5,8.5 8.5,13.5 2,7"/><polyline points="16,17 22,17 22,11"/></svg>
              </div>
              <div>
                <div class="text-[11.5px] text-gray-500 mb-0.5">Max Deducted YtD</div>
                <div class="text-[16px] font-bold text-red-500">Rp 3.1M</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3.5">
            <h3 class="text-[14.5px] font-bold text-gray-800">History Slip Gaji</h3>
            <span class="text-[12px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">2023</span>
          </div>
          <div class="flex flex-col">
            <div
              v-for="h in historySlips"
              :key="h.month"
              class="flex items-center gap-2.5 py-3 border-b border-gray-100 last:border-b-0"
            >
              <div class="w-[34px] h-[34px] rounded-md bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-semibold text-gray-700">{{ h.month }}</div>
                <div class="text-[11px] text-gray-400">Completed • {{ h.date }}</div>
              </div>
              <div class="text-right ml-auto shrink-0">
                <div class="text-[13px] font-bold text-gray-800">Rp {{ fmt(h.amount) }}</div>
                <a href="#" class="text-[10.5px] font-bold text-blue-600 tracking-wide hover:underline">VIEW SLIP</a>
              </div>
            </div>
          </div>
          <button class="w-full mt-3 py-2.5 border border-gray-200 rounded-md bg-white text-[12px] font-bold text-blue-600 tracking-wide transition-colors duration-150 hover:bg-blue-50">
            VIEW ALL HISTORY
          </button>
        </div>

        <div class="bg-blue-50 rounded-xl border border-blue-100 p-5 flex gap-3 items-start">
          <div class="w-[30px] h-[30px] bg-blue-600 rounded-md flex items-center justify-center text-white shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/></svg>
          </div>
          <div>
            <div class="text-[13px] font-bold text-blue-800 mb-1">Secure Information</div>
            <div class="text-[11.5px] text-blue-600 leading-relaxed">This document is encrypted. Do not share your salary details with unauthorized personnel as per company policy Article 4.2.</div>
          </div>
        </div>

      </div>
    </div>
  </AppLayout>
</template>