import axios, { type AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const TOKEN_STORAGE_KEY = 'auth_token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY)
export const setToken = (token: string): void => localStorage.setItem(TOKEN_STORAGE_KEY, token)
export const clearToken = (): void => localStorage.removeItem(TOKEN_STORAGE_KEY)

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
