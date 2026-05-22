/** API Key 项 */
export interface ApiKeyItem {
  id: number
  userId: number
  username?: string
  apikey: string
  modelId?: number
  modelName?: string
  modelCode?: string
  useStatus: number
  createTime?: string
}

/** API Key 分页查询参数 */
export interface ApiKeyQuery {
  page: number
  pageSize: number
}

/** 管理员 API Key 查询参数 */
export interface AdminApiKeyQuery extends ApiKeyQuery {
  userId?: number
  startTime?: string
  endTime?: string
}

/** API Key 分页结果 */
export interface ApiKeyPageResult {
  total: number
  page: number
  pageSize: number
  list: ApiKeyItem[]
}

/** 用户列表项（下拉框用） */
export interface UserListItem {
  id: number
  username: string
}
