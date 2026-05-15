<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { User, Save, Lock, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api.service'

const auth = useAuthStore()
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const form = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
})

const syncForm = () => {
  form.fullName = auth.user?.fullName ?? ''
  form.email = auth.user?.email ?? ''
  form.phoneNumber = auth.user?.phoneNumber ?? ''
}

onMounted(async () => {
  if (!auth.user) await auth.fetchCurrentUser()
  syncForm()
})

const handleSubmit = async () => {
  saving.value = true
  error.value = null
  success.value = null
  try {
    await api.put('/auth/profile', {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber || null,
    })
    await auth.fetchCurrentUser()
    success.value = 'Profil berhasil diperbarui'
  } catch (err: unknown) {
    error.value =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Gagal memperbarui profil'
  } finally {
    saving.value = false
  }
}

const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const savingPassword = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref<string | null>(null)

const handleChangePassword = async () => {
  passwordError.value = null
  passwordSuccess.value = null
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'Password baru minimal 6 karakter'
    return
  }
  savingPassword.value = true
  try {
    await api.put('/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    passwordSuccess.value = 'Password berhasil diubah'
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err: unknown) {
    passwordError.value =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Gagal mengubah password'
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <AppLayout title="Profil">
    <div class="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <div class="flex items-center gap-4">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-[#0058be] text-2xl font-bold text-white"
        >
          {{ (auth.user?.fullName ?? 'U').charAt(0).toUpperCase() }}
        </div>
        <div>
          <h2
            class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-bold tracking-[-0.5px] text-[#191b23]"
          >
            {{ auth.user?.fullName ?? 'Loading...' }}
          </h2>
          <p class="text-sm text-[#424754]">
            {{ auth.user?.position ?? '' }}
            <span v-if="auth.user?.department"> &bull; {{ auth.user.department }}</span>
          </p>
        </div>
      </div>

      <div
        v-if="error"
        class="flex items-start gap-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <AlertCircle :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </div>
      <div
        v-if="success"
        class="flex items-start gap-3 rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        <CheckCircle2 :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
        <span>{{ success }}</span>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white">
        <div class="flex items-center gap-3 border-b border-[#c2c6d6] px-6 pt-6 pb-5">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(0,88,190,0.1)] text-[#0058be]"
          >
            <User :size="20" :stroke-width="2" />
          </div>
          <div>
            <h3
              class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]"
            >
              Informasi Pribadi
            </h3>
            <p class="text-[11px] leading-[14px] text-[#424754]">
              Ubah nama dan nomor telepon Anda.
            </p>
          </div>
        </div>

        <form class="flex flex-col gap-5 p-6" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]">Kode Karyawan</label>
              <input
                :value="auth.user?.employeeCode ?? ''"
                disabled
                class="rounded-[8px] border border-[#c2c6d6] bg-[#ecedf7] px-3 py-2.5 text-sm text-[#424754] outline-none"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]" for="email">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]" for="fullName">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                v-model="form.fullName"
                required
                class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]" for="phoneNumber">
                No. Telepon
              </label>
              <input
                id="phoneNumber"
                v-model="form.phoneNumber"
                placeholder="081234567890"
                class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]">Department</label>
              <input
                :value="auth.user?.department ?? '—'"
                disabled
                class="rounded-[8px] border border-[#c2c6d6] bg-[#ecedf7] px-3 py-2.5 text-sm text-[#424754] outline-none"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]">Position</label>
              <input
                :value="auth.user?.position ?? '—'"
                disabled
                class="rounded-[8px] border border-[#c2c6d6] bg-[#ecedf7] px-3 py-2.5 text-sm text-[#424754] outline-none"
              />
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="saving"
              class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#0058be] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:enabled:-translate-y-px hover:enabled:bg-[#004999] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save :size="16" :stroke-width="2" />
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>

      <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-6">
        <h4 class="text-sm font-semibold text-[#191b23]">Informasi Akun</h4>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-[11px] text-[#424754]">Role</div>
            <div class="font-medium text-[#191b23] capitalize">{{ auth.user?.role ?? '—' }}</div>
          </div>
          <div>
            <div class="text-[11px] text-[#424754]">Status</div>
            <div class="font-medium" :class="auth.user?.isActive ? 'text-[#006c49]' : 'text-[#ba1a1a]'">
              {{ auth.user?.isActive ? 'Aktif' : 'Nonaktif' }}
            </div>
          </div>
        </div>
        <p class="mt-3 text-[11px] text-[#727785]">
          Untuk mengubah department, position, atau role, hubungi admin.
        </p>
      </div>

      <div class="overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white">
        <div class="flex items-center gap-3 border-b border-[#c2c6d6] px-6 pt-6 pb-5">
          <div class="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(186,26,26,0.08)] text-[#ba1a1a]">
            <Lock :size="20" :stroke-width="2" />
          </div>
          <div>
            <h3 class="font-['Plus_Jakarta_Sans'] text-lg leading-[26px] font-semibold text-[#191b23]">Ubah Password</h3>
            <p class="text-[11px] leading-[14px] text-[#424754]">Pastikan password baru minimal 6 karakter.</p>
          </div>
        </div>

        <div
          v-if="passwordError"
          class="mx-6 mt-4 flex items-start gap-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
          <span>{{ passwordError }}</span>
        </div>
        <div
          v-if="passwordSuccess"
          class="mx-6 mt-4 flex items-start gap-3 rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <CheckCircle2 :size="18" :stroke-width="2" class="mt-0.5 shrink-0" />
          <span>{{ passwordSuccess }}</span>
        </div>

        <form class="flex flex-col gap-4 p-6" @submit.prevent="handleChangePassword">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]" for="currentPassword">Password Saat Ini</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]" for="newPassword">Password Baru</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[13px] font-medium text-[#424754]" for="confirmPassword">Konfirmasi Password</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
                class="rounded-[8px] border border-[#c2c6d6] bg-[#f9f9ff] px-3 py-2.5 text-sm text-[#191b23] outline-none transition focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="savingPassword"
              class="flex cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#ba1a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:enabled:-translate-y-px hover:enabled:bg-[#8a1010] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock :size="16" :stroke-width="2" />
              {{ savingPassword ? 'Mengubah...' : 'Ubah Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
