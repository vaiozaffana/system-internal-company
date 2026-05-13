<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

defineProps<{ title?: string }>()
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f9f9ff]">
    <AppSidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <AppTopbar :title="title" />

      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>