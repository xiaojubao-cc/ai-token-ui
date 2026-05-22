import http from './index'
import type { ApiResponse } from '@/types/auth'
import type { ModelItem, ModelPageResult, ModelQuery } from '@/types/model'

/** 管理员：分页查询模型 */
export function getModelPage(params: ModelQuery) {
  return http.get<ApiResponse<ModelPageResult>>('/admin/models/page', { params })
}

/** 管理员：获取全部模型列表（下拉选择用） */
export function getModelList() {
  return http.get<ApiResponse<ModelItem[]>>('/admin/models')
}

/** 新增模型 */
export function createModel(data: { modelName: string; modelCode: string; description: string }) {
  return http.post<ApiResponse<null>>('/admin/models/create', data)
}

/** 更新模型 */
export function updateModel(data: ModelItem) {
  return http.post<ApiResponse<null>>('/admin/models/update', data)
}

/** 删除模型 */
export function deleteModel(id: number) {
  return http.post<ApiResponse<null>>('/admin/models/delete', { id })
}
