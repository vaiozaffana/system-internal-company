import api from './api.service'

export interface LeaveRecord {
  id: number
  userId: number
  type: 'sakit' | 'cuti' | 'izin' | 'dinas'
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy: number | null
  reviewedAt: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  user?: { employeeCode: string; fullName: string; department: string | null }
}

export interface CreateLeavePayload {
  type: 'sakit' | 'cuti' | 'izin' | 'dinas'
  startDate: string
  endDate: string
  reason: string
}

export interface ReviewLeavePayload {
  status: 'approved' | 'rejected'
  reviewNote?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const leaveService = {
  async create(payload: CreateLeavePayload) {
    const { data } = await api.post<ApiResponse<LeaveRecord>>('/leave', payload)
    return data.data
  },

  async getMyRequests(status?: string) {
    const { data } = await api.get<ApiResponse<LeaveRecord[]>>('/leave/me', {
      params: status ? { status } : undefined,
    })
    return data.data
  },

  async getAll(params?: { status?: string; user_id?: string }) {
    const { data } = await api.get<ApiResponse<LeaveRecord[]>>('/leave', { params })
    return data.data
  },

  async review(id: number, payload: ReviewLeavePayload) {
    const { data } = await api.put<ApiResponse<LeaveRecord>>(`/leave/${id}/review`, payload)
    return data.data
  },

  async cancel(id: number) {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/leave/${id}`)
    return data.data
  },
}
