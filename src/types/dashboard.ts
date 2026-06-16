/** Token 用量查询参数 */
export interface TokenUsageQuery {
  apikeyId?: number
  groupBy: number
  startTime: string
  endTime: string
  page?: number
  pageSize?: number
}

/** Token 用量记录 */
export interface TokenUsageRecord {
  accountId: string
  userId: string
  apikeyId: number
  apikey?: string
  businessName?: string
  recordDate?: string
  tokens: number
  inputTokens: number
  outputTokens: number
  request: number
  totalDuration: number
  totalAmount: number
  detail?: DetailItem[]
}

/** 模型详情 */
export interface DetailItem {
  name: string
  stage: StageItem[]
  amount: number
  amountRequest: number
  resolutionDuration: ResolutionDurationItem[]
  resolutionToken: ResolutionTokenItem[]
}

/** 阶梯信息 */
export interface StageItem {
  inputTokens: number
  outputTokens: number
  minContext: number
  maxContext: number
}

/** 分辨率时长 */
export interface ResolutionDurationItem {
  resolution: string
  cnt: number
  requestCount: number
}

/** 分辨率Token */
export interface ResolutionTokenItem {
  resolution: string
  videoModeOutputToken: number
  videoLessModeOutputToken: number
  requestCount: number
}

/** Token 用量分页结果 */
export interface TokenUsagePageResult {
  total: number
  page: number
  pageSize: number
  list: TokenUsageRecord[]
}

/** 仪表盘统计数据 */
export interface DashboardStats {
  totalTokens: number
  totalInputTokens: number
  totalOutputTokens: number
  totalRequests: number
  activeUsers: number
  trendData: TrendPoint[]
  distribution: DistItem[]
}

/** 趋势数据点 */
export interface TrendPoint {
  date: string
  tokens: number
}

/** 分布数据项 */
export interface DistItem {
  name: string
  value: number
}
