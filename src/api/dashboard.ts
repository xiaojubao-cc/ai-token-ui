import http from './index'
import type { ApiResponse } from '@/types/auth'
import type { DashboardStats } from '@/types/dashboard'

/** 管理员仪表盘数据 */
export function getAdminDashboardStats(params: { startTime: string; endTime: string }) {
  return http.get<ApiResponse<DashboardStats>>('/dashboard/admin/stats', { params })
}

/** 用户仪表盘数据 */
export function getUserDashboardStats(params: { startTime: string; endTime: string }) {
  return http.get<ApiResponse<DashboardStats>>('/dashboard/user/stats', { params })
}
