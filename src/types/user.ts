/** 用户列表项 */
export interface UserItem {
  id: number
  username: string
  businessName: string
  email?: string
  phone?: string
  userId?: string
  accountId?: string
  accessKey?: string
  securityKey?: string
  role: 'ADMIN' | 'USER'
  apiKeyCount?: number
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
  secretKey?: string
  status: number
  createTime?: string
}

/** 用户新增/编辑表单 */
export interface UserForm {
  id?: number
  username: string
  password?: string
  email: string
  phone: string
  userId?: string
  accountId?: string
  accessKey?: string
  securityKey?: string
  role: 'ADMIN' | 'USER'
  status: number
}

/** 可用模型 */
export interface AvailableModel {
  modelName: string
}
