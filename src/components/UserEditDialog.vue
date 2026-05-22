<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserApiKeys, addUserApiKey, deleteUserApiKey, updateUser } from '@/api/user'
import { useModelStore } from '@/stores/model'
import type { UserItem, UserApiKeyItem } from '@/types/user'
import type { ModelItem } from '@/types/model'

const props = defineProps<{
  visible: boolean
  user: UserItem | null
}>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const modelStore = useModelStore()
const formRef = ref()
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  role: 'USER' as 'ADMIN' | 'USER',
  status: 1,
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const localApiKeys = ref<(UserApiKeyItem & { _new?: boolean; _deleted?: boolean })[]>([])

function addApiKeyRow() {
  localApiKeys.value.push({
    apikey: '',
    modelId: undefined,
    modelName: undefined,
    status: 1,
    _new: true,
  })
}

function removeApiKeyRow(index: number) {
  const item = localApiKeys.value[index]
  if (item.id && !item._new) {
    item._deleted = true
  } else {
    localApiKeys.value.splice(index, 1)
  }
}

function modelNameById(id: number | undefined) {
  if (!id) return ''
  return modelStore.allModels.find((m: ModelItem) => m.id === id)?.modelName ?? ''
}

watch(() => props.visible, async (val) => {
  if (val && props.user) {
    form.username = props.user.username
    form.password = ''
    form.email = props.user.email ?? ''
    form.phone = props.user.phone ?? ''
    form.role = props.user.role
    form.status = props.user.status

    try {
      const res = await getUserApiKeys(props.user.id)
      localApiKeys.value = (res.data.data ?? []).map(k => ({ ...k, _new: false, _deleted: false }))
    } catch {
      localApiKeys.value = []
    }

    await modelStore.fetchList()
    formRef.value?.resetFields()
  } else if (!val) {
    localApiKeys.value = []
    formRef.value?.resetFields()
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await updateUser({ id: props.user!.id, ...form, password: form.password || undefined })

    for (const key of localApiKeys.value) {
      if (key._new) {
        await addUserApiKey(props.user!.id, {
          apikey: key.apikey,
          modelId: key.modelId,
          status: key.status,
        })
      }
    }

    for (const key of localApiKeys.value) {
      if (key._deleted && key.id) {
        await deleteUserApiKey(key.id)
      }
    }

    ElMessage.success('用户信息更新成功')
    emit('success')
    emit('update:visible', false)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="编辑用户"
    width="720px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="留空则不修改"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" style="width: 100%">
              <el-option label="管理员" value="ADMIN" />
              <el-option label="普通用户" value="USER" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">API Key 管理</el-divider>

      <div class="apikey-table-wrap">
        <el-table :data="localApiKeys" stripe size="small">
          <el-table-column label="API Key" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.apikey" placeholder="输入 API Key" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="关联模型" width="180">
            <template #default="{ row }">
              <el-select
                v-model="row.modelId"
                placeholder="选择模型"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="m in modelStore.allModels"
                  :key="m.id"
                  :label="m.modelName"
                  :value="m.id"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeApiKeyRow($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
          <template #append>
            <div class="add-key-row">
              <el-button type="primary" link @click="addApiKeyRow">+ 添加 API Key</el-button>
            </div>
          </template>
        </el-table>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.apikey-table-wrap {
  margin-top: 8px;
}

.apikey-table-wrap :deep(.el-table) {
  border-radius: 8px;
  border: 1px solid rgba(198, 139, 94, 0.08);
}

.add-key-row {
  display: flex;
  justify-content: center;
  padding: 8px;
}
</style>
