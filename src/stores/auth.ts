import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/auth'
import { login as loginApi, register as registerApi, getCurrentUser, logout as logoutApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const businessName = computed(() => user.value?.businessName ?? user.value?.username ?? '')
  const username = computed(() => user.value?.username ?? '')

  /** 登录 */
  async function login(data: LoginRequest) {
    loading.value = true
    try {
      const tokenRes = await loginApi(data)
      const tokenInfo = tokenRes.data.data
      localStorage.setItem('accessToken', tokenInfo.accessToken)
      localStorage.setItem('refreshToken', tokenInfo.refreshToken)

      const userRes = await getCurrentUser()
      user.value = userRes.data.data
      return user.value!
    } finally {
      loading.value = false
    }
  }

  /** 注册 */
  async function register(data: RegisterRequest) {
    loading.value = true
    try {
      await registerApi(data)
    } finally {
      loading.value = false
    }
  }

  /** 从后端恢复用户状态（页面刷新后调用） */
  async function fetchUser() {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      user.value = null
      return
    }
    try {
      const res = await getCurrentUser()
      user.value = res.data.data
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      user.value = null
    }
  }

  /** 登出 */
  async function logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await logoutApi(refreshToken)
      }
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      user.value = null
    }
  }

  return { user, loading, isLoggedIn, isAdmin, username, businessName, login, register, fetchUser, logout }
})
