<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface DailyStat {
  label: string
  present: number
  late: number
}

const props = defineProps<{
  data: DailyStat[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: 'Hadir',
      data: props.data.map((d) => d.present),
      backgroundColor: '#006c49',
      borderRadius: 6,
      maxBarThickness: 32,
    },
    {
      label: 'Terlambat',
      data: props.data.map((d) => d.late),
      backgroundColor: '#924700',
      borderRadius: 6,
      maxBarThickness: 32,
    },
  ],
}))

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: 'easeOutQuart',
  },
  animations: {
    y: {
      from: (ctx) => {
        if (ctx.type === 'data' && ctx.mode === 'default') {
          return ctx.chart.scales.y.getPixelForValue(0)
        }
        return undefined
      },
    },
    x: { duration: 0 },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { stepSize: 1, font: { size: 11 } },
      grid: { color: '#ecedf7' },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, padding: 12, font: { size: 11 } },
    },
  },
}
</script>

<template>
  <div class="relative" style="height: 280px">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
