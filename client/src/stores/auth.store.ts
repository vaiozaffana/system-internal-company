import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api, { clearToken, getToken, setToken } from '@/services/api.service'

export interface AuthUser {
  id: number
  employeeCode: string
  fullName: string
  email: string
  phoneNumber?: string | null
  department?: string | null
  position?: string | null
  role: 'admin' | 'user'
  isActive: boolean
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: AuthUser
  }
}

interface MeResponse {
  success: boolean
  message: string
  data: AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(getToken())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
      token.value = data.data.token
      user.value = data.data.user
      setToken(data.data.token)
      return true
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please try again.'
      error.value = message
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchCurrentUser = async () => {
    if (!token.value) return null
    try {
      const { data } = await api.get<MeResponse>('/auth/me')
      user.value = data.data
      return data.data
    } catch {
      logout()
      return null
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    clearToken()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    fetchCurrentUser,
    logout,
  }
})
