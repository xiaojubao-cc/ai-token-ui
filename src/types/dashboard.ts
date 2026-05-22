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
  modelName?: string
  recordDate?: string
  tokens: number
  request: number
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
