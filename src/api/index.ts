import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

// 请求拦截器：自动携带 accessToken
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理错误
http.interceptors.response.use(
  (response) => {
    // blob 响应（如文件下载）跳过业务状态码检查
    if (response.config.responseType === 'blob' || response.data instanceof Blob) {
      return response
    }
    const body = response.data
    // 后端返回的业务错误
    if (body.code !== 0 && body.code !== 200) {
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return response
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response
      // blob 响应错误时，data 为 Blob 无法直接读 .message
      const isBlob = config?.responseType === 'blob' || error.response.data instanceof Blob
      if (status === 401) {
        // 登录接口的 401 是密码错误，不是 token 过期，不清理 token
        if (config.url?.includes('/auth/login')) {
          const msg = (!isBlob && error.response.data?.message) || '用户名或密码错误'
          ElMessage.error(msg)
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          ElMessage.error('登录已过期，请重新登录')
          window.location.href = '/login'
        }
      } else if (status === 403) {
        ElMessage.error('没有访问权限')
      } else {
        ElMessage.error((!isBlob && error.response.data?.message) || '服务器错误')
      }
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  },
)

export default http
