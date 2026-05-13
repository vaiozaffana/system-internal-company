import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  attendanceService,
  getCurrentPosition,
  getGeolocationPermission,
  type AttendanceConfig,
  type AttendanceRecord,
  type GeolocationPermissionState,
} from '@/services/attendance.service'

const DEFAULT_CONFIG: AttendanceConfig = {
  workStartTime: '08:30',
  workEndTime: '16:30',
  lateToleranceMinutes: 15,
  minWorkDurationHours: 4,
}

export const useAttendanceStore = defineStore('attendance', () => {
  const today = ref<AttendanceRecord | null>(null)
  const history = ref<AttendanceRecord[]>([])
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const permissionState = ref<GeolocationPermissionState>('prompt')
  const config = ref<AttendanceConfig>({ ...DEFAULT_CONFIG })

  const hasCheckedIn = computed(() => today.value !== null)
  const hasCheckedOut = computed(() => today.value !== null && today.value.checkOutTime !== null)

  const currentStatus = computed<'pending' | 'checked-in' | 'checked-out'>(() => {
    if (!today.value) return 'pending'
    if (!today.value.checkOutTime) return 'checked-in'
    return 'checked-out'
  })

  const extractErrorMessage = (err: unknown) => {
    return (
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (err as Error)?.message ??
      'Something went wrong'
    )
  }

  const loadToday = async () => {
    try {
      today.value = await attendanceService.getToday()
    } catch (err) {
      error.value = extractErrorMessage(err)
    }
  }

  const loadHistory = async (limit = 50) => {
    loading.value = true
    error.value = null
    try {
      history.value = await attendanceService.getMyHistory({ limit })
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  const loadConfig = async () => {
    try {
      config.value = await attendanceService.getConfig()
    } catch {
      config.value = { ...DEFAULT_CONFIG }
    }
  }

  const refresh = async () => {
    await Promise.all([loadToday(), loadHistory(), loadConfig()])
  }

  const checkIn = async (notes?: string) => {
    actionLoading.value = true
    error.value = null
    successMessage.value = null
    try {
      const pos = await getCurrentPosition()
      await attendanceService.checkIn({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        notes,
      })
      successMessage.value = 'Absen masuk berhasil dicatat'
      await refresh()
      return true
    } catch (err) {
      error.value = extractErrorMessage(err)
      await refreshPermission()
      return false
    } finally {
      actionLoading.value = false
    }
  }

  const checkOut = async () => {
    actionLoading.value = true
    error.value = null
    successMessage.value = null
    try {
      const pos = await getCurrentPosition()
      await attendanceService.checkOut({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
      successMessage.value = 'Absen pulang berhasil dicatat'
      await refresh()
      return true
    } catch (err) {
      error.value = extractErrorMessage(err)
      await refreshPermission()
      return false
    } finally {
      actionLoading.value = false
    }
  }

  const dismissMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const refreshPermission = async () => {
    permissionState.value = await getGeolocationPermission()
  }

  return {
    today,
    history,
    loading,
    actionLoading,
    error,
    successMessage,
    permissionState,
    config,
    hasCheckedIn,
    hasCheckedOut,
    currentStatus,
    loadToday,
    loadHistory,
    loadConfig,
    refresh,
    checkIn,
    checkOut,
    dismissMessages,
    refreshPermission,
  }
})