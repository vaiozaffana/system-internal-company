import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  attendanceConfigService,
  type AttendanceConfigPayload,
  type AttendanceConfigRecord,
} from '@/services/attendanceConfig.service'

export const useAttendanceConfigStore = defineStore('attendanceConfig', () => {
  const config = ref<AttendanceConfigRecord | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const extractError = (err: unknown) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    (err as Error)?.message ??
    'Gagal memproses permintaan'

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      config.value = await attendanceConfigService.get()
    } catch (err) {
      error.value = extractError(err)
    } finally {
      loading.value = false
    }
  }

  const save = async (payload: AttendanceConfigPayload) => {
    saving.value = true
    error.value = null
    successMessage.value = null
    try {
      config.value = await attendanceConfigService.update(payload)
      successMessage.value = 'Konfigurasi absensi berhasil disimpan'
      return true
    } catch (err) {
      error.value = extractError(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const dismissMessages = () => {
    error.value = null
    successMessage.value = null
  }

  return { config, loading, saving, error, successMessage, load, save, dismissMessages }
})
