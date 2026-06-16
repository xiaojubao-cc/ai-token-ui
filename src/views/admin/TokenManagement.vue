<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTokenStore } from '@/stores/token'
import { useApiKeyStore } from '@/stores/apikey'
import { exportAdminTokenUsage } from '@/api/token'
import { ElMessage } from 'element-plus'
import TokenChart from '@/components/TokenChart.vue'
import type { EChartsOption } from 'echarts'
import type { TokenUsageRecord } from '@/types/dashboard'

const tokenStore = useTokenStore()
const apiKeyStore = useApiKeyStore()

const query = reactive({
  businessName: '',
  apikeyId: undefined as number | undefined,
  groupBy: 0,
  page: 1,
  pageSize: 10,
})

const dateRange = ref<[string, string] | null>(null)
const detailVisible = ref(false)
const detailRow = ref<TokenUsageRecord | null>(null)

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
  await Promise.all([loadData(), loadApiKeyData()])
})

async function loadData() {
  await tokenStore.fetchAdminUsage({
    apikeyId: query.apikeyId,
    groupBy: query.groupBy,
    startTime: dateRange.value![0],
    endTime: dateRange.value![1],
  })
}

async function loadApiKeyData() {
  await apiKeyStore.fetchAdminPage({ page: 1, pageSize: 9999 })
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

// 企业列表：来自全量 API Key 数据，不受 token 查询结果影响
const enterpriseList = computed(() => {
  const set = new Set<string>()
  apiKeyStore.list.forEach(k => { if (k.businessName) set.add(k.businessName) })
  return Array.from(set).sort()
})

const filteredByEnterprise = computed(() => {
  if (!query.businessName) return allRecords.value
  return allRecords.value.filter(r => r.businessName === query.businessName)
})

// API Key 选项：来自全量 API Key 数据，根据选中的企业过滤
const apikeyOptions = computed(() => {
  let source = apiKeyStore.list
  if (query.businessName) {
    source = apiKeyStore.list.filter(k => k.businessName === query.businessName)
  }
  const seen = new Set<number>()
  return source.filter(k => {
    if (seen.has(k.id)) return false
    seen.add(k.id)
    return true
  }).map(k => ({
    apikeyId: k.id,
    apikey: k.apikey,
  }))
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

function resolveApikeyName(apikeyId: number, fallbackApikey?: string): string {
  if (fallbackApikey) return fallbackApikey
  const found = apiKeyStore.list.find(k => k.id === apikeyId)
  return found?.apikey || `Key #${apikeyId}`
}

const lineOption = computed<EChartsOption>(() => {
  const records = displayRecords.value
  const dates = allDates.value
  // 按 apikey 分组展示总Token趋势
  const keyMap = new Map<string, number[]>()
  records.forEach(r => {
    const label = resolveApikeyName(r.apikeyId, r.apikey)
    if (!keyMap.has(label)) keyMap.set(label, new Array(dates.length).fill(0))
    const idx = dates.indexOf(r.recordDate || '')
    if (idx >= 0) keyMap.get(label)![idx] += (r.tokens || 0)
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
    series: Array.from(keyMap.entries()).map(([name, data]) => ({ name, type: 'line', data, smooth: true })),
  }
})

const barOption = computed<EChartsOption>(() => {
  const records = displayRecords.value
  const dates = allDates.value
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
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>各 API Key 总Token用量趋势</template>
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
      <el-table :data="displayRecords" v-loading="tokenStore.loading" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="API KeyId" min-width="50" show-overflow-tooltip>
          <template #default="{ row }">{{ row.apikeyId || '-' }}</template>
        </el-table-column>
        <el-table-column label="API Key" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.apikey || '-' }}</template>
        </el-table-column>
        <el-table-column label="企业名称" width="160">
          <template #default="{ row }">{{ row.businessName || '-' }}</template>
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
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
          </template>
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
