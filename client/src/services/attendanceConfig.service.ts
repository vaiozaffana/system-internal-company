import api from './api.service'

export interface AttendanceConfigRecord {
  id: number
  workStartTime: string
  workEndTime: string
  lateToleranceMinutes: number
  earlyCheckInMaxHours: number
  lateCheckInMaxHours: number
  minWorkDurationHours: number
  updatedBy: number | null
  createdAt: string
  updatedAt: string
}

export type AttendanceConfigPayload = Pick<
  AttendanceConfigRecord,
  | 'workStartTime'
  | 'workEndTime'
  | 'lateToleranceMinutes'
  | 'earlyCheckInMaxHours'
  | 'lateCheckInMaxHours'
  | 'minWorkDurationHours'
>

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const attendanceConfigService = {
  async get() {
    const { data } = await api.get<ApiResponse<AttendanceConfigRecord>>('/attendance-config')
    return data.data
  },

  async update(payload: AttendanceConfigPayload) {
    const { data } = await api.put<ApiResponse<AttendanceConfigRecord>>(
      '/attendance-config',
      payload,
    )
    return data.data
  },
}
