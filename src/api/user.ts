import http from './index'
import type { ApiResponse } from '@/types/auth'
import type { UserItem, UserPageResult, UserQuery, UserApiKeyItem } from '@/types/user'

/** 管理员：分页查询用户 */
export function getUserPage(params: UserQuery) {
  return http.get<ApiResponse<UserPageResult>>('/admin/users/page', { params })
}

/** 获取用户详情 */
export function getUserDetail(id: number) {
  return http.get<ApiResponse<UserItem>>(`/admin/users/${id}`)
}

/** 新增用户 */
export function createUser(data: Omit<UserItem, 'id' | 'createTime'> & { password: string }) {
  return http.post<ApiResponse<null>>('/admin/users/create', data)
}

/** 更新用户 */
export function updateUser(data: Partial<UserItem> & { password?: string }) {
  return http.post<ApiResponse<null>>('/admin/users/update', data)
}

/** 获取用户的 API Key 列表 */
export function getUserApiKeys(userId: number) {
  return http.get<ApiResponse<UserApiKeyItem[]>>(`/admin/users/${userId}/apikeys`)
}

/** 为用户新增 API Key */
export function addUserApiKey(userId: number, data: Pick<UserApiKeyItem, 'apikey' | 'modelId' | 'status'>) {
  return http.post<ApiResponse<null>>(`/admin/users/${userId}/apikeys/create`, data)
}

/** 删除用户的 API Key */
export function deleteUserApiKey(apikeyId: number) {
  return http.post<ApiResponse<null>>('/admin/apikeys/delete', { id: apikeyId })
}
