<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTokenStore } from '@/stores/token'
import { exportAdminTokenUsage } from '@/api/token'
import { ElMessage } from 'element-plus'
import TokenChart from '@/components/TokenChart.vue'
import type { EChartsOption } from 'echarts'

const tokenStore = useTokenStore()

const query = reactive({
  businessName: '',
  apikeyId: undefined as number | undefined,
  groupBy: 0,
  page: 1,
  pageSize: 10,
})

const dateRange = ref<[string, string] | null>(null)

function getDefaultRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const p = (n: number) => String(n).padStart(2, '0')
  return [
    `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(1)} 00:00:00`,
    `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} 23:59:59`,
  ] as [string, string]
}

onMounted(async () => {
  dateRange.value = getDefaultRange()
  await loadData()
})

async function loadData() {
  await tokenStore.fetchAdminUsage({
    apikeyId: query.apikeyId,
    groupBy: query.groupBy,
    startTime: dateRange.value![0],
    endTime: dateRange.value![1],
  })
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.businessName = ''
  query.apikeyId = undefined
  query.page = 1
  dateRange.value = getDefaultRange()
  loadData()
}

async function handleExport() {
  try {
    const res = await exportAdminTokenUsage({
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

const enterpriseList = computed(() => {
  const set = new Set<string>()
  allRecords.value.forEach(r => { if (r.businessName) set.add(r.businessName) })
  return Array.from(set)
})

const filteredByEnterprise = computed(() => {
  if (!query.businessName) return allRecords.value
  return allRecords.value.filter(r => r.businessName === query.businessName)
})

const apikeyOptions = computed(() => {
  const source = query.businessName ? filteredByEnterprise.value : allRecords.value
  const seen = new Set<number>()
  return source.filter(r => {
    if (seen.has(r.apikeyId)) return false
    seen.add(r.apikeyId)
    return true
  })
})

const displayRecords = computed(() => {
  let data = filteredByEnterprise.value
  if (query.apikeyId) data = data.filter(r => r.apikeyId === query.apikeyId)
  query.page = Math.min(query.page, Math.ceil(data.length / query.pageSize) || 1)
  const start = (query.page - 1) * query.pageSize
  return data.slice(start, start + query.pageSize)
})

const displayTotal = computed(() => {
  let data = filteredByEnterprise.value
  if (query.apikeyId) data = data.filter(r => r.apikeyId === query.apikeyId)
  return data.length
})

const allDates = computed(() => {
  const dates = new Set(displayRecords.value.map(r => r.recordDate).filter(Boolean))
  return Array.from(dates).sort()
})

const lineOption = computed<EChartsOption>(() => {
  const records = displayRecords.value
  const dates = allDates.value
  const apikeyMap = new Map<string, { name: string; data: number[] }>()
  records.forEach(r => {
    const key = r.businessName || r.apikey || `Key #${r.apikeyId}`
    if (!apikeyMap.has(key)) apikeyMap.set(key, { name: key, data: new Array(dates.length).fill(0) })
    const idx = dates.indexOf(r.recordDate || '')
    if (idx >= 0) apikeyMap.get(key)!.data[idx] += (r.tokens || 0)
  })
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
    series: Array.from(apikeyMap.values()).map(info => ({ name: info.name, type: 'line', data: info.data, smooth: true })),
  }
})
</script>

<template>
  <div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="企业">
          <el-select
            v-model="query.businessName" placeholder="全部企业" clearable style="width: 200px"
            @change="query.apikeyId = undefined; query.page = 1"
          >
            <el-option v-for="name in enterpriseList" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key">
          <el-select
            v-model="query.apikeyId" placeholder="全部" clearable style="width: 280px"
            @change="query.page = 1"
          >
            <el-option v-for="r in apikeyOptions" :key="r.apikeyId" :label="r.apikey || `Key #${r.apikeyId}`" :value="r.apikeyId" />
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
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>Token 用量趋势（按日期/企业）</template>
          <TokenChart :option="lineOption" height="360px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <el-table :data="displayRecords" v-loading="tokenStore.loading" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="企业名称" width="180">
          <template #default="{ row }">{{ row.businessName || '-' }}</template>
        </el-table-column>
        <el-table-column label="API Key" min-width="200" show-overflow-tooltip>
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
          :total="displayTotal" :pageSizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.filter-card { margin-bottom: 16px; border-radius: 12px; border: 1px solid rgba(198,139,94,0.08); box-shadow: 0 2px 12px rgba(198,139,94,0.04); }
.filter-card :deep(.el-card__body) { padding: 16px 20px; }
.chart-row { margin-bottom: 20px; }
.chart-row :deep(.el-card) { border-radius: 12px; border: 1px solid rgba(198,139,94,0.06); box-shadow: 0 2px 12px rgba(198,139,94,0.04); }
.chart-row :deep(.el-card__header) { color: #4a3b34; font-weight: 600; border-bottom: 1px solid rgba(198,139,94,0.08); }
.table-card { margin-bottom: 16px; border-radius: 12px; border: 1px solid rgba(198,139,94,0.06); box-shadow: 0 2px 12px rgba(198,139,94,0.04); }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
