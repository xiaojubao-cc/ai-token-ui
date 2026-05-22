import { defineStore } from 'pinia'
import { ref } from 'vue'
import { queryAdminTokenUsage, queryUserTokenUsage } from '@/api/token'
import type { TokenUsageRecord, TokenUsageQuery } from '@/types/dashboard'

export const useTokenStore = defineStore('token', () => {
  const records = ref<TokenUsageRecord[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchAdminUsage(query: TokenUsageQuery) {
    loading.value = true
    try {
      const res = await queryAdminTokenUsage(query)
      const data = res.data.data
      records.value = data?.list ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  async function fetchUserUsage(query: TokenUsageQuery) {
    loading.value = true
    try {
      const res = await queryUserTokenUsage(query)
      const data = res.data.data
      records.value = data?.list ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  return { records, total, loading, fetchAdminUsage, fetchUserUsage }
})
