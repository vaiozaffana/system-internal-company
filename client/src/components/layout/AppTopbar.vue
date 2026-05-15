<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Search, Bell, HelpCircle, Settings, Sun, Moon, Menu } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api.service'

defineProps<{ title?: string }>()

const router = useRouter()
const auth = useAuthStore()

interface SidebarCtx {
  sidebarOpen: { value: boolean }
  openSidebar: () => void
  closeSidebar: () => void
}
const sidebar = inject<SidebarCtx>('sidebar')

const userInitial = computed(() => (auth.user?.fullName ?? 'U').charAt(0).toUpperCase())
const goToProfile = () => router.push('/profile')

// ── Notifications ──────────────────────────────────────────────
interface NotifItem {
  id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string
}
const notifications = ref<NotifItem[]>([])
const unreadCount = ref(0)
const showNotif = ref(false)

const loadNotifications = async () => {
  try {
    const { data } = await api.get<{ data: NotifItem[] }>('/notifications')
    notifications.value = data.data
    unreadCount.value = data.data.filter((n) => !n.isRead).length
  } catch { notifications.value = []; unreadCount.value = 0 }
}
const markAllRead = async () => {
  try {
    await api.put('/notifications/read-all')
    notifications.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
  } catch {}
}
const toggleNotif = () => {
  showNotif.value = !showNotif.value
  showSettings.value = false
  showSearch.value = false
  if (showNotif.value) loadNotifications()
}
const formatTimeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const h = Math.floor(mins / 60)
  return h < 24 ? `${h} jam lalu` : `${Math.floor(h / 24)} hari lalu`
}

// ── Search ─────────────────────────────────────────────────────
const searchQuery = ref('')
const showSearch = ref(false)

const allRoutes = computed(() => {
  const user = [
    { name: 'Dashboard', path: '/' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Izin / Cuti', path: '/leave' },
    { name: 'Salary', path: '/salary' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Support', path: '/support' },
    { name: 'Profile', path: '/profile' },
  ]
  const admin = [
    { name: 'Dashboard Admin', path: '/admin' },
    { name: 'Monitoring Absensi', path: '/admin/attendance' },
    { name: 'Rekap Absensi', path: '/admin/report' },
    { name: 'Kelola Izin/Cuti', path: '/admin/leave' },
    { name: 'Payroll', path: '/admin/payroll' },
    { name: 'Audit Log', path: '/admin/audit' },
    { name: 'Attendance Settings', path: '/admin/settings' },
    { name: 'Users', path: '/admin/users' },
  ]
  return auth.isAdmin ? admin : user
})

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allRoutes.value.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 6)
})

const navigateTo = (path: string) => {
  router.push(path)
  searchQuery.value = ''
  showSearch.value = false
}
const onSearchKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && searchResults.value.length > 0) navigateTo(searchResults.value[0].path)
  if (e.key === 'Escape') { showSearch.value = false; searchQuery.value = '' }
}

// ── Dark mode ──────────────────────────────────────────────────
const isDark = ref(false)
const showSettings = ref(false)

const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}
const toggleDark = () => { isDark.value = !isDark.value; applyTheme(isDark.value) }
const toggleSettings = () => {
  showSettings.value = !showSettings.value
  showNotif.value = false
  showSearch.value = false
}

// ── Close on outside click ─────────────────────────────────────
const onClickOutside = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('[data-tb]')) {
    showNotif.value = false
    showSettings.value = false
    showSearch.value = false
  }
}

