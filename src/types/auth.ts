/** 用户角色 */
export type UserRole = 'ADMIN' | 'USER'

/** 后端返回的用户信息 */
export interface UserInfo {
  id: number
  username: string
  businessName: string
  role: UserRole
}

/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

/** 登录返回的 Token 信息 */
export interface TokenInfo {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

/** 注册请求 */
export interface RegisterRequest {
  username: string
  businessName: string
  password: string
  confirmPassword: string
  phone: string
  email: string
}

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
