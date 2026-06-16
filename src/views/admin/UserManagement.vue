<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import UserEditDialog from '@/components/UserEditDialog.vue'
import type { UserQuery, UserItem } from '@/types/user'

const store = useUserStore()

const query = reactive<UserQuery>({
  page: 1,
  pageSize: 10,
})

const dateRange = ref<[string, string] | null>(null)
const editDialogVisible = ref(false)
const editingUser = ref<UserItem | null>(null)

onMounted(async () => {
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
  await store.fetchPage({ ...query })
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.apikey = undefined
  query.username = undefined
  dateRange.value = null
  query.startTime = undefined
  query.endTime = undefined
  query.page = 1
  loadData()
}

watch(() => query.page, () => { loadData() })

function openEditDialog(user: UserItem) {
  editingUser.value = user
  editDialogVisible.value = true
}

function handleEditSuccess() {
  editDialogVisible.value = false
  loadData()
}

function statusTag(status: number) {
  return status === 1 ? 'success' : 'danger'
}

function statusText(status: number) {
  return status === 1 ? '启用' : '禁用'
}

function roleTag(role: string) {
  return role === 'ADMIN' ? 'warning' : 'info'
}
</script>

<template>
  <div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="API Key">
          <el-input
            v-model="query.apikey"
            placeholder="请输入 API Key"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="query.username"
            placeholder="请输入用户名"
            clearable
            style="width: 180px"
          />
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
        <el-table-column prop="username" label="用户名" min-width="140" show-overflow-tooltip />
        <el-table-column label="邮箱" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="手机号" min-width="130">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="90">
          <template #default="{ row }">
            <el-tag :type="roleTag(row.role)" size="small">
              {{ row.role === 'ADMIN' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="apiKeyCount" label="API Key数量" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
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

    <UserEditDialog
      v-model:visible="editDialogVisible"
      :user="editingUser"
      @success="handleEditSuccess"
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
