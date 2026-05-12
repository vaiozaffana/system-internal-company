<script setup lang="ts">
import { computed } from 'vue'
import { Search, Bell, HelpCircle, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

defineProps<{ title?: string }>()

const auth = useAuthStore()

const userInitial = computed(() => {
  const name = auth.user?.fullName ?? ''
  return name.charAt(0).toUpperCase() || 'U'
})
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
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[#424754] transition hover:bg-[#e1e2ec]"
          aria-label="Notifications"
        >
          <Bell :size="20" :stroke-width="2" />
        </button>
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

        <div class="flex items-center gap-2 rounded-[8px] p-1">
          <div class="flex flex-col items-end">
            <div
              class="text-xs leading-4 font-semibold tracking-[0.24px] text-[#191b23]"
            >
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
