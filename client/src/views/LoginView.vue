<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight, LayoutGrid } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    auth.error = 'Email and password are required'
    return
  }
  const success = await auth.login(email.value, password.value)
  if (success) {
    router.push(auth.isAdmin ? '/admin' : '/')
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F0F4FF]">
    <div
      class="pointer-events-none absolute -top-[100px] -left-[100px] h-[400px] w-[400px] rounded-full blur-[80px]"
      style="background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);"
    ></div>
    <div
      class="pointer-events-none absolute -right-[100px] -bottom-[150px] h-[500px] w-[500px] rounded-full blur-[80px]"
      style="background: radial-gradient(circle, rgba(0,88,190,0.08) 0%, transparent 70%);"
    ></div>

    <div class="relative z-10 flex w-full max-w-[560px] flex-col items-center p-6">
      <div class="mb-6 flex w-full max-w-[380px] flex-col items-center gap-1.5">
        <div
          class="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#0058be] shadow-[0_8px_24px_rgba(0,88,190,0.3)]"
        >
          <LayoutGrid :size="22" color="#ffffff" :stroke-width="2" />
        </div>
        <div class="text-xl font-bold text-[#191b23]">System Internal</div>
        <div class="text-[13px] text-[#727785]">EMS Core Portal</div>
      </div>

      <div
        class="flex w-full flex-col gap-4 rounded-[18px] border border-[#c2c6d6] bg-white p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <div
            v-if="auth.error"
            class="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {{ auth.error }}
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#424754]">Email Address</label>
            <div class="relative flex items-center">
              <Mail
                :size="16"
                :stroke-width="2"
                class="pointer-events-none absolute left-3 text-[#727785]"
              />
              <input
                v-model="email"
                type="email"
                placeholder="name@company.com"
                autocomplete="email"
                class="w-full rounded-[10px] border border-[#c2c6d6] bg-[#f9f9ff] py-2.5 pr-3 pl-[38px] text-[13.5px] text-[#191b23] outline-none transition placeholder:text-gray-500 focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[13px] font-medium text-[#424754]">Password</label>
              <a href="#" class="text-[12.5px] font-semibold text-[#0058be]">Forgot Password?</a>
            </div>
            <div class="relative flex items-center">
              <Lock
                :size="16"
                :stroke-width="2"
                class="pointer-events-none absolute left-3 text-[#727785]"
              />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full rounded-[10px] border border-[#c2c6d6] bg-[#f9f9ff] py-2.5 pr-10 pl-[38px] text-[13.5px] text-[#191b23] outline-none transition placeholder:text-gray-500 focus:border-[#0058be] focus:shadow-[0_0_0_3px_rgba(0,88,190,0.12)]"
              />
              <button
                type="button"
                class="absolute right-3 flex cursor-pointer items-center border-0 bg-transparent p-0 text-[#727785]"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="16" :stroke-width="2" />
                <Eye v-else :size="16" :stroke-width="2" />
              </button>
            </div>
          </div>

          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="remember" type="checkbox" class="peer hidden" />
            <span
              class="relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-[1.5px] border-[#c2c6d6] bg-white transition-all peer-checked:border-[#0058be] peer-checked:bg-[#0058be] peer-checked:after:absolute peer-checked:after:-translate-y-px peer-checked:after:rotate-45 peer-checked:after:border-r-2 peer-checked:after:border-b-2 peer-checked:after:border-white peer-checked:after:content-[''] peer-checked:after:[height:8px] peer-checked:after:[width:4px]"
            ></span>
            <span class="text-[13px] text-[#424754]">Remember this device</span>
          </label>

          <button
            type="submit"
            :disabled="auth.loading"
            class="flex items-center justify-center gap-2 rounded-[10px] bg-[#0058be] p-3 text-sm font-semibold text-white transition-all hover:enabled:-translate-y-px hover:enabled:bg-[#004999] hover:enabled:shadow-[0_4px_12px_rgba(0,88,190,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span v-if="!auth.loading">Login</span>
            <span v-else class="flex items-center gap-2">
              <span
                class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              ></span>
              Signing in...
            </span>
            <ArrowRight v-if="!auth.loading" :size="16" :stroke-width="2.5" />
          </button>
        </form>

        <div
          class="flex items-center gap-2.5 text-xs text-[#727785] before:h-px before:flex-1 before:bg-[#c2c6d6] before:content-[''] after:h-px after:flex-1 after:bg-[#c2c6d6] after:content-['']"
        >
          <span>Or sign in with</span>
        </div>

        <button
          type="button"
          class="flex items-center justify-center gap-2.5 rounded-[10px] border border-[#c2c6d6] bg-[#f9f9ff] p-[11px] text-[13.5px] font-medium text-[#191b23] transition hover:border-[#a8adbd] hover:bg-[#f0f0ff]"
        >
          <LayoutGrid :size="18" color="#0058be" :stroke-width="2" />
          Continue with Company SSO
        </button>
      </div>

      <div class="mt-5 flex w-full max-w-[380px] items-center justify-center gap-2 text-xs text-[#727785]">
        <a href="#" class="text-[#727785] no-underline hover:text-[#424754]">Security Policy</a>
        <span class="text-[#c2c6d6]">•</span>
        <a href="#" class="text-[#727785] no-underline hover:text-[#424754]">System Status</a>
        <span class="text-[#c2c6d6]">•</span>
        <a href="#" class="text-[#727785] no-underline hover:text-[#424754]">Help Desk</a>
      </div>
      <div class="mt-1.5 text-[11.5px] text-[#c2c6d6]">2024 EMS Core</div>
    </div>
  </div>
</template>
