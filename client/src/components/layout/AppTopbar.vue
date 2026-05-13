<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Bell, HelpCircle, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api.service'

defineProps<{ title?: string }>()

const router = useRouter()
const auth = useAuthStore()

const userInitial = computed(() => {
  const name = auth.user?.fullName ?? ''
  return name.charAt(0).toUpperCase() || 'U'
})

const goToProfile = () => router.push('/profile')

interface NotifItem {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

const notifications = ref<NotifItem[]>([])
const unreadCount = ref(0)
const showDropdown = ref(false)

const loadNotifications = async () => {
  try {
    const { data } = await api.get<{ data: NotifItem[] }>('/notifications')
    notifications.value = data.data
    unreadCount.value = data.data.filter((n) => !n.isRead).length
  } catch {
    notifications.value = []
    unreadCount.value = 0
  }
}

const markAllRead = async () => {
  try {
    await api.put('/notifications/read-all')
    notifications.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
  } catch {}
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) loadNotifications()
}

const formatTimeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

onMounted(() => loadNotifications())
</script>

<template>
  <header
    class="flex h-16 items-center justify-between border-b border-[#c2c6d6] bg-[#f9f9ff] px-6"
  >
    <h1
      class="font-['Plus_Jakarta_Sans'] text-2xl leading-8 font-bold tracking-[-0.24px] text-[#191b23]"
    >
      {{ title ?? 'EMS Core' }}
    </h1>

    <div class="flex items-center gap-4">
      <div
        class="flex items-center gap-2 rounded-full border border-[#c2c6d6] bg-[#f2f3fd] px-[9px] py-[5px]"
      >
        <Search :size="18" :stroke-width="2" class="text-[#6b7280]" />
        <input
          type="text"
          placeholder="Search..."
          class="w-48 border-0 bg-transparent px-3 py-px text-sm text-[#191b23] outline-none placeholder:text-[#6b7280]"
        />
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <button
            type="button"
            class="relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec]"
            aria-label="Notifications"
            @click="toggleDropdown"
          >
            <Bell :size="20" :stroke-width="2" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold text-white"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <div
            v-if="showDropdown"
            class="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-[12px] border border-[#c2c6d6] bg-white shadow-xl"
          >
            <div class="flex items-center justify-between border-b border-[#c2c6d6] px-4 py-3">
              <span class="text-sm font-semibold text-[#191b23]">Notifikasi</span>
              <button
                v-if="unreadCount > 0"
                type="button"
                class="cursor-pointer border-0 bg-transparent text-[11px] font-medium text-[#0058be] hover:underline"
                @click="markAllRead"
              >
                Tandai semua dibaca
              </button>
            </div>
            <div class="max-h-72 overflow-y-auto">
              <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-[#424754]">
                Belum ada notifikasi
              </div>
              <div
                v-for="notif in notifications.slice(0, 10)"
                :key="notif.id"
                class="border-b border-[#c2c6d6] px-4 py-3 last:border-b-0"
                :class="notif.isRead ? 'bg-white' : 'bg-[#f2f3fd]'"
              >
                <div class="text-[12px] font-semibold text-[#191b23]">{{ notif.title }}</div>
                <div class="mt-0.5 text-[11px] leading-[14px] text-[#424754]">{{ notif.message }}</div>
                <div class="mt-1 text-[10px] text-[#727785]">{{ formatTimeAgo(notif.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec]"
          aria-label="Help"
        >
          <HelpCircle :size="20" :stroke-width="2" />
        </button>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec]"
          aria-label="Settings"
        >
          <Settings :size="20" :stroke-width="2" />
        </button>

        <div class="mx-1 h-8 w-px bg-[#c2c6d6]"></div>

        <div class="flex cursor-pointer items-center gap-2 rounded-[8px] p-1 transition hover:bg-[#f2f3fd]" @click="goToProfile">
          <div class="flex flex-col items-end">
            <div class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#191b23]">
              {{ auth.user?.fullName ?? 'Guest User' }}
            </div>
            <div class="text-[11px] leading-[14px] text-[#424754]">
              {{ auth.user?.position ?? 'Employee' }}
            </div>
          </div>
          <div
            class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#e1e2ec] bg-[#0058be] text-xs font-bold text-white"
          >
            {{ userInitial }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
