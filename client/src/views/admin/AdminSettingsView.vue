<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import { Clock, Save, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAttendanceConfigStore } from '@/stores/attendanceConfig.store'
import type { AttendanceConfigPayload } from '@/services/attendanceConfig.service'

const store = useAttendanceConfigStore()

const form = reactive<AttendanceConfigPayload>({
  workStartTime: '08:30',
  workEndTime: '16:30',
  lateToleranceMinutes: 15,
  earlyCheckInMaxHours: 3,
  lateCheckInMaxHours: 4,
  minWorkDurationHours: 4,
})

const syncFromStore = () => {
  if (!store.config) return
  form.workStartTime = store.config.workStartTime
  form.workEndTime = store.config.workEndTime
  form.lateToleranceMinutes = store.config.lateToleranceMinutes
  form.earlyCheckInMaxHours = Number(store.config.earlyCheckInMaxHours)
  form.lateCheckInMaxHours = Number(store.config.lateCheckInMaxHours)
  form.minWorkDurationHours = Number(store.config.minWorkDurationHours)
}

watch(() => store.config, syncFromStore, { deep: true })

onMounted(async () => {
  await store.load()
  syncFromStore()
})

const handleSubmit = async () => {
  await store.save({
    workStartTime: form.workStartTime,
    workEndTime: form.workEndTime,
    lateToleranceMinutes: Number(form.lateToleranceMinutes),
    earlyCheckInMaxHours: Number(form.earlyCheckInMaxHours),
    lateCheckInMaxHours: Number(form.lateCheckInMaxHours),
    minWorkDurationHours: Number(form.minWorkDurationHours),
  })
}

const handleReset = () => {
  syncFromStore()
  store.dismissMessages()
}
</script>

<template>
  <AppLayout title="Attendance Settings">
    <div class="flex flex-col gap-6 pb-12">
      <div class="flex flex-col gap-1">
        <h2
          class="font-['Plus_Jakarta_Sans'] text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#191b23]"
        >
          Pengaturan Absensi
        </h2>
        <p class="text-base leading-6 text-[#424754]">
          Atur jam kerja, toleransi telat, dan batasan absensi untuk seluruh karyawan.
        </p>
      </div>

      <div
        v-if="store.error"
        class="flex items-start gap-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <AlertCircle :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <div class="flex-1">{{ store.error }}</div>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100"
          @click="store.dismissMessages()"
        >
          Tutup
        </button>
      </div>

      <div
        v-if="store.successMessage"
        class="flex items-start gap-3 rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        <CheckCircle2 :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <div class="flex-1">{{ store.successMessage }}</div>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent text-xs font-semibold opacity-70 hover:opacity-100"
          @click="store.dismissMessages()"
        >
          Tutup
        </button>
      </div>

      <form
        class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white"
        @submit.prevent="handleSubmit"
      >
        <div class="flex items-center gap-3 border-b border-[#c2c6d6] px-6 pt-6 pb-[25px]">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]"
          >
            <Clock :size="20" :stroke-width="2" />
          </div>
          <div>
            <h3
              class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
            >
              Aturan Jam Kerja
            </h3>
            <p class="text-[11px] leading-[14px] text-[#424754]">
              Perubahan berlaku untuk semua absen baru setelah disimpan.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 p-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="workStartTime">
              Jam Masuk
            </label>
            <input
              id="workStartTime"
              v-model="form.workStartTime"
              type="time"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="workEndTime">
              Jam Pulang
            </label>
            <input
              id="workEndTime"
              v-model="form.workEndTime"
              type="time"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="lateToleranceMinutes">
              Toleransi Telat (menit)
            </label>
            <input
              id="lateToleranceMinutes"
              v-model.number="form.lateToleranceMinutes"
              type="number"
              min="0"
              max="120"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
            <span class="text-[11px] leading-[14px] text-[#424754]">
              Lewat waktu ini, absen masuk dicatat sebagai Terlambat.
            </span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="minWorkDurationHours">
              Minimum Jam Kerja
            </label>
            <input
              id="minWorkDurationHours"
              v-model.number="form.minWorkDurationHours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
            <span class="text-[11px] leading-[14px] text-[#424754]">
              Durasi minimal check-in sampai check-out.
            </span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="earlyCheckInMaxHours">
              Batas Absen Paling Awal (jam)
            </label>
            <input
              id="earlyCheckInMaxHours"
              v-model.number="form.earlyCheckInMaxHours"
              type="number"
              min="0"
              max="12"
              step="0.5"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
            <span class="text-[11px] leading-[14px] text-[#424754]">
              Berapa jam sebelum jam masuk user boleh absen.
            </span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="lateCheckInMaxHours">
              Batas Absen Paling Telat (jam)
            </label>
            <input
              id="lateCheckInMaxHours"
              v-model.number="form.lateCheckInMaxHours"
              type="number"
              min="0"
              max="12"
              step="0.5"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
            <span class="text-[11px] leading-[14px] text-[#424754]">
              Setelah ini user wajib izin manual.
            </span>
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-3 border-t border-[#c2c6d6] bg-[#f9f9ff] px-6 py-4"
        >
          <div class="text-[11px] leading-[14px] text-[#424754]">
            Terakhir diubah: {{ store.config ? new Date(store.config.updatedAt).toLocaleString('id-ID') : '—' }}
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="store.saving"
              class="cursor-pointer rounded-[8px] border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754] transition hover:border-[#424754] disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleReset"
            >
              Reset
            </button>
            <button
              type="submit"
              :disabled="store.saving"
              class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#0058be] px-5 py-2 text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:enabled:-translate-y-px hover:enabled:bg-[#004999] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save :size="16" :stroke-width="2" />
              {{ store.saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </AppLayout>
</template>
