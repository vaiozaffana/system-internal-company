<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Shield, Search, CalendarDays, X } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import TableSkeleton from '@/components/ui/TableSkeleton.vue'
import TablePagination from '@/components/ui/TablePagination.vue'
import api from '@/services/api.service'

interface AuditRecord {
  id: number
  userId: number | null
  action: string
  entity: string
  entityId: number | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

const logs = ref<AuditRecord[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filterEntity = ref('')
const filterAction = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const pageSize = 15

const filteredLogs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return logs.value.filter((log) => {
    const matchSearch = !q
      ? true
      : log.action.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        (log.details ?? '').toLowerCase().includes(q) ||
        String(log.userId ?? '').includes(q)
    const matchEntity = !filterEntity.value || log.entity === filterEntity.value
    const matchAction = !filterAction.value || log.action.includes(filterAction.value)
    const matchStart = !startDate.value || new Date(log.createdAt) >= new Date(startDate.value)
    const matchEnd = !endDate.value || new Date(log.createdAt) <= new Date(endDate.value + 'T23:59:59')
    return matchSearch && matchEntity && matchAction && matchStart && matchEnd
  })
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredLogs.value.slice(start, start + pageSize)
})

watch([searchQuery, filterEntity, filterAction, startDate, endDate], () => {
  currentPage.value = 1
})

const load = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { limit: '500' }
    if (filterEntity.value) params.entity = filterEntity.value
    const { data } = await api.get<{ data: AuditRecord[] }>('/audit-logs', { params })
    logs.value = data.data
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const parseDetails = (raw: string | null) => {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

const formatValue = (value: unknown, key?: string): string => {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if ('from' in obj && 'to' in obj) {
      const fmt = (v: unknown) => {
        if (key === 'overtimeHourlyRate' || key === 'absenceDeductionPerDay' || key === 'baseSalary') {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(Number(v))
        }
        if (typeof v === 'number' && key && key.toLowerCase().includes('percent')) {
          return `${v}%`
        }
        return String(v)
      }
      return `${fmt(obj.from)} → ${fmt(obj.to)}`
    }
    return JSON.stringify(value)
  }
  if (key === 'baseSalary' && !isNaN(Number(value))) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(value))
  }
  return String(value)
}

const ACTION_KEY_WHITELIST: Record<string, string[]> = {
  leave_created: ['employeeName', 'reason'],
  leave_approved: ['employeeName', 'reason'],
  leave_rejected: ['employeeName', 'reason'],
  leave_cancelled: ['employeeName', 'reason'],
  employee_salary_updated: ['baseSalary'],
}

const KEY_LABEL_OVERRIDE: Record<string, string> = {
  employeeName: 'Nama',
  reason: 'Alasan',
  baseSalary: 'Gaji Pokok',
  leaveType: 'Tipe',
  reviewNote: 'Catatan',
  startDate: 'Mulai',
  endDate: 'Selesai',
  email: 'Email',
  fields: 'Field',
}

const filterDetails = (action: string, details: Record<string, unknown>) => {
  const whitelist = ACTION_KEY_WHITELIST[action]
  if (!whitelist) return details
  const result: Record<string, unknown> = {}
  for (const k of whitelist) {
    if (details[k] !== undefined && details[k] !== null && details[k] !== '') {
      result[k] = details[k]
    }
  }
  return result
}

const formatKeyLabel = (key: string) => KEY_LABEL_OVERRIDE[key] || formatKey(key)

const resetFilter = () => {
  searchQuery.value = ''
  filterEntity.value = ''
  filterAction.value = ''
  startDate.value = ''
  endDate.value = ''
}

const actionTone = (action: string) => {
  if (action.includes('failed') || action.includes('deleted') || action.includes('rejected'))
    return { bg: 'bg-[rgba(186,26,26,0.1)]', text: 'text-[#ba1a1a]' }
  if (action.includes('login') || action.includes('logout'))
    return { bg: 'bg-[rgba(0,88,190,0.1)]', text: 'text-[#0058be]' }
  if (action.includes('created') || action.includes('approved'))
    return { bg: 'bg-[rgba(0,108,73,0.1)]', text: 'text-[#006c49]' }
  return { bg: 'bg-[#f2f3fd]', text: 'text-[#424754]' }
}

