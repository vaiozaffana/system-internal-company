<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalItems: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))

const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1,
)
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems))

const pages = computed(() => {
  const cur = props.currentPage
  const total = totalPages.value
  const arr: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) arr.push(i)
    return arr
  }

  arr.push(1)
  if (cur > 3) arr.push('...')
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) arr.push(i)
  if (cur < total - 2) arr.push('...')
  arr.push(total)
  return arr
})

const go = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  emit('update:currentPage', p)
}
</script>

<template>
  <div class="flex items-center justify-between border-t border-[#c2c6d6] px-6 py-3 text-sm">
    <div class="text-xs text-[#424754]">
      Menampilkan
      <span class="font-semibold text-[#191b23]">{{ startItem }}–{{ endItem }}</span>
      dari
      <span class="font-semibold text-[#191b23]">{{ totalItems }}</span>
      data
    </div>

    <div class="flex items-center gap-1">
      <button
        type="button"
        :disabled="currentPage <= 1"
        class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] border border-[#c2c6d6] bg-white text-[#424754] transition hover:bg-[#f2f3fd] disabled:cursor-not-allowed disabled:opacity-40"
        @click="go(currentPage - 1)"
      >
        <ChevronLeft :size="14" />
      </button>

      <template v-for="(p, i) in pages" :key="i">
        <span
          v-if="p === '...'"
          class="flex h-8 w-8 items-center justify-center text-xs text-[#727785]"
        >
          ...
        </span>
        <button
          v-else
          type="button"
          class="flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[6px] border px-2 text-xs font-semibold transition"
          :class="
            p === currentPage
              ? 'border-[#0058be] bg-[#0058be] text-white'
              : 'border-[#c2c6d6] bg-white text-[#424754] hover:bg-[#f2f3fd]'
          "
          @click="go(p as number)"
        >
          {{ p }}
        </button>
      </template>

      <button
        type="button"
        :disabled="currentPage >= totalPages"
        class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] border border-[#c2c6d6] bg-white text-[#424754] transition hover:bg-[#f2f3fd] disabled:cursor-not-allowed disabled:opacity-40"
        @click="go(currentPage + 1)"
      >
        <ChevronRight :size="14" />
      </button>
    </div>
  </div>
</template>
