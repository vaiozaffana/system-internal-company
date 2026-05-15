<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutGrid,
  CalendarCheck,
  Wallet,
  Calendar,
  Settings,
  Users,
  FileEdit,
  FileText,
  Shield,
  HelpCircle,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

interface NavItem {
  name: string
  path: string
  icon: typeof LayoutGrid
}

interface SidebarCtx {
  sidebarOpen: { value: boolean }
  closeSidebar: () => void
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sidebar = inject<SidebarCtx>('sidebar')

const userNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutGrid },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Izin / Cuti', path: '/leave', icon: FileEdit },
  { name: 'Salary', path: '/salary', icon: Wallet },
  { name: 'Schedule', path: '/schedule', icon: Calendar },
]

const adminNavItems: NavItem[] = [
  { name: 'Dashboard Admin', path: '/admin', icon: LayoutGrid },
  { name: 'Monitoring Absensi', path: '/admin/attendance', icon: CalendarCheck },
  { name: 'Rekap Absensi', path: '/admin/report', icon: FileText },
  { name: 'Kelola Izin/Cuti', path: '/admin/leave', icon: FileEdit },
  { name: 'Jadwal Kerja', path: '/admin/schedule', icon: Calendar },
  { name: 'Payroll', path: '/admin/payroll', icon: Wallet },
  { name: 'Audit Log', path: '/admin/audit', icon: Shield },
  { name: 'Attendance Settings', path: '/admin/settings', icon: Settings },
  { name: 'Users', path: '/admin/users', icon: Users },
]

const navItems = computed<NavItem[]>(() => (auth.isAdmin ? adminNavItems : userNavItems))

const brand = computed(() =>
  auth.isAdmin
    ? { title: 'Admin Panel', subtitle: 'Control Panel', accent: 'text-[#0058be]' }
    : { title: 'Internal Ops', subtitle: 'Employee Portal', accent: 'text-[#0058be]' },
)

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const handleSignOut = async () => {
  await auth.logout()
  router.push('/login')
}

const handleNavClick = () => {
  sidebar?.closeSidebar()
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex h-screen w-[256px] flex-col gap-1 border-r px-4 py-4 transition-transform duration-300 md:static md:translate-x-0"
    :class="sidebar?.sidebarOpen.value ? 'translate-x-0' : '-translate-x-full'"
    style="background-color: var(--sidebar-bg); border-color: var(--border)"
  >
    <button
      type="button"
      class="absolute right-3 top-3 cursor-pointer rounded-full border-0 bg-transparent p-1.5 text-[#424754] hover:bg-[#e1e2ec] md:hidden"
      aria-label="Close menu"
      @click="sidebar?.closeSidebar()"
    >
      <X :size="18" :stroke-width="2" />
    </button>
    <div class="pb-4">
      <div class="flex items-center gap-4 px-4 py-6">
        <div
          class="flex h-10 w-[39.31px] items-center justify-center rounded-[8px] bg-[#0058be]"
        >
          <component
            :is="auth.isAdmin ? ShieldCheck : LayoutGrid"
            :size="20"
            color="#ffffff"
            :stroke-width="2"
          />
        </div>
        <div class="flex flex-col">
          <div
            class="font-['Plus_Jakarta_Sans'] text-2xl leading-6 font-semibold tracking-[-0.24px]"
            :class="brand.accent"
          >
            <p>{{ brand.title.split(' ')[0] }}</p>
            <p v-if="brand.title.split(' ')[1]">{{ brand.title.split(' ')[1] }}</p>
          </div>
          <div class="text-xs leading-4 font-medium tracking-[0.24px] text-[#424754]">
            {{ brand.subtitle }}
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
        @click="handleNavClick"
      >
        <component :is="item.icon" :size="18" :stroke-width="2" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div class="flex flex-col gap-1 border-t border-[#c2c6d6] pt-4">
      <RouterLink
        v-if="!auth.isAdmin"
        to="/support"
        class="flex items-center gap-4 rounded-[8px] px-4 py-2 text-xs leading-4 font-medium tracking-[0.24px] transition-colors"
        :class="
          isActive('/support')
            ? 'bg-[#e1e2ec] text-[#0058be]'
            : 'text-[#424754] hover:bg-[#e1e2ec]/60'
        "
      >
        <HelpCircle :size="20" :stroke-width="2" />
        <span>Support</span>
      </RouterLink>
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
