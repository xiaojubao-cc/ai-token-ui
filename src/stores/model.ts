import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getModelPage, getModelList } from '@/api/model'
import type { ModelItem, ModelQuery } from '@/types/model'

export const useModelStore = defineStore('model', () => {
  const list = ref<ModelItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const allModels = ref<ModelItem[]>([])

  async function fetchPage(query: ModelQuery) {
    loading.value = true
    try {
      const res = await getModelPage(query)
      const data = res.data.data
      list.value = data?.list ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  async function fetchList() {
    const res = await getModelList()
    allModels.value = res.data.data ?? []
  }

  return { list, total, loading, allModels, fetchPage, fetchList }
})
