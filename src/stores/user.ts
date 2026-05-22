import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserPage } from '@/api/user'
import type { UserItem, UserQuery } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const list = ref<UserItem[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchPage(query: UserQuery) {
    loading.value = true
    try {
      const res = await getUserPage(query)
      const data = res.data.data
      list.value = data?.list ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  return { list, total, loading, fetchPage }
})
