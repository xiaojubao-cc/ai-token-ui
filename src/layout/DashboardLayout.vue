<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserFilled, ArrowDown, Key, SwitchButton, Expand } from '@element-plus/icons-vue'
import AdminSidebar from '@/layout/AdminSidebar.vue'
import UserSidebar from '@/layout/UserSidebar.vue'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const showPwdDialog = ref(false)
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function handleCommand(command: string) {
  if (command === 'password') {
    showPwdDialog.value = true
  } else if (command === 'logout') {
    handleLogout()
  }
}

async function handleLogout() {
  await authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <el-container class="layout-root">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-left">
        <el-button class="collapse-btn" text @click="toggleSidebar">
          <el-icon :class="{ rotated: sidebarCollapsed }" size="24"><Expand /></el-icon>
        </el-button>
        <span class="logo-text">AI Token </span>
      </div>

      <div class="header-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-trigger">
            <el-avatar :size="32" :icon="UserFilled" />
            <span class="user-name">{{ authStore.username }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="password">
                <el-icon><Key /></el-icon>
                修改密码
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="layout-body">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarCollapsed ? '64px' : '220px'" class="layout-aside">
        <AdminSidebar v-if="authStore.isAdmin" :collapsed="sidebarCollapsed" />
        <UserSidebar v-else :collapsed="sidebarCollapsed" />
      </el-aside>

      <!-- 内容区 -->
      <el-main class="layout-main">
        <BreadcrumbNav />
        <div class="content-wrap">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>

  <ChangePasswordDialog v-model:visible="showPwdDialog" />
</template>

<style scoped>
.layout-root {
  min-height: 100vh;
  background: #f8f3eb;
}

/* ===== 顶部栏 ===== */
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: linear-gradient(135deg, #faf7f2 0%, #f5f0e8 50%, #efe8dc 100%);
  border-bottom: 1px solid rgba(170, 140, 110, 0.18);
  box-shadow: 0 1px 8px rgba(170, 140, 110, 0.06);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.collapse-btn {
  padding: 0;
  color: #6b5c4f;
}

.collapse-btn:hover {
  color: #c68b5e;
}

.collapse-btn .rotated {
  transform: rotate(90deg);
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: -0.5px;
  margin-left: 2px;
  background: linear-gradient(135deg, #c68b5e, #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px 4px 4px;
  border-radius: 10px;
  transition: background 0.2s;
  user-select: none;
}

.user-trigger:hover {
  background: rgba(198, 139, 94, 0.08);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #4a3b34;
}

.arrow-icon {
  font-size: 12px;
  color: #9b8a78;
  transition: transform 0.2s;
}

.user-trigger:hover .arrow-icon {
  transform: rotate(180deg);
}

/* ===== 侧边栏 ===== */
.layout-body {
  height: calc(100vh - 56px);
}

.layout-aside {
  background: #4a3b34;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  transition: width 0.25s ease;
  overflow: hidden;
}

.layout-aside :deep(.el-menu) {
  background: transparent;
  border-right: none;
}

.layout-aside :deep(.el-menu-item) {
  color: rgba(245, 240, 232, 0.65);
  margin: 2px 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.layout-aside :deep(.el-menu-item:hover) {
  color: #f5f0e8;
  background: rgba(198, 139, 94, 0.12);
}

.layout-aside :deep(.el-menu-item.is-active) {
  color: #faf7f2;
  background: linear-gradient(135deg, #c68b5e, #a67c34);
  box-shadow: 0 2px 8px rgba(198, 139, 94, 0.25);
}

.layout-aside :deep(.el-menu-item .el-icon) {
  color: inherit;
}

/* ===== 内容区 ===== */
.layout-main {
  padding: 16px 24px 24px;
  overflow-y: auto;
  background: #f8f3eb;
}

.content-wrap {
  margin-top: 12px;
}
</style>
