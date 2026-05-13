<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  Plus,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileEdit,
  Trash2,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { leaveService, type CreateLeavePayload, type LeaveRecord } from '@/services/leave.service'

const leaves = ref<LeaveRecord[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const form = reactive<CreateLeavePayload>({
  type: 'izin',
  startDate: '',
  endDate: '',
  reason: '',
})

const resetForm = () => {
  form.type = 'izin'
  form.startDate = ''
  form.endDate = ''
  form.reason = ''
}

const load = async () => {
  loading.value = true
  try {
    leaves.value = await leaveService.getMyRequests()
  } catch {
    leaves.value = []
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  saving.value = true
  error.value = null
  success.value = null
  try {
    await leaveService.create(form)
    success.value = 'Pengajuan berhasil dikirim'
    showForm.value = false
    resetForm()
    await load()
  } catch (err: unknown) {
    error.value =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Gagal mengirim pengajuan'
  } finally {
    saving.value = false
  }
}

const handleCancel = async (id: number) => {
  if (!confirm('Yakin mau membatalkan pengajuan ini?')) return
  try {
    await leaveService.cancel(id)
    success.value = 'Pengajuan dibatalkan'
    await load()
  } catch (err: unknown) {
    error.value =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Gagal membatalkan'
  }
}

const typeLabels: Record<string, string> = {
  sakit: 'Sakit',
  cuti: 'Cuti',
  izin: 'Izin',
  dinas: 'Dinas Luar',
}

const statusConfig: Record<string, { icon: typeof Clock; bg: string; text: string; label: string }> = {
  pending: { icon: Clock, bg: 'bg-[rgba(0,88,190,0.1)]', text: 'text-[#0058be]', label: 'Menunggu' },
  approved: { icon: CheckCircle2, bg: 'bg-[rgba(108,248,187,0.2)]', text: 'text-[#006c49]', label: 'Disetujui' },
  rejected: { icon: XCircle, bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]', label: 'Ditolak' },
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(() => load())
</script>

<template>
  <AppLayout title="Izin / Cuti">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Izin / Cuti
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Ajukan dan pantau status izin atau cuti Anda.</p>
        </div>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#0058be] px-5 py-[9px] text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:-translate-y-px hover:bg-[#004999]"
          @click="showForm = true"
        >
          <Plus :size="18" :stroke-width="2" />
          Ajukan Baru
        </button>
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

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">
            Riwayat Pengajuan ({{ leaves.length }})
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Tipe</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Tanggal</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Alasan</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Status</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">Memuat...</td></tr>
              <tr v-else-if="leaves.length === 0"><td colspan="5" class="px-6 py-6 text-center text-sm text-[#424754]">Belum ada pengajuan</td></tr>
              <tr v-for="item in leaves" v-else :key="item.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px]">
                  <span class="inline-flex items-center gap-1 rounded-full bg-[#f2f3fd] px-2 py-0.5 text-[11px] font-semibold text-[#424754]">
                    <FileEdit :size="12" :stroke-width="2" />
                    {{ typeLabels[item.type] ?? item.type }}
                  </span>
                </td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">
                  {{ formatDate(item.startDate) }} — {{ formatDate(item.endDate) }}
                </td>
                <td class="px-6 py-[14px] text-[12px] text-[#424754] max-w-[200px] truncate">{{ item.reason }}</td>
                <td class="px-6 py-[14px]">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="[statusConfig[item.status].bg, statusConfig[item.status].text]"
                  >
                    <component :is="statusConfig[item.status].icon" :size="12" :stroke-width="2" />
                    {{ statusConfig[item.status].label }}
                  </span>
                </td>
                <td class="px-6 py-[14px]">
                  <button
                    v-if="item.status === 'pending'"
                    type="button"
                    class="flex cursor-pointer items-center gap-1 border-0 bg-transparent text-[12px] font-medium text-[#ba1a1a] hover:underline"
                    @click="handleCancel(item.id)"
                  >
                    <Trash2 :size="13" :stroke-width="2" />
                    Batalkan
                  </button>
                  <span v-else-if="item.reviewNote" class="text-[11px] text-[#424754]">{{ item.reviewNote }}</span>
                  <span v-else class="text-[11px] text-[#727785]">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm = false">
        <div class="w-full max-w-[480px] rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 py-4">
            <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">Ajukan Izin / Cuti</h4>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-[#424754] hover:text-[#191b23]" @click="showForm = false"><X :size="20" :stroke-width="2" /></button>
          </div>
          <form class="flex flex-col gap-4 p-6" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]">Tipe</label>
              <select v-model="form.type" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]">
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="cuti">Cuti</option>
                <option value="dinas">Dinas Luar</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-medium text-[#424754]">Tanggal Mulai</label>
                <input v-model="form.startDate" type="date" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-medium text-[#424754]">Tanggal Selesai</label>
                <input v-model="form.endDate" type="date" required class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" />
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]">Alasan</label>
              <textarea v-model="form.reason" required rows="3" maxlength="1000" class="resize-none rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0058be]" placeholder="Jelaskan alasan pengajuan..."></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="showForm = false">Batal</button>
              <button type="submit" :disabled="saving" class="cursor-pointer rounded-[8px] border-0 bg-[#0058be] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {{ saving ? 'Mengirim...' : 'Kirim Pengajuan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
