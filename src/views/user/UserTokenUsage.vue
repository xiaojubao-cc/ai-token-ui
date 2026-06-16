<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTokenStore } from '@/stores/token'
import { useApiKeyStore } from '@/stores/apikey'
import { exportUserTokenUsage, queryUserTokenUsage } from '@/api/token'
import { ElMessage } from 'element-plus'
import TokenChart from '@/components/TokenChart.vue'
import type { EChartsOption } from 'echarts'
import type { TokenUsageRecord } from '@/types/dashboard'

const tokenStore = useTokenStore()
const apiKeyStore = useApiKeyStore()

const query = reactive({
  apikeyId: undefined as number | undefined,
  groupBy: 0,
  page: 1,
  pageSize: 10,
})

const dateRange = ref<[string, string] | null>(null)
const detailVisible = ref(false)
const detailRow = ref<TokenUsageRecord | null>(null)
const chartRecords = ref<TokenUsageRecord[]>([])

function getDefaultRange() {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  const startStr = `${sevenDaysAgo.getFullYear()}-${p(sevenDaysAgo.getMonth() + 1)}-${p(sevenDaysAgo.getDate())}`
  return [
    `${startStr} 00:00:00`,
    `${todayStr} 23:59:59`,
  ] as [string, string]
}

onMounted(async () => {
  dateRange.value = getDefaultRange()
  await Promise.all([loadData(), loadChartData(), loadApiKeys()])
})

async function loadData() {
  await tokenStore.fetchUserUsage({
    apikeyId: query.apikeyId,
    groupBy: query.groupBy,
    startTime: dateRange.value![0],
    endTime: dateRange.value![1],
  })
}

/** 图表数据：始终查询该用户全部 API Key，不受下拉筛选影响 */
async function loadChartData() {
  try {
    const res = await queryUserTokenUsage({
      groupBy: 0,
      page: 1,
      pageSize: 9999,
      startTime: dateRange.value![0],
      endTime: dateRange.value![1],
    })
    chartRecords.value = res.data.data?.list ?? []
  } catch {
    chartRecords.value = []
  }
}

async function loadApiKeys() {
  await apiKeyStore.fetchUserPage({ page: 1, pageSize: 100 })
}

function handleSearch() {
  query.page = 1
  Promise.all([loadData(), loadChartData()])
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
    const blob = res.data instanceof Blob
      ? res.data
      : new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    if (blob.type.includes('application/json')) {
      const text = await blob.text()
      const err = JSON.parse(text)
      ElMessage.error(err.message || '导出失败')
      return
    }
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

function showDetail(row: TokenUsageRecord) {
  detailRow.value = row
  detailVisible.value = true
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 3600000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 3600000).toFixed(1)}h`
}

const allRecords = computed(() => tokenStore.records ?? [])

const pagedRecords = computed(() => {
  const start = (query.page - 1) * query.pageSize
  return allRecords.value.slice(start, start + query.pageSize)
})

const chartDates = computed(() => {
  const dates = new Set(chartRecords.value.map(r => r.recordDate).filter(Boolean))
  return Array.from(dates).sort()
})

function resolveApikeyName(apikeyId: number, fallbackApikey?: string): string {
  if (fallbackApikey) return fallbackApikey
  const found = apiKeyStore.list.find(k => k.id === apikeyId)
  return found?.apikey || `Key #${apikeyId}`
}