onMounted(() => {
  loadNotifications()
  isDark.value = localStorage.getItem('theme') === 'dark'
  applyTheme(isDark.value)
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b px-4 sm:px-6" style="background-color: var(--bg-base); border-color: var(--border)">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="cursor-pointer rounded-[8px] border-0 bg-transparent p-1.5 text-[#424754] hover:bg-[#e1e2ec] md:hidden dark:text-[#9499b0] dark:hover:bg-[#252838]"
        aria-label="Open menu"
        @click="sidebar?.openSidebar()"
      >
        <Menu :size="22" :stroke-width="2" />
      </button>
      <h1 class="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl leading-7 sm:leading-8 font-bold tracking-[-0.24px] text-[#191b23] dark:text-white truncate">
        {{ title ?? 'EMS Core' }}
      </h1>
    </div>

    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Search -->
      <div class="relative hidden md:block" data-tb>
        <div class="flex items-center gap-2 rounded-full border border-[#c2c6d6] bg-[#f2f3fd] px-[9px] py-[5px] dark:border-[#2a2d3a] dark:bg-[#1e2130]">
          <Search :size="18" :stroke-width="2" class="text-[#6b7280]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-48 border-0 bg-transparent px-3 py-px text-sm text-[#191b23] outline-none placeholder:text-[#6b7280] dark:text-white"
            @focus="showSearch = true; showNotif = false; showSettings = false"
            @keydown="onSearchKeydown"
          />
        </div>
        <!-- Results dropdown -->
        <div v-if="showSearch && searchQuery.trim()" class="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-[10px] border border-[#c2c6d6] bg-white shadow-xl dark:border-[#2a2d3a] dark:bg-[#1e2130]">
          <template v-if="searchResults.length > 0">
            <button v-for="r in searchResults" :key="r.path" type="button"
              class="flex w-full cursor-pointer items-center gap-3 border-0 border-b border-[#c2c6d6] bg-transparent px-4 py-2.5 text-left text-sm text-[#191b23] last:border-b-0 hover:bg-[#f2f3fd] dark:border-[#2a2d3a] dark:text-white dark:hover:bg-[#252838]"
              @click="navigateTo(r.path)">
              <Search :size="13" class="shrink-0 text-[#9499b0]" />
              {{ r.name }}
            </button>
          </template>
          <div v-else class="px-4 py-3 text-sm text-[#9499b0]">
            Tidak ada hasil untuk "{{ searchQuery }}"
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Notifications -->
        <div class="relative" data-tb>
          <button type="button"
            class="relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec] dark:text-[#9499b0] dark:hover:bg-[#252838]"
            @click="toggleNotif">
            <Bell :size="20" :stroke-width="2" />
            <span v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold text-white">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>
          <div v-if="showNotif" class="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full z-50 mt-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl dark:border-[#2a2d3a] dark:bg-[#1e2130]">
            <div class="flex items-center justify-between border-b border-[#c2c6d6] px-4 py-3 dark:border-[#2a2d3a]">
              <span class="text-sm font-semibold text-[#191b23] dark:text-white">Notifikasi</span>
              <button v-if="unreadCount > 0" type="button"
                class="cursor-pointer border-0 bg-transparent text-[11px] font-medium text-[#0058be] hover:underline"
                @click="markAllRead">Tandai semua dibaca</button>
            </div>
            <div class="max-h-72 overflow-y-auto">
              <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-[#424754] dark:text-[#9499b0]">Belum ada notifikasi</div>
              <div v-for="notif in notifications.slice(0, 10)" :key="notif.id"
                class="border-b border-[#c2c6d6] px-4 py-3 last:border-b-0 dark:border-[#2a2d3a]"
                :class="notif.isRead ? 'bg-white dark:bg-[#1e2130]' : 'bg-[#f2f3fd] dark:bg-[#252838]'">
                <div class="text-[12px] font-semibold text-[#191b23] dark:text-white">{{ notif.title }}</div>
                <div class="mt-0.5 text-[11px] leading-[14px] text-[#424754] dark:text-[#9499b0]">{{ notif.message }}</div>
                <div class="mt-1 text-[10px] text-[#727785]">{{ formatTimeAgo(notif.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Support — same as AppSidebar -->
        <RouterLink to="/support"
          class="hidden sm:flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec] dark:text-[#9499b0] dark:hover:bg-[#252838]"
          aria-label="Support">
          <HelpCircle :size="20" :stroke-width="2" />
        </RouterLink>

        <!-- Settings -->
        <div class="relative" data-tb>
          <button type="button"
            class="flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec] dark:text-[#9499b0] dark:hover:bg-[#252838]"
            @click="toggleSettings">
            <Settings :size="20" :stroke-width="2" />
          </button>
          <div v-if="showSettings" class="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full z-50 mt-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-52 max-w-sm overflow-hidden rounded-[10px] border border-[#c2c6d6] bg-white shadow-xl dark:border-[#2a2d3a] dark:bg-[#1e2130]">
            <div class="border-b border-[#c2c6d6] px-4 py-2.5 dark:border-[#2a2d3a]">
              <span class="text-xs font-semibold uppercase tracking-widest text-[#9499b0]">Tampilan</span>
            </div>
            <button type="button"
              class="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-4 py-3 text-sm text-[#191b23] hover:bg-[#f2f3fd] dark:text-white dark:hover:bg-[#252838]"
              @click="toggleDark">
              <div class="flex items-center gap-2.5">
                <component :is="isDark ? Sun : Moon" :size="16" class="text-[#424754] dark:text-[#9499b0]" />
                <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
              </div>
              <!-- Toggle switch -->
              <div class="relative h-5 w-9 rounded-full transition-colors" :class="isDark ? 'bg-[#0058be]' : 'bg-[#c2c6d6]'">
                <div class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="isDark ? 'translate-x-4' : 'translate-x-0.5'"></div>
              </div>
            </button>
          </div>
        </div>

        <div class="mx-1 h-8 w-px bg-[#c2c6d6] dark:bg-[#2a2d3a]"></div>

        <div class="flex cursor-pointer items-center gap-2 rounded-[8px] p-1 transition hover:bg-[#f2f3fd] dark:hover:bg-[#252838]" @click="goToProfile">
          <div class="hidden md:flex flex-col items-end">
            <div class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#191b23] dark:text-white">
              {{ auth.user?.fullName ?? 'Guest User' }}
            </div>
            <div class="text-[11px] leading-[14px] text-[#424754] dark:text-[#9499b0]">
              {{ auth.user?.position ?? 'Employee' }}
            </div>
          </div>
          <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#e1e2ec] bg-[#0058be] text-xs font-bold text-white">
            {{ userInitial }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
