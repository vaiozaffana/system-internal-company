<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileEdit,
  X,
} from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { leaveService, type LeaveRecord } from '@/services/leave.service'

const leaves = ref<LeaveRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const filterStatus = ref('')

const reviewModal = ref(false)
const reviewTarget = ref<LeaveRecord | null>(null)
const reviewAction = ref<'approved' | 'rejected'>('approved')
const reviewNote = ref('')
const reviewing = ref(false)

const load = async () => {
  loading.value = true
  try {
    leaves.value = await leaveService.getAll(filterStatus.value ? { status: filterStatus.value } : undefined)
  } catch {
    leaves.value = []
  } finally {
    loading.value = false
  }
}

const openReviewModal = (item: LeaveRecord, action: 'approved' | 'rejected') => {
  reviewTarget.value = item
  reviewAction.value = action
  reviewNote.value = ''
  reviewModal.value = true
}

const closeReviewModal = () => {
  reviewModal.value = false
  reviewTarget.value = null
  reviewNote.value = ''
}

const confirmReview = async () => {
  if (!reviewTarget.value) return
  reviewing.value = true
  error.value = null
  success.value = null
  try {
    await leaveService.review(reviewTarget.value.id, {
      status: reviewAction.value,
      reviewNote: reviewNote.value.trim() || undefined,
    })
    success.value = `Pengajuan ${reviewAction.value === 'approved' ? 'disetujui' : 'ditolak'}`
    closeReviewModal()
    await load()
  } catch (err: unknown) {
    error.value =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memproses'
  } finally {
    reviewing.value = false
  }
}

const typeLabels: Record<string, string> = { sakit: 'Sakit', cuti: 'Cuti', izin: 'Izin', dinas: 'Dinas Luar' }

const statusConfig: Record<string, { icon: typeof Clock; bg: string; text: string; label: string }> = {
  pending: { icon: Clock, bg: 'bg-[rgba(0,88,190,0.1)]', text: 'text-[#0058be]', label: 'Menunggu' },
  approved: { icon: CheckCircle2, bg: 'bg-[rgba(108,248,187,0.2)]', text: 'text-[#006c49]', label: 'Disetujui' },
  rejected: { icon: XCircle, bg: 'bg-[rgba(255,218,214,0.2)]', text: 'text-[#ba1a1a]', label: 'Ditolak' },
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(() => load())
</script>

<template>
  <AppLayout title="Kelola Izin/Cuti">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]">
            Kelola Izin / Cuti
          </h2>
          <p class="text-sm leading-5 text-[#424754]">Approve atau reject pengajuan karyawan.</p>
        </div>
        <select
          v-model="filterStatus"
          class="rounded-[8px] border border-[#c2c6d6] bg-[#f2f3fd] px-3 py-2 text-sm outline-none"
          @change="load()"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
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
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-[#f2f3fd]">
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Karyawan</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Tipe</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Tanggal</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Alasan</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Status</th>
                <th class="border-b border-[#c2c6d6] px-6 pt-4 pb-[17px] text-left text-xs leading-4 font-bold tracking-[0.24px] text-[#424754]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="px-6 py-6 text-center text-sm text-[#424754]">Memuat...</td></tr>
              <tr v-else-if="leaves.length === 0"><td colspan="6" class="px-6 py-6 text-center text-sm text-[#424754]">Tidak ada pengajuan</td></tr>
              <tr v-for="item in leaves" v-else :key="item.id" class="border-b border-[#c2c6d6]">
                <td class="px-6 py-[14px]">
                  <div class="text-sm font-medium text-[#191b23]">{{ item.user?.fullName ?? '—' }}</div>
                  <div class="text-[11px] text-[#424754]">{{ item.user?.department ?? '' }}</div>
                </td>
                <td class="px-6 py-[14px]">
                  <span class="inline-flex items-center gap-1 rounded-full bg-[#f2f3fd] px-2 py-0.5 text-[11px] font-semibold text-[#424754]">
                    <FileEdit :size="12" :stroke-width="2" />
                    {{ typeLabels[item.type] ?? item.type }}
                  </span>
                </td>
                <td class="px-6 py-[14px] text-sm text-[#191b23]">
                  {{ formatDate(item.startDate) }} — {{ formatDate(item.endDate) }}
                </td>
                <td class="px-6 py-[14px] text-[12px] text-[#424754] max-w-[180px] truncate">{{ item.reason }}</td>
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
                  <div v-if="item.status === 'pending'" class="flex items-center gap-2">
                    <button
                      type="button"
                      class="flex cursor-pointer items-center gap-1 rounded-[6px] border-0 bg-[rgba(0,108,73,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#006c49] transition hover:bg-[rgba(0,108,73,0.2)]"
                      @click="openReviewModal(item, 'approved')"
                    >
                      <CheckCircle2 :size="13" :stroke-width="2" />
                      Setujui
                    </button>
                    <button
                      type="button"
                      class="flex cursor-pointer items-center gap-1 rounded-[6px] border-0 bg-[rgba(186,26,26,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#ba1a1a] transition hover:bg-[rgba(186,26,26,0.2)]"
                      @click="openReviewModal(item, 'rejected')"
                    >
                      <XCircle :size="13" :stroke-width="2" />
                      Tolak
                    </button>
                  </div>
                  <span v-else class="text-[11px] text-[#727785]">{{ item.reviewNote ?? '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="reviewModal && reviewTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeReviewModal">
        <div class="w-full max-w-[440px] rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-[#c2c6d6] px-6 py-4">
            <h4 class="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#191b23]">
              {{ reviewAction === 'approved' ? 'Setujui' : 'Tolak' }} Pengajuan
            </h4>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-[#424754] hover:text-[#191b23]" @click="closeReviewModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>

          <div class="flex flex-col gap-4 p-6">
            <div class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] p-4">
              <div class="text-sm font-semibold text-[#191b23]">{{ reviewTarget.user?.fullName }}</div>
              <div class="mt-1 text-xs text-[#424754]">
                {{ typeLabels[reviewTarget.type] ?? reviewTarget.type }} •
                {{ formatDate(reviewTarget.startDate) }} — {{ formatDate(reviewTarget.endDate) }}
              </div>
              <div class="mt-2 text-xs text-[#424754]">{{ reviewTarget.reason }}</div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]">
                Catatan Review {{ reviewAction === 'rejected' ? '(wajib)' : '' }}
              </label>
              <textarea
                v-model="reviewNote"
                rows="3"
                :placeholder="reviewAction === 'approved' ? 'Catatan untuk karyawan...' : 'Alasan penolakan...'"
                class="resize-none rounded-[8px] border border-[#c2c6d6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0058be]"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 border-t border-[#c2c6d6] pt-4">
              <button type="button" class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754]" @click="closeReviewModal">
                Batal
              </button>
              <button
                type="button"
                :disabled="reviewing || (reviewAction === 'rejected' && !reviewNote.trim())"
                class="cursor-pointer rounded-[8px] border-0 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                :class="reviewAction === 'approved' ? 'bg-[#006c49]' : 'bg-[#ba1a1a]'"
                @click="confirmReview"
              >
                {{ reviewing ? 'Memproses...' : reviewAction === 'approved' ? 'Setujui' : 'Tolak' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
