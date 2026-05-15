<script setup lang="ts">
import { provide, ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

defineProps<{ title?: string }>()

const sidebarOpen = ref(false)

const openSidebar = () => {
  sidebarOpen.value = true
}
const closeSidebar = () => {
  sidebarOpen.value = false
}

provide('sidebar', { sidebarOpen, openSidebar, closeSidebar })
</script>

<template>
  <div class="flex h-screen overflow-hidden" style="background-color: var(--bg-base)">
    <AppSidebar />

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
      @click="closeSidebar"
    ></div>

    <div class="flex flex-1 flex-col overflow-hidden">
      <AppTopbar :title="title" />

      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
