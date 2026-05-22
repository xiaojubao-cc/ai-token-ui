<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  option: echarts.EChartsOption
  height?: string
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const WARM_COLORS = ['#c68b5e', '#b8860b', '#d4a574', '#a67c34', '#c9a458', '#8b7355', '#d9bfa0', '#9b7b5c']

const chartHeight = computed(() => props.height || '320px')

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({ color: WARM_COLORS, ...props.option })
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(chartRef.value)
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})

watch(() => props.option, (val) => {
  chart?.setOption({ color: WARM_COLORS, ...val })
}, { deep: true })
</script>

<template>
  <div ref="chartRef" :style="{ width: '100%', height: chartHeight }" />
</template>
