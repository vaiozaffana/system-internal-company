<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, LayoutGrid } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser()
  }
})

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#F0F4FF]">
    <header class="border-b border-[#c2c6d6] bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0058be]">
            <LayoutGrid :size="20" color="#ffffff" :stroke-width="2" />
          </div>
          <div>
            <div class="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#191b23]">
              EMS Core Portal
            </div>
            <div class="text-xs text-[#727785]">System Internal</div>
          </div>
        </div>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754] transition hover:border-[#0058be] hover:text-[#0058be]"
          @click="handleLogout"
        >
          <LogOut :size="16" :stroke-width="2" />
          Logout
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-10">
      <div class="rounded-[12px] border border-[#c2c6d6] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div class="text-sm text-[#727785]">Welcome back,</div>
        <h1 class="mt-1 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.6px] text-[#191b23]">
          {{ auth.user?.fullName ?? 'Loading...' }}
        </h1>
        <div v-if="auth.user" class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#424754]">
          <div>
            <span class="text-[#727785]">Employee Code:</span>
            <span class="ml-1 font-medium">{{ auth.user.employeeCode }}</span>
          </div>
          <div>
            <span class="text-[#727785]">Email:</span>
            <span class="ml-1 font-medium">{{ auth.user.email }}</span>
          </div>
          <div v-if="auth.user.department">
            <span class="text-[#727785]">Department:</span>
            <span class="ml-1 font-medium">{{ auth.user.department }}</span>
          </div>
          <div v-if="auth.user.position">
            <span class="text-[#727785]">Position:</span>
            <span class="ml-1 font-medium">{{ auth.user.position }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
