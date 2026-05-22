import http from './index'
import type { ApiResponse } from '@/types/auth'
import type { ApiKeyPageResult, AdminApiKeyQuery, ApiKeyQuery, UserListItem } from '@/types/apikey'

/** 管理员：分页查询所有 API Key */
export function getAdminApiKeyPage(params: AdminApiKeyQuery) {
  return http.get<ApiResponse<ApiKeyPageResult>>('/admin/apikey/page', { params })
}

/** 用户：分页查询当前用户的 API Key */
export function getUserApiKeyPage(params: ApiKeyQuery) {
  return http.get<ApiResponse<ApiKeyPageResult>>('/user/apikey/page', { params })
}

/** 管理员：获取用户列表 */
export function getUserList() {
  return http.get<ApiResponse<UserListItem[]>>('/admin/users')
}
