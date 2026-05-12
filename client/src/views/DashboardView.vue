<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser()
  }
})
</script>

<template>
  <AppLayout title="Dashboard">
    <div
      class="rounded-[12px] border border-[#c2c6d6] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
    >
      <div class="text-sm text-[#727785]">Welcome back,</div>
      <h1
        class="mt-1 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.6px] text-[#191b23]"
      >
        {{ auth.user?.fullName ?? 'Loading...' }}
      </h1>
      <div
        v-if="auth.user"
        class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#424754]"
      >
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
  </AppLayout>
</template>