onMounted(() => load())
</script>

<template>
  <AppLayout title="Audit Log">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Audit Log
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Riwayat aktivitas sistem dan pengguna.</p>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3 rounded-[12px] border border-[#c2c6d6] bg-white p-4">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-[#424754]">Dari</label>
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-[7px]">
            <CalendarDays :size="14" class="text-[#424754]" />
            <input v-model="startDate" type="date" class="border-0 bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-[#424754]">Sampai</label>
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-[7px]">
            <CalendarDays :size="14" class="text-[#424754]" />
            <input v-model="endDate" type="date" class="border-0 bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-[#424754]">Entity</label>
          <select v-model="filterEntity" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none" @change="load()">
            <option value="">Semua Entity</option>
            <option value="user">User</option>
            <option value="attendance">Attendance</option>
            <option value="attendance_config">Attendance Config</option>
            <option value="leave_request">Leave Request</option>
            <option value="payroll">Payroll</option>
            <option value="payroll_config">Payroll Config</option>
            <option value="overtime">Overtime</option>
            <option value="employee_salary">Employee Salary</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-[#424754]">Action</label>
          <select v-model="filterAction" class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2 text-sm outline-none">
            <option value="">Semua Action</option>
            <option value="login_success">Login Success</option>
            <option value="login_failed">Login Failed</option>
            <option value="logout">Logout</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="password">Password</option>
          </select>
        </div>
        <div class="flex flex-1 flex-col gap-1 min-w-[200px]">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-[#424754]">Cari</label>
          <div class="flex items-center gap-2 rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-[7px]">
            <Search :size="14" class="text-[#6b7280]" />
            <input v-model="searchQuery" type="text" placeholder="Action, entity, user ID, detail..." class="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#6b7280]" />
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
            Riwayat Aktivitas
          </h3>
          <span class="text-xs text-[#424754]">{{ filteredLogs.length }} log</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Waktu</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">User ID</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Action</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Entity</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Entity ID</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs font-bold tracking-[0.24px] text-[#424754]">Details</th>
              </tr>
            </thead>
            <TableSkeleton v-if="loading" :rows="6" :columns="6" />
            <tbody v-else-if="filteredLogs.length === 0">
              <tr><td colspan="6" class="px-6 py-10 text-center text-sm text-[#727785]">Tidak ada log sesuai filter</td></tr>
            </tbody>
            <tbody v-else>
              <tr v-for="log in paginatedLogs" :key="log.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px] text-[12px] text-[#424754] whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">{{ log.userId ?? '—' }}</td>
                <td class="px-6 py-[14px]">
                  <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', actionTone(log.action).bg, actionTone(log.action).text]">
                    <Shield :size="11" :stroke-width="2" />
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-[14px] text-sm text-[#424754]">{{ log.entity }}</td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">{{ log.entityId ?? '—' }}</td>
                <td class="px-6 py-[14px] text-[11px] text-[#424754] max-w-[320px]">
                  <template v-if="parseDetails(log.details)">
                    <div v-if="typeof parseDetails(log.details) === 'object'" class="flex flex-col gap-0.5">
                      <div
                        v-for="(value, key) in filterDetails(log.action, parseDetails(log.details))"
                        :key="key"
                        class="flex gap-1.5"
                      >
                        <span class="font-medium text-[#727785] whitespace-nowrap">{{ formatKeyLabel(String(key)) }}:</span>
                        <span class="text-[#191b23] truncate">{{ formatValue(value, String(key)) }}</span>
                      </div>
                    </div>
                    <span v-else>{{ parseDetails(log.details) }}</span>
                  </template>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-if="!loading && filteredLogs.length > 0"
          :current-page="currentPage"
          :total-items="filteredLogs.length"
          :page-size="pageSize"
          @update:current-page="currentPage = $event"
        />
      </div>
    </div>
  </AppLayout>
</template>
