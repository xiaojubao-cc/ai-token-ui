<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useModelStore } from '@/stores/model'
import { deleteModel } from '@/api/model'
import ModelFormDialog from '@/components/ModelFormDialog.vue'
import type { ModelQuery, ModelItem } from '@/types/model'

const store = useModelStore()

const query = reactive<ModelQuery>({
  page: 1,
  pageSize: 10,
})

const dialogVisible = ref(false)
const editingModel = ref<ModelItem | null>(null)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  await store.fetchPage({ ...query })
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.keyword = undefined
  query.page = 1
  loadData()
}

watch(() => query.page, () => { loadData() })

function openCreateDialog() {
  editingModel.value = null
  dialogVisible.value = true
}

function openEditDialog(model: ModelItem) {
  editingModel.value = model
  dialogVisible.value = true
}

function handleSuccess() {
  dialogVisible.value = false
  loadData()
}

function handleDelete(model: ModelItem) {
  ElMessageBox.confirm(
    `确定要删除模型「${model.modelName}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(async () => {
    await deleteModel(model.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => { /* 用户取消 */ })
}

</script>

<template>
  <div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="模型名称/代码"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openCreateDialog">新增模型</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="store.list" v-loading="store.loading" stripe>
        <el-table-column type="index" :index="(idx: number) => (query.page - 1) * query.pageSize + idx + 1" label="序号" width="70" />
        <el-table-column prop="modelName" label="模型名称" width="180" />
        <el-table-column prop="modelCode" label="模型代码" width="180" />
        <el-table-column label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:currentPage="query.page"
          v-model:pageSize="query.pageSize"
          :total="store.total"
          :pageSizes="[10]"
          layout="total, sizes, prev, pager, next"
          
        />
      </div>
    </el-card>

    <ModelFormDialog
      v-model:visible="dialogVisible"
      :model="editingModel"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
h3 {
  color: #3d3028;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid rgba(198, 139, 94, 0.08);
  box-shadow: 0 2px 12px rgba(198, 139, 94, 0.04);
}

.filter-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.table-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid rgba(198, 139, 94, 0.06);
  box-shadow: 0 2px 12px rgba(198, 139, 94, 0.04);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
