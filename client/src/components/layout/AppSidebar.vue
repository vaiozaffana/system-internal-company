<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutGrid,
  CalendarCheck,
  Wallet,
  Calendar,
  HelpCircle,
  LogOut,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutGrid },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Salary', path: '/salary', icon: Wallet },
  { name: 'Schedule', path: '/schedule', icon: Calendar },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const handleSignOut = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="flex h-screen w-[256px] flex-col gap-1 border-r border-[#c2c6d6] bg-[#f2f3fd] px-4 py-4"
  >
    <div class="pb-4">
      <div class="flex items-center gap-4 px-4 py-6">
        <div
          class="flex h-10 w-[39.31px] items-center justify-center rounded-[8px] bg-[#0058be]"
        >
          <LayoutGrid :size="20" color="#ffffff" :stroke-width="2" />
        </div>
        <div class="flex flex-col">
          <div
            class="font-['Plus_Jakarta_Sans'] text-2xl leading-6 font-semibold tracking-[-0.24px] text-[#0058be]"
          >
            <p>Internal</p>
            <p>Ops</p>
          </div>
          <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
            Employee Portal
          </div>
        </div>
      </div>
    </div>

    <nav class="flex flex-1 flex-col gap-1.5 pt-px">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-4 rounded-[8px] px-4 py-2 text-xs leading-4 font-medium tracking-[0.24px] transition-colors"
        :class="
          isActive(item.path)
            ? 'bg-[#e1e2ec] text-[#0058be]'
            : 'text-[#424754] hover:bg-[#e1e2ec]/60'
        "
      >
        <component :is="item.icon" :size="18" :stroke-width="2" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div class="flex flex-col gap-1 border-t border-[#c2c6d6] pt-4">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-4 rounded-[8px] border-0 bg-transparent px-4 py-2 text-xs leading-4 font-medium tracking-[0.24px] text-[#424754] transition-colors hover:bg-[#e1e2ec]/60"
      >
        <HelpCircle :size="20" :stroke-width="2" />
        <span>Support</span>
      </button>
      <button
        type="button"
        class="flex cursor-pointer items-center gap-4 rounded-[8px] border-0 bg-transparent px-4 py-2 text-xs leading-4 font-medium tracking-[0.24px] text-[#424754] transition-colors hover:bg-red-50 hover:text-red-600"
        @click="handleSignOut"
      >
        <LogOut :size="18" :stroke-width="2" />
        <span>Sign Out</span>
      </button>
    </div>
  </aside>
</template>
