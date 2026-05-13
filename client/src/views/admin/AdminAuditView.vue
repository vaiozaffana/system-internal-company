<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Shield, Search } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
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
const filterEntity = ref('')

const load = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = { limit: '100' }
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
          <p class="text-sm leading-5 text-[#424754]">Riwayat aktivitas sistem.</p>
        </div>
        <div class="flex items-center gap-3">
          <select
            v-model="filterEntity"
            class="rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-2 text-sm outline-none"
            @change="load()"
          >
            <option value="">Semua Entity</option>
            <option value="leave_request">Leave Request</option>
            <option value="user">User</option>
            <option value="attendance_config">Attendance Config</option>
          </select>
        </div>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Waktu</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">User ID</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Action</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Entity</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Entity ID</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="px-6 py-6 text-center text-sm text-[#424754]">Memuat...</td></tr>
              <tr v-else-if="logs.length === 0"><td colspan="6" class="px-6 py-6 text-center text-sm text-[#424754]">Belum ada log</td></tr>
              <tr v-for="log in logs" v-else :key="log.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px] text-[12px] text-[#424754] whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">{{ log.userId ?? '—' }}</td>
                <td class="px-6 py-[14px]">
                  <span class="inline-flex items-center gap-1 rounded-full bg-[#f2f3fd] px-2 py-0.5 text-[11px] font-semibold text-[#0058be]">
                    <Shield :size="11" :stroke-width="2" />
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-[14px] text-sm text-[#424754]">{{ log.entity }}</td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">{{ log.entityId ?? '—' }}</td>
                <td class="px-6 py-[14px] text-[11px] text-[#424754] max-w-[280px]">
                  <template v-if="parseDetails(log.details)">
                    <div v-if="typeof parseDetails(log.details) === 'object'" class="flex flex-col gap-0.5">
                      <span v-if="parseDetails(log.details).employeeName" class="font-medium text-[#191b23]">
                        {{ parseDetails(log.details).employeeName }}
                      </span>
                      <span v-if="parseDetails(log.details).leaveType">
                        Tipe: {{ parseDetails(log.details).leaveType }}
                        <span v-if="parseDetails(log.details).startDate">
                          ({{ parseDetails(log.details).startDate }} — {{ parseDetails(log.details).endDate }})
                        </span>
                      </span>
                      <span v-if="parseDetails(log.details).reason" class="truncate">
                        Alasan: {{ parseDetails(log.details).reason }}
                      </span>
                      <span v-if="parseDetails(log.details).reviewNote" class="italic">
                        Catatan: {{ parseDetails(log.details).reviewNote }}
                      </span>
                    </div>
                    <span v-else>{{ parseDetails(log.details) }}</span>
                  </template>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
