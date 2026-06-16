import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAdminApiKeyPage, getUserApiKeyPage, getUserList } from '@/api/apikey'
import { queryAvailableModels, updateApiKeyStatus } from '@/api/user'
import type { ApiKeyItem, UserListItem, AdminApiKeyQuery, ApiKeyQuery } from '@/types/apikey'
import type { AvailableModel } from '@/types/user'
import { ElMessage } from 'element-plus'

export const useApiKeyStore = defineStore('apikey', () => {
  const list = ref<ApiKeyItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const userList = ref<UserListItem[]>([])
  const availableModels = ref<AvailableModel[]>([])

  async function fetchAdminPage(query: AdminApiKeyQuery) {
    loading.value = true
    try {
      const res = await getAdminApiKeyPage(query)
      const data = res.data.data
      list.value = data?.list ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  async function fetchUserPage(query: ApiKeyQuery) {
    loading.value = true
    try {
      const res = await getUserApiKeyPage(query)
      const data = res.data.data
      list.value = data?.list ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  async function fetchUserList() {
    const res = await getUserList()
    userList.value = res.data.data ?? []
  }

  async function fetchAvailableModels(userId: number) {
    try {
      const res = await queryAvailableModels(userId)
      availableModels.value = res.data.data ?? []
    } catch {
      availableModels.value = []
    }
  }

  async function updateStatus(apikeyId: number, useStatus: number) {
    try {
      await updateApiKeyStatus(apikeyId, useStatus)
      ElMessage.success('状态更新成功')
      // 更新本地列表中的状态
      const item = list.value.find(k => k.id === apikeyId)
      if (item) {
        item.useStatus = useStatus
      }
    } catch {
      ElMessage.error('状态更新失败')
    }
  }

  return { list, total, loading, userList, availableModels, fetchAdminPage, fetchUserPage, fetchUserList, fetchAvailableModels, updateStatus }
})
