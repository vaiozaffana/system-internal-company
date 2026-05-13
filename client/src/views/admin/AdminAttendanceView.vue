<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, Search } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { attendanceService, type AttendanceRecord } from '@/services/attendance.service'

const loading = ref(true)
const records = ref<(AttendanceRecord & { user?: { employeeCode: string; fullName: string; department: string | null } })[]>([])
const searchQuery = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))

const filteredRecords = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return records.value
  return records.value.filter(
    (r) =>
      (r.user?.fullName ?? '').toLowerCase().includes(q) ||
      (r.user?.employeeCode ?? '').toLowerCase().includes(q) ||
      (r.user?.department ?? '').toLowerCase().includes(q),
  )
})

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

const loadData = async () => {
  loading.value = true
  try {
    records.value = await attendanceService.getAllAttendance({
      startDate: selectedDate.value,
      endDate: selectedDate.value + 'T23:59:59',
    })
  } catch {
    records.value = []
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  loadData()
}

onMounted(() => loadData())
</script>

<template>
  <AppLayout title="Monitoring Absensi">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Monitoring Absensi
          </h2>
          <p class="text-sm leading-5 text-[#424754]">
            Lihat kehadiran seluruh karyawan per tanggal.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-[7px]">
            <CalendarDays :size="16" :stroke-width="2" class="text-[#424754]" />
            <input
              v-model="selectedDate"
              type="date"
              class="border-0 bg-transparent text-sm text-[#191b23] outline-none"
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            Data Absensi ({{ filteredRecords.length }} record)
          </h3>
          <div class="flex items-center gap-2 rounded-full border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-[5px]">
            <Search :size="16" :stroke-width="2" class="text-[#6b7280]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari karyawan..."
              class="w-48 border-0 bg-transparent px-2 py-px text-sm text-[#191b23] outline-none placeholder:text-[#6b7280]"
            />
          </div>
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
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-6 text-center text-sm text-[#424754]">Memuat data...</td>
              </tr>
              <tr v-else-if="filteredRecords.length === 0">
                <td colspan="6" class="px-6 py-6 text-center text-sm text-[#424754]">Tidak ada data absensi untuk tanggal ini</td>
              </tr>
              <tr v-for="item in filteredRecords" v-else :key="item.id" class="border-b border-[#c2c6d6]">
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
                <td class="px-6 py-[14px] text-[11px] text-[#424754]">{{ item.notes ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
