/** 模型项 */
export interface ModelItem {
  id: number
  modelName: string
  modelCode: string
  description?: string
  createTime?: string
}

/** 模型查询参数 */
export interface ModelQuery {
  page: number
  pageSize: number
  keyword?: string
}

/** 模型分页结果 */
export interface ModelPageResult {
  total: number
  page: number
  pageSize: number
  list: ModelItem[]
}

/** 模型表单 */
export interface ModelForm {
  id?: number
  modelName: string
  modelCode: string
  description: string
}
