<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useApiKeyStore } from '@/stores/apikey'
import { deleteUserApiKey } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AdminApiKeyQuery } from '@/types/apikey'

const store = useApiKeyStore()

const query = reactive<AdminApiKeyQuery>({
  page: 1,
  pageSize: 10,
})

const dateRange = ref<[string, string] | null>(null)
const modelDialogVisible = ref(false)
const selectedUserId = ref<number | null>(null)

onMounted(async () => {
  await store.fetchUserList()
  await loadData()
})

async function loadData() {
  if (dateRange.value) {
    query.startTime = dateRange.value[0]
    query.endTime = dateRange.value[1]
  } else {
    query.startTime = undefined
    query.endTime = undefined
  }
  await store.fetchAdminPage({ ...query })
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.userId = undefined
  dateRange.value = null
  query.startTime = undefined
  query.endTime = undefined
  query.page = 1
  loadData()
}

watch(() => query.page, () => { loadData() })

function statusTag(status: number) {
  return status === 1 ? 'success' : 'danger'
}

function statusText(status: number) {
  return status === 1 ? '启用' : '禁用'
}

async function handleToggleStatus(row: { id: number; useStatus: number }) {
  const newStatus = row.useStatus === 1 ? 0 : 1
  await store.updateStatus(row.id, newStatus)
  await loadData()
}

async function handleDelete(row: { id: number; apikey: string }) {
  try {
    await ElMessageBox.confirm(
      `确定要删除该 API Key 吗？`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    await deleteUserApiKey(row.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch {
    // 取消操作
  }
}

async function handleShowModels(row: { userId: number }) {
  selectedUserId.value = row.userId
  await store.fetchAvailableModels(row.userId)
  modelDialogVisible.value = true
}
</script>

<template>
  <div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="用户">
          <el-select
            v-model="query.userId"
            placeholder="全部用户"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="u in store.userList"
              :key="u.id"
              :label="u.username"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="store.list" v-loading="store.loading" stripe>
        <el-table-column type="index" :index="(idx: number) => (query.page - 1) * query.pageSize + idx + 1" label="序号" width="70" />
        <el-table-column prop="id" label="API KeyId" min-width="70" show-overflow-tooltip />
        <el-table-column prop="apikey" label="API Key" min-width="240" show-overflow-tooltip />
        <el-table-column prop="username" label="所属用户" min-width="140" show-overflow-tooltip />
        <el-table-column prop="businessName" label="公司名称" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.businessName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="useStatus" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.useStatus)" size="small">
              {{ statusText(row.useStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
<!--            <el-button type="primary" link size="small" @click="handleShowModels(row)">-->
<!--              可用模型-->
<!--            </el-button>-->
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button
              :type="row.useStatus === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.useStatus === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:currentPage="query.page"
          v-model:pageSize="query.pageSize"
          :total="store.total"
          :pageSizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"

        />
      </div>
    </el-card>

    <!-- 可用模型弹窗隐藏，暂时没有实际意义 -->
<!--    <el-dialog v-model="modelDialogVisible" title="可用模型列表" width="500px">-->
<!--      <el-table :data="store.availableModels" stripe size="small">-->
<!--        <el-table-column type="index" label="序号" width="70" />-->
<!--        <el-table-column prop="modelName" label="模型名称" />-->
<!--      </el-table>-->
<!--    </el-dialog>-->
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
