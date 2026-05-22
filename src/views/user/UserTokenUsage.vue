<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTokenStore } from '@/stores/token'
import { useApiKeyStore } from '@/stores/apikey'
import { exportUserTokenUsage } from '@/api/token'
import { ElMessage } from 'element-plus'
import TokenChart from '@/components/TokenChart.vue'
import type { EChartsOption } from 'echarts'

const tokenStore = useTokenStore()
const apiKeyStore = useApiKeyStore()

const query = reactive({
  apikeyId: undefined as number | undefined,
  groupBy: 0,
  page: 1,
  pageSize: 10,
})

const dateRange = ref<[string, string] | null>(null)

function getDefaultRange() {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return [
    `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(1)} 00:00:00`,
    `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} 23:59:59`,
  ] as [string, string]
}

onMounted(async () => {
  dateRange.value = getDefaultRange()
  await loadData()
  await loadApiKeys()
})

async function loadData() {
  await tokenStore.fetchUserUsage({
    apikeyId: query.apikeyId,
    groupBy: query.groupBy,
    startTime: dateRange.value![0],
    endTime: dateRange.value![1],
  })
}

async function loadApiKeys() {
  await apiKeyStore.fetchUserPage({ page: 1, pageSize: 100 })
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.apikeyId = undefined
  query.page = 1
  dateRange.value = getDefaultRange()
  loadData()
}

async function handleExport() {
  try {
    const res = await exportUserTokenUsage({
      apikeyId: query.apikeyId,
      groupBy: query.groupBy,
      startTime: dateRange.value![0],
      endTime: dateRange.value![1],
    })
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Token用量导出.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const allRecords = computed(() => tokenStore.records ?? [])

const pagedRecords = computed(() => {
  const start = (query.page - 1) * query.pageSize
  return allRecords.value.slice(start, start + query.pageSize)
})

// 图表：按日期/API Key 展示
const allDates = computed(() => {
  const dates = new Set(allRecords.value.map(r => r.recordDate).filter(Boolean))
  return Array.from(dates).sort()
})

const reshapedData = computed(() => {
  const records = allRecords.value
  const dates = allDates.value
  const apikeyMap = new Map<string, { apikey: string; data: number[] }>()
  records.forEach(r => {
    const key = r.apikey || `Key #${r.apikeyId}`
    if (!apikeyMap.has(key)) apikeyMap.set(key, { apikey: r.apikey || key, data: new Array(dates.length).fill(0) })
    const idx = dates.indexOf(r.recordDate || '')
    if (idx >= 0) apikeyMap.get(key)!.data[idx] = (r.tokens || 0)
  })
  return { dates, apikeyMap }
})

const lineOption = computed<EChartsOption>(() => {
  const { dates, apikeyMap } = reshapedData.value
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const items = Array.isArray(params) ? params : [params]
        let html = `日期: ${items[0]?.name}<br/>`
        items.forEach((it: any) => { if (it.value > 0) html += `${it.seriesName}: ${it.value?.toLocaleString()}<br/>` })
        return html
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: 'Tokens' },
    series: Array.from(apikeyMap.values()).map(info => ({ name: info.apikey, type: 'line', data: info.data, smooth: true })),
  }
})

const barOption = computed<EChartsOption>(() => {
  const { dates, apikeyMap } = reshapedData.value
  const series = Array.from(apikeyMap.entries()).map(([name, info]) => ({ name, type: 'bar', data: info.data, stack: 'total' }))
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const items = Array.isArray(params) ? params : [params]
        let html = `日期: ${items[0]?.name}<br/>`
        items.forEach((it: any) => { html += `${it.seriesName}: ${it.value?.toLocaleString()}<br/>` })
        return html
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: 'Tokens' },
    series,
  }
})
</script>

<template>
  <div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="API Key">
          <el-select v-model="query.apikeyId" placeholder="全部 API Key" clearable style="width: 280px">
            <el-option v-for="k in apiKeyStore.list" :key="k.id" :label="k.apikey" :value="k.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange" type="datetimerange" range-separator="至"
            start-placeholder="开始时间" end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出 Excel</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>Token 消耗趋势（按日期/API Key）</template>
          <TokenChart :option="lineOption" height="340px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>用量对比（按日期/API Key）</template>
          <TokenChart :option="barOption" height="340px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <el-table :data="pagedRecords" v-loading="tokenStore.loading" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="API Key" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.apikey || '-' }}</template>
        </el-table-column>
        <el-table-column label="模型名称" width="140">
          <template #default="{ row }">{{ row.modelName || '-' }}</template>
        </el-table-column>
        <el-table-column label="Token 用量" width="140">
          <template #default="{ row }">{{ row.tokens?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="请求次数" width="120">
          <template #default="{ row }">{{ row.request?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="日期" width="120">
          <template #default="{ row }">{{ row.recordDate || '-' }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:currentPage="query.page" v-model:pageSize="query.pageSize"
          :total="allRecords.length" :pageSizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
h3 { color: #3d3028; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
.filter-card { margin-bottom: 16px; border-radius: 12px; border: 1px solid rgba(198,139,94,0.08); box-shadow: 0 2px 12px rgba(198,139,94,0.04); }
.filter-card :deep(.el-card__body) { padding: 16px 20px; }
.chart-row { margin-bottom: 20px; }
.chart-row :deep(.el-card) { border-radius: 12px; border: 1px solid rgba(198,139,94,0.06); box-shadow: 0 2px 12px rgba(198,139,94,0.04); }
.chart-row :deep(.el-card__header) { color: #4a3b34; font-weight: 600; border-bottom: 1px solid rgba(198,139,94,0.08); }
.table-card { margin-bottom: 16px; border-radius: 12px; border: 1px solid rgba(198,139,94,0.06); box-shadow: 0 2px 12px rgba(198,139,94,0.04); }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
