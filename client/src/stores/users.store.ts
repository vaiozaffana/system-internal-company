import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  usersService,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserRecord,
} from '@/services/users.service'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserRecord[]>([])
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
      users.value = await usersService.getAll()
    } catch (err) {
      error.value = extractError(err)
    } finally {
      loading.value = false
    }
  }

  const create = async (payload: CreateUserPayload) => {
    saving.value = true
    error.value = null
    successMessage.value = null
    try {
      await usersService.create(payload)
      successMessage.value = 'User berhasil ditambahkan'
      await load()
      return true
    } catch (err) {
      error.value = extractError(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const update = async (id: number, payload: UpdateUserPayload) => {
    saving.value = true
    error.value = null
    successMessage.value = null
    try {
      await usersService.update(id, payload)
      successMessage.value = 'User berhasil diperbarui'
      await load()
      return true
    } catch (err) {
      error.value = extractError(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const remove = async (id: number) => {
    saving.value = true
    error.value = null
    successMessage.value = null
    try {
      await usersService.remove(id)
      successMessage.value = 'User berhasil dihapus'
      await load()
      return true
    } catch (err) {
      error.value = extractError(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const resetPassword = async (id: number, newPassword?: string) => {
    saving.value = true
    error.value = null
    successMessage.value = null
    try {
      const result = await usersService.resetPassword(id, newPassword)
      successMessage.value = `Password berhasil direset ke "${result.newPassword}"`
      return { success: true, newPassword: result.newPassword }
    } catch (err) {
      error.value = extractError(err)
      return { success: false, newPassword: '' }
    } finally {
      saving.value = false
    }
  }

  const dismissMessages = () => {
    error.value = null
    successMessage.value = null
  }

  return { users, loading, saving, error, successMessage, load, create, update, remove, resetPassword, dismissMessages }
})
