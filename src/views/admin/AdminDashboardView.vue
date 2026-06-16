<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getAdminDashboardStats } from '@/api/dashboard'
import type { DashboardStats } from '@/types/dashboard'

const authStore = useAuthStore()
import TokenChart from '@/components/TokenChart.vue'
import type { EChartsOption } from 'echarts'

const stats = ref<DashboardStats | null>(null)
const loading = ref(false)

function getMonthRange() {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    startTime: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(1)} 00:00:00`,
    endTime: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} 23:59:59`,
  }
}

async function loadStats() {
  loading.value = true
  try {
    const { startTime, endTime } = getMonthRange()
    const res = await getAdminDashboardStats({ startTime, endTime })
    stats.value = res.data.data ?? null
  } finally {
    loading.value = false
  }
}

const trendOption = computed<EChartsOption>(() => {
  if (!stats.value) return {}
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: stats.value.trendData.map(t => t.date.substring(5)) },
    yAxis: { type: 'value', name: 'Tokens' },
    series: [{
      data: stats.value.trendData.map(t => t.tokens),
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.15 },
    }],
  }
})

const pieOption = computed<EChartsOption>(() => {
  if (!stats.value) return {}
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: stats.value.distribution,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  }
})

const barOption = computed<EChartsOption>(() => {
  if (!stats.value) return {}
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const item = Array.isArray(params) ? params[0] : params
        return `${item.name}<br/>Token: ${item.value?.toLocaleString()}`
      },
    },
    xAxis: { type: 'category', data: stats.value.distribution.map(d => d.name) },
    yAxis: { type: 'value', name: 'Tokens' },
    series: [{
      data: stats.value.distribution.map(d => d.value),
      type: 'bar',
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  }
})

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div v-loading="loading">
    <h3>欢迎回来，查看{{ authStore.businessName }} Token 使用情况。</h3>
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="Token 总消耗" :value="stats?.totalTokens ?? 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="输入 Token" :value="stats?.totalInputTokens ?? 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="输出 Token" :value="stats?.totalOutputTokens ?? 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总请求次数" :value="stats?.totalRequests ?? 0" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="活跃用户" :value="stats?.activeUsers ?? 0" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>近一月 Token 消耗趋势</template>
          <TokenChart :option="trendOption" height="320px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>各 企业Token 用量分布</template>
          <TokenChart :option="pieOption" height="320px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>企业Token 用量对比</template>
          <TokenChart :option="barOption" height="320px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-row {
  margin-bottom: 20px;
}

.stat-row :deep(.el-card) {
  border-radius: 12px;
  border: 1px solid rgba(198, 139, 94, 0.08);
  border-top: 3px solid #c68b5e;
  box-shadow: 0 2px 12px rgba(198, 139, 94, 0.06);
  transition: box-shadow 0.3s ease;
}

.stat-row :deep(.el-card:hover) {
  box-shadow: 0 4px 20px rgba(198, 139, 94, 0.12);
}

.stat-row :deep(.el-statistic__head) {
  color: #8b7a6b;
  font-size: 13px;
  font-weight: 500;
}

.stat-row :deep(.el-statistic__number) {
  color: #3d3028;
  font-size: 28px;
  font-weight: 700;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-row :deep(.el-card) {
  border-radius: 12px;
  border: 1px solid rgba(198, 139, 94, 0.06);
  box-shadow: 0 2px 12px rgba(198, 139, 94, 0.04);
}

.chart-row :deep(.el-card__header) {
  color: #4a3b34;
  font-weight: 600;
  border-bottom: 1px solid rgba(198, 139, 94, 0.08);
}

h3 {
  color: #3d3028;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
}
</style>
