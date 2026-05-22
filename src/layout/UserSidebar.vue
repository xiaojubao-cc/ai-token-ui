<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, Key, Coin } from '@element-plus/icons-vue'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const router = useRouter()

const menuMap: Record<string, string> = {
  dashboard: '/user/dashboard',
  apikey: '/user/apikey',
  'token-usage': '/user/token-usage',
}

const activeIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/user/dashboard')) return 'dashboard'
  if (path.startsWith('/user/apikey')) return 'apikey'
  if (path.startsWith('/user/token-usage')) return 'token-usage'
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
    <el-menu-item index="apikey">
      <el-icon><Key /></el-icon>
      <template #title>我的 API Key</template>
    </el-menu-item>
    <el-menu-item index="token-usage">
      <el-icon><Coin /></el-icon>
      <template #title>Token 使用记录</template>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
/* 侧边栏样式由 DashboardLayout :deep() 统一管理 */
</style>
