<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

interface Props {
  present: number
  late: number
  earlyLeave: number
  lateAndEarlyLeave: number
}

const props = defineProps<Props>()

const total = computed(
  () => props.present + props.late + props.earlyLeave + props.lateAndEarlyLeave,
)

const chartData = computed(() => ({
  labels: ['Hadir', 'Terlambat', 'Pulang Awal', 'Telat & Pulang Awal'],
  datasets: [
    {
      data: [props.present, props.late, props.earlyLeave, props.lateAndEarlyLeave],
      backgroundColor: ['#006c49', '#924700', '#ba1a1a', '#7c2d12'],
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
}))

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        padding: 12,
        font: { size: 11 },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed
          const sum = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
          const pct = sum > 0 ? Math.round((value / sum) * 100) : 0
          return `${ctx.label}: ${value} (${pct}%)`
        },
      },
    },
  },
}
</script>

<template>
  <div class="relative" style="height: 240px">
    <Doughnut v-if="total > 0" :data="chartData" :options="chartOptions" />
    <div
      v-else
      class="flex h-full flex-col items-center justify-center text-sm text-[#727785]"
    >
      <span>Belum ada data absensi bulan ini</span>
    </div>
  </div>
</template>
