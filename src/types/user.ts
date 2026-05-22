/** 用户列表项 */
export interface UserItem {
  id: number
  username: string
  businessName: string
  email?: string
  phone?: string
  role: 'ADMIN' | 'USER'
  apiKeyCount?: number
  associatedModels?: string
  status: number
  createTime?: string
}

/** 用户查询参数 */
export interface UserQuery {
  page: number
  pageSize: number
  apikey?: string
  username?: string
  startTime?: string
  endTime?: string
}

/** 用户分页结果 */
export interface UserPageResult {
  total: number
  page: number
  pageSize: number
  list: UserItem[]
}

/** 用户关联 API Key */
export interface UserApiKeyItem {
  id?: number
  userId?: number
  apikey: string
  modelId?: number
  modelName?: string
  status: number
}

/** 用户新增/编辑表单 */
export interface UserForm {
  id?: number
  username: string
  password?: string
  email: string
  phone: string
  role: 'ADMIN' | 'USER'
  status: number
}
