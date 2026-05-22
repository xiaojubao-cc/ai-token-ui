import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAdminApiKeyPage, getUserApiKeyPage, getUserList } from '@/api/apikey'
import type { ApiKeyItem, UserListItem, AdminApiKeyQuery, ApiKeyQuery } from '@/types/apikey'

export const useApiKeyStore = defineStore('apikey', () => {
  const list = ref<ApiKeyItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const userList = ref<UserListItem[]>([])

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

  return { list, total, loading, userList, fetchAdminPage, fetchUserPage, fetchUserList }
})
