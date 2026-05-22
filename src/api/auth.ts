import http from './index'
import type { ApiResponse, LoginRequest, RegisterRequest, UserInfo, TokenInfo } from '@/types/auth'

/** 登录：返回 JWT Token 信息 */
export function login(data: LoginRequest) {
  return http.post<ApiResponse<TokenInfo>>('/auth/login', data)
}

/** 注册 */
export function register(data: RegisterRequest) {
  return http.post<ApiResponse<null>>('/auth/register', data)
}

/** 获取当前登录用户信息（页面刷新后恢复状态用） */
export function getCurrentUser() {
  return http.get<ApiResponse<UserInfo>>('/auth/me')
}

/** 登出：传入 refreshToken，后端将 accessToken 加入黑名单 */
export function logout(refreshToken: string) {
  return http.post<ApiResponse<null>>('/auth/logout', { refreshToken })
}

/** 忘记密码：发送重置链接到邮箱 */
export function forgotPassword(data: { email: string,username: string }) {
  return http.post<ApiResponse<null>>('/auth/forget-password', data)
}

/** 修改密码 */
export function changePassword(data: { id: number; oldPassword: string; newPassword: string }) {
  return http.post<ApiResponse<null>>('/auth/change-password', data)
}
