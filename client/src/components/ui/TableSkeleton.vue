<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    rows?: number
    columns?: number
  }>(),
  { rows: 6, columns: 6 },
)
</script>

<template>
  <tbody>
    <tr v-for="r in props.rows" :key="r" class="border-b border-[#c2c6d6]">
      <td v-for="c in props.columns" :key="c" class="px-6 py-[14px]">
        <div class="h-3 w-full max-w-[160px] animate-pulse rounded bg-[#ecedf7]"></div>
      </td>
    </tr>
  </tbody>
</template>
