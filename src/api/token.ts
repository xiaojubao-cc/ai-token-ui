import http from './index'
import type { ApiResponse } from '@/types/auth'
import type { TokenUsageQuery, TokenUsagePageResult } from '@/types/dashboard'

/** 管理员：分页查询所有用户的 Token 使用量 */
export function queryAdminTokenUsage(data: TokenUsageQuery) {
  return http.post<ApiResponse<TokenUsagePageResult>>('/admin/token-usage/query', data)
}

/** 用户：分页查询当前用户的 Token 使用量 */
export function queryUserTokenUsage(data: TokenUsageQuery) {
  return http.post<ApiResponse<TokenUsagePageResult>>('/user/token-usage/query', data)
}

/** 管理员：导出 Token 用量 Excel */
export function exportAdminTokenUsage(data: TokenUsageQuery) {
  return http.post('/admin/token-usage/export', data, { responseType: 'blob' })
}

/** 用户：导出 Token 用量 Excel */
export function exportUserTokenUsage(data: TokenUsageQuery) {
  return http.post('/user/token-usage/export', data, { responseType: 'blob' })
}
