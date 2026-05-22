<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, User, Key, Coin, Cpu } from '@element-plus/icons-vue'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const router = useRouter()

const menuMap: Record<string, string> = {
  dashboard: '/admin/dashboard',
  users: '/admin/users',
  apikey: '/admin/apikey',
  tokens: '/admin/tokens',
  models: '/admin/models',
}

const activeIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/dashboard')) return 'dashboard'
  if (path.startsWith('/admin/users')) return 'users'
  if (path.startsWith('/admin/apikey')) return 'apikey'
  if (path.startsWith('/admin/tokens')) return 'tokens'
  if (path.startsWith('/admin/models')) return 'models'
  return 'dashboard'
})

function navigate(index: string) {
  const target = menuMap[index]
  if (target) router.push(target)
}
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    :collapse="collapsed"
    class="aside-menu"
    @select="navigate"
  >
    <el-menu-item index="dashboard">
      <el-icon><HomeFilled /></el-icon>
      <template #title>首页</template>
    </el-menu-item>
    <el-menu-item index="users">
      <el-icon><User /></el-icon>
      <template #title>用户管理</template>
    </el-menu-item>
    <el-menu-item index="apikey">
      <el-icon><Key /></el-icon>
      <template #title>API Key 管理</template>
    </el-menu-item>
    <el-menu-item index="tokens">
      <el-icon><Coin /></el-icon>
      <template #title>Token 管理</template>
    </el-menu-item>
    <el-menu-item index="models">
      <el-icon><Cpu /></el-icon>
      <template #title>模型管理</template>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
/* 侧边栏样式由 DashboardLayout :deep() 统一管理 */
</style>
