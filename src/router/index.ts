import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/admin',
      component: () => import('../layout/DashboardLayout.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] as UserRole[] },
      children: [
        {
          path: 'dashboard',
          name: 'adminDashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'users',
          name: 'userManagement',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'apikey',
          name: 'adminApiKey',
          component: () => import('@/views/admin/ApiKeyManagement.vue'),
          meta: { title: 'API Key 管理' },
        },
        {
          path: 'tokens',
          name: 'adminTokens',
          component: () => import('@/views/admin/TokenManagement.vue'),
          meta: { title: 'Token 管理' },
        },
        // {
        //   path: 'models',
        //   name: 'modelManagement',
        //   component: () => import('@/views/admin/ModelManagement.vue'),
        //   meta: { title: '模型管理' },
        // },
        { path: '', redirect: 'dashboard' },
      ],
    },
    {
      path: '/user',
      component: () => import('../layout/DashboardLayout.vue'),
      meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] as UserRole[] },
      children: [
        {
          path: 'dashboard',
          name: 'userDashboard',
          component: () => import('@/views/user/UserDashboardView.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'apikey',
          name: 'userApiKey',
          component: () => import('@/views/user/UserApiKey.vue'),
          meta: { title: '我的 API Key' },
        },
        {
          path: 'token-usage',
          name: 'userTokenUsage',
          component: () => import('@/views/user/UserTokenUsage.vue'),
          meta: { title: 'Token 使用记录' },
        },
        { path: '', redirect: 'dashboard' },
      ],
    },
    {
      path: '/',
      redirect: '/login',
    },
  ],
})

router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()

  if (!authStore.user) {
    await authStore.fetchUser()
  }

  const isLoggedIn = authStore.isLoggedIn

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth === true)
  const allowedRoles = to.matched
    .flatMap(r => (r.meta.roles as UserRole[] | undefined) ?? [])
  const isGuest = to.matched.some(r => r.meta.guest === true)

  if (requiresAuth) {
    if (!isLoggedIn) {
      return '/login'
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.user!.role)) {
      return authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard'
    }
    return
  }

  if (isGuest && isLoggedIn) {
    return authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard'
  }
})

export default router