const reshapedData = computed(() => {
  const records = chartRecords.value
  const dates = chartDates.value
  const apikeyMap = new Map<string, { apikey: string; data: number[]; inputData: number[]; outputData: number[] }>()
  records.forEach(r => {
    const key = resolveApikeyName(r.apikeyId, r.apikey)
    if (!apikeyMap.has(key)) {
      apikeyMap.set(key, { apikey: key, data: new Array(dates.length).fill(0), inputData: new Array(dates.length).fill(0), outputData: new Array(dates.length).fill(0) })
    }
    const entry = apikeyMap.get(key)!
    const idx = dates.indexOf(r.recordDate || '')
    if (idx >= 0) {
      entry.data[idx] = (r.tokens || 0)
      entry.inputData[idx] = (r.inputTokens || 0)
      entry.outputData[idx] = (r.outputTokens || 0)
    }
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
  const records = allRecords.value
  const barDates = new Set(records.map(r => r.recordDate).filter(Boolean))
  const dates = Array.from(barDates).sort()
  const inputMap = new Array(dates.length).fill(0)
  const outputMap = new Array(dates.length).fill(0)
  records.forEach(r => {
    const idx = dates.indexOf(r.recordDate || '')
    if (idx >= 0) {
      inputMap[idx] += (r.inputTokens || 0)
      outputMap[idx] += (r.outputTokens || 0)
    }
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
    series: [
      { name: '输入Token', type: 'bar', data: inputMap, itemStyle: { borderRadius: [4, 4, 0, 0] } },
      { name: '输出Token', type: 'bar', data: outputMap, itemStyle: { borderRadius: [4, 4, 0, 0] } },
    ],
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
          <template #header>输入/输出 Token 用量</template>
          <TokenChart :option="barOption" height="340px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <el-table :data="pagedRecords" v-loading="tokenStore.loading" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="API KeyId" min-width="50" show-overflow-tooltip>
          <template #default="{ row }">{{ row.apikeyId || '-' }}</template>
        </el-table-column>
        <el-table-column label="API Key" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.apikey || '-' }}</template>
        </el-table-column>
        <el-table-column label="总Token" width="110">
          <template #default="{ row }">{{ row.tokens?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="输入Token" width="110">
          <template #default="{ row }">{{ row.inputTokens?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="输出Token" width="110">
          <template #default="{ row }">{{ row.outputTokens?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="请求次数" width="100">
          <template #default="{ row }">{{ row.request?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="总时长" width="100">
          <template #default="{ row }">{{ formatDuration(row.totalDuration) }}</template>
        </el-table-column>
        <el-table-column label="总张数" width="90">
          <template #default="{ row }">{{ row.totalAmount?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="日期" width="120">
          <template #default="{ row }">{{ row.recordDate || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
          </template>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用量详情" width="950px">
      <template v-if="detailRow?.detail && detailRow.detail.length > 0">
        <el-table :data="detailRow.detail" stripe size="small" max-height="500">
          <el-table-column prop="name" label="模型名称" width="130" fixed />
          <el-table-column label="阶梯信息" min-width="240">
            <template #default="{ row: d }">
              <div v-for="(s, i) in (d.stage || [])" :key="i" class="stage-line">
                输入{{ s.inputTokens?.toLocaleString() }} / 输出{{ s.outputTokens?.toLocaleString() }}
                &nbsp;上下文[{{ s.minContext }}, {{ s.maxContext }})
              </div>
              <span v-if="!d.stage || d.stage.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column label="张数" width="80">
            <template #default="{ row: d }">{{ d.amount?.toLocaleString() || '-' }}</template>
          </el-table-column>
          <el-table-column label="按张请求" width="90">
            <template #default="{ row: d }">{{ d.amountRequest?.toLocaleString() || '-' }}</template>
          </el-table-column>
          <el-table-column label="分辨率时长" min-width="170">
            <template #default="{ row: d }">
              <div v-for="(r, i) in (d.resolutionDuration || [])" :key="i" class="stage-line">
                {{ r.resolution }}: {{ r.cnt?.toLocaleString() }}ms&nbsp;({{ r.requestCount }}次)
              </div>
              <span v-if="!d.resolutionDuration || d.resolutionDuration.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column label="分辨率Token" min-width="200">
            <template #default="{ row: d }">
              <div v-for="(r, i) in (d.resolutionToken || [])" :key="i" class="stage-line">
                {{ r.resolution }}: 有视频{{ r.videoModeOutputToken?.toLocaleString() }}
                / 无视频{{ r.videoLessModeOutputToken?.toLocaleString() }}
                ({{ r.requestCount }}次)
              </div>
              <span v-if="!d.resolutionToken || d.resolutionToken.length === 0">-</span>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-empty v-else description="暂无详情数据" />
    </el-dialog>
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
.stage-line { font-size: 12px; line-height: 1.6; color: #666; }
</style>
