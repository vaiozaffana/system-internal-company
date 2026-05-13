import api from './api.service'

export interface UserRecord {
  id: number
  employeeCode: string
  fullName: string
  email: string
  phoneNumber: string | null
  department: string | null
  position: string | null
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  employeeCode: string
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  department?: string
  position?: string
  role?: 'admin' | 'user'
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
  phoneNumber?: string | null
  department?: string | null
  position?: string | null
  role?: 'admin' | 'user'
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const usersService = {
  async getAll(params?: { department?: string; is_active?: string }) {
    const { data } = await api.get<ApiResponse<UserRecord[]>>('/users', { params })
    return data.data
  },

  async getCount() {
    const { data } = await api.get<ApiResponse<{ total: number }>>('/users/count')
    return data.data.total
  },

  async getById(id: number) {
    const { data } = await api.get<ApiResponse<UserRecord>>(`/users/${id}`)
    return data.data
  },

  async create(payload: CreateUserPayload) {
    const { data } = await api.post<ApiResponse<UserRecord>>('/users', payload)
    return data.data
  },

  async update(id: number, payload: UpdateUserPayload) {
    const { data } = await api.put<ApiResponse<UserRecord>>(`/users/${id}`, payload)
    return data.data
  },

  async remove(id: number) {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/users/${id}`)
    return data.data
  },

  async resetPassword(id: number, newPassword?: string) {
    const { data } = await api.put<ApiResponse<{ message: string; newPassword: string }>>(
      `/users/${id}/reset-password`,
      { newPassword },
    )
    return data.data
  },
}
