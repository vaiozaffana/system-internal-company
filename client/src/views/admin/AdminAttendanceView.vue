<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CalendarDays, Search, X } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import TableSkeleton from '@/components/ui/TableSkeleton.vue'
import TablePagination from '@/components/ui/TablePagination.vue'
import { attendanceService, type AttendanceRecord } from '@/services/attendance.service'

type RecordWithUser = AttendanceRecord & {
  user?: { employeeCode: string; fullName: string; department: string | null }
}

const loading = ref(true)
const records = ref<RecordWithUser[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const todayStr = new Date().toISOString().slice(0, 10)
const startDate = ref(todayStr)
const endDate = ref(todayStr)
const currentPage = ref(1)
const pageSize = 10

const filteredRecords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return records.value.filter((r) => {
    const matchSearch = !q
      ? true
      : (r.user?.fullName ?? '').toLowerCase().includes(q) ||
        (r.user?.employeeCode ?? '').toLowerCase().includes(q) ||
        (r.user?.department ?? '').toLowerCase().includes(q)

    const status = (r.status ?? '').toLowerCase()
    const matchStatus = !statusFilter.value ? true : status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRecords.value.slice(start, start + pageSize)
})

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

const formatTime = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
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
      startDate: startDate.value,
      endDate: endDate.value + 'T23:59:59',
    })
    currentPage.value = 1
  } catch {
    records.value = []
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  startDate.value = todayStr
  endDate.value = todayStr
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
          <p class="text-sm leading-5 text-[#424754]">Lihat kehadiran seluruh karyawan dalam rentang tanggal.</p>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3 rounded-[12px] border border-[#c2c6d6] bg-white p-4">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold tracking-wide text-[#424754] uppercase">Dari</label>
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-[7px]">
            <CalendarDays :size="14" class="text-[#424754]" />
            <input v-model="startDate" type="date" class="border-0 bg-transparent text-sm outline-none" @change="loadData()" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold tracking-wide text-[#424754] uppercase">Sampai</label>
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-[7px]">
            <CalendarDays :size="14" class="text-[#424754]" />
            <input v-model="endDate" type="date" class="border-0 bg-transparent text-sm outline-none" @change="loadData()" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold tracking-wide text-[#424754] uppercase">Status</label>
          <select v-model="statusFilter" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none">
            <option value="">Semua</option>
            <option value="present">Hadir</option>
            <option value="late">Terlambat</option>
            <option value="early-leave">Pulang Awal</option>
            <option value="late-and-early-leave">Telat & Pulang Awal</option>
          </select>
        </div>
        <div class="flex flex-1 flex-col gap-1 min-w-[200px]">
          <label class="text-[11px] font-semibold tracking-wide text-[#424754] uppercase">Cari Karyawan</label>
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-[7px]">
            <Search :size="14" class="text-[#6b7280]" />
            <input v-model="searchQuery" type="text" placeholder="Nama, kode, departemen..." class="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#6b7280]" />
          </div>
        </div>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#c2c6d6] bg-white px-3 py-2 text-xs font-medium text-[#424754] hover:bg-[#f2f3fd]"
          @click="resetFilter"
        >
          <X :size="12" />
          Reset
        </button>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 pt-6 pb-[20px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            Data Absensi
          </h3>
          <span class="text-xs text-[#424754]">{{ filteredRecords.length }} record</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Tanggal</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Karyawan</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Department</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Masuk</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Pulang</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Status</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Catatan</th>
              </tr>
            </thead>
            <TableSkeleton v-if="loading" :rows="6" :columns="7" />
            <tbody v-else-if="filteredRecords.length === 0">
              <tr><td colspan="7" class="px-6 py-10 text-center text-sm text-[#727785]">Tidak ada data sesuai filter</td></tr>
            </tbody>
            <tbody v-else>
              <tr v-for="item in paginatedRecords" :key="item.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px] text-xs text-[#424754] whitespace-nowrap">{{ formatDate(item.checkInTime) }}</td>
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
                <td class="px-6 py-[14px] text-[11px] text-[#424754] max-w-[200px] truncate">{{ item.notes ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-if="!loading && filteredRecords.length > 0"
          :current-page="currentPage"
          :total-items="filteredRecords.length"
          :page-size="pageSize"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </AppLayout>
</template>
