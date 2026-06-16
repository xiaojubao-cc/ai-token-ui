import http from './index'
import type { ApiResponse } from '@/types/auth'
import type { UserItem, UserPageResult, UserQuery, UserApiKeyItem, AvailableModel } from '@/types/user'

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
  return http.get<ApiResponse<UserApiKeyItem[]>>('/admin/apikey/list', { params: { userId } })
}

/** 为用户新增 API Key（调用天翼云接口） */
export function addUserApiKey(userId: number, data: { status?: number; apikey?: string }) {
  return http.post<ApiResponse<null>>('/admin/apikey/create', { userId, ...data })
}

/** 删除 API Key */
export function deleteUserApiKey(apikeyId: number) {
  return http.post<ApiResponse<null>>('/admin/apikey/delete', { id: apikeyId })
}

/** 更新 API Key 状态（启用/禁用） */
export function updateApiKeyStatus(apikeyId: number, useStatus: number) {
  return http.post<ApiResponse<null>>('/admin/apikey/update', { id: apikeyId, useStatus })
}

/** 更新 API Key 明文（仅本地数据库） */
export function updateApiKeyPlaintext(apikeyId: number, apikey: string) {
  return http.post<ApiResponse<null>>('/admin/apikey/updatePlaintext', { id: apikeyId, apikey })
}

/** 查询用户的可用模型列表（调用天翼云接口） */
export function queryAvailableModels(userId: number) {
  return http.get<ApiResponse<AvailableModel[]>>('/admin/models/available', { params: { userId } })
}
