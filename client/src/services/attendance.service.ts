import api from './api.service'

export interface AttendanceRecord {
  id: number
  userId: number
  checkInTime: string
  checkOutTime: string | null
  checkInLatitude: number | string
  checkInLongitude: number | string
  checkOutLatitude: number | string | null
  checkOutLongitude: number | string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface LocationCheck {
  isWithinRadius: boolean
  distance: number
  allowedRadius: number
}

export interface AttendanceConfig {
  workStartTime: string
  workEndTime: string
  lateToleranceMinutes: number
  minWorkDurationHours: number
}

export interface CheckInResponse extends AttendanceRecord {
  locationCheck?: LocationCheck
  lateMinutes?: number
}

export interface CheckOutResponse extends AttendanceRecord {
  locationCheck?: LocationCheck
  workDurationHours?: number
  earlyLeaveMinutes?: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface GeoPayload {
  latitude: number
  longitude: number
  notes?: string
}

export const attendanceService = {
  async checkIn(payload: GeoPayload) {
    const { data } = await api.post<ApiResponse<CheckInResponse>>('/attendance/check-in', payload)
    return data.data
  },

  async checkOut(payload: Omit<GeoPayload, 'notes'>) {
    const { data } = await api.post<ApiResponse<CheckOutResponse>>(
      '/attendance/check-out',
      payload,
    )
    return data.data
  },

  async getConfig() {
    const { data } = await api.get<ApiResponse<AttendanceConfig>>('/attendance/config')
    return data.data
  },

  async getToday() {
    const { data } = await api.get<ApiResponse<AttendanceRecord | null>>('/attendance/me/today')
    return data.data
  },

  async getMyHistory(params?: { startDate?: string; endDate?: string; limit?: number }) {
    const { data } = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance/me', {
      params: {
        start_date: params?.startDate,
        end_date: params?.endDate,
        limit: params?.limit,
      },
    })
    return data.data
  },

  async checkLocation(latitude: number, longitude: number) {
    const { data } = await api.get<
      ApiResponse<LocationCheck & { latitude: number; longitude: number }>
    >('/attendance/check-location', {
      params: { lat: latitude, lng: longitude },
    })
    return data.data
  },
}

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser kamu tidak mendukung Geolocation'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      async (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          const isBrave = await detectBrave()
          if (isBrave) {
            reject(
              new Error(
                'Akses lokasi diblokir oleh Brave Shields. Klik ikon singa di address bar, turunkan Shields untuk situs ini (atau buka brave://settings/content/location), lalu refresh.',
              ),
            )
          } else {
            reject(
              new Error(
                'Akses lokasi diblokir. Klik ikon gembok/info di address bar browser, izinkan Location, lalu coba lagi.',
              ),
            )
          }
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(
            new Error(
              'Lokasi tidak tersedia. Pastikan GPS/Location Services di perangkat menyala.',
            ),
          )
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('Timeout mengambil lokasi. Coba lagi di area dengan sinyal lebih baik.'))
        } else {
          reject(new Error(err.message || 'Gagal mengambil lokasi'))
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}

interface BraveNavigator extends Navigator {
  brave?: { isBrave: () => Promise<boolean> }
}

const detectBrave = async (): Promise<boolean> => {
  const nav = navigator as BraveNavigator
  if (typeof nav.brave?.isBrave !== 'function') return false
  try {
    return await nav.brave.isBrave()
  } catch {
    return false
  }
}

export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'

export const getGeolocationPermission = async (): Promise<GeolocationPermissionState> => {
  if (!navigator.geolocation) return 'unsupported'
  if (!navigator.permissions?.query) return 'prompt'
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    return result.state as GeolocationPermissionState
  } catch {
    return 'prompt'
  }
}
