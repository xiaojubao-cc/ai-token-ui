<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserApiKeys, addUserApiKey, updateUser, updateApiKeyStatus, updateApiKeyPlaintext } from '@/api/user'
import type { UserItem, UserApiKeyItem } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: UserItem | null
}>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  userId: '',
  accountId: '',
  accessKey: '',
  securityKey: '',
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

const localApiKeys = ref<UserApiKeyItem[]>([])

const editKeyDialogVisible = ref(false)
const editingKey = ref<UserApiKeyItem | null>(null)
const editKeyPlaintext = ref('')
const editKeySubmitting = ref(false)

function openEditKeyDialog(key: UserApiKeyItem) {
  editingKey.value = key
  editKeyPlaintext.value = key.apikey || ''
  editKeyDialogVisible.value = true
}

async function confirmEditKey() {
  if (!editingKey.value?.id) return
  editKeySubmitting.value = true
  try {
    // 1. 更新本地明文
    await updateApiKeyPlaintext(editingKey.value.id, editKeyPlaintext.value)
    ElMessage.success('API Key 修改成功')
    editKeyDialogVisible.value = false
    await reloadApiKeys()
  } catch {
    ElMessage.error('API Key 修改失败')
  } finally {
    editKeySubmitting.value = false
  }
}

async function addApiKeyRow() {
  if (!props.user) return
  submitting.value = true
  try {
    await addUserApiKey(props.user.id, {})
    ElMessage.success('API Key 创建成功')
    await reloadApiKeys()
  } catch {
    ElMessage.error('API Key 创建失败')
  } finally {
    submitting.value = false
  }
}

async function reloadApiKeys() {
  if (!props.user) return
  try {
    const res = await getUserApiKeys(props.user.id)
    localApiKeys.value = (res.data.data ?? []).map(k => ({ ...k }))
  } catch {
    localApiKeys.value = []
  }
}

watch(() => props.visible, async (val) => {
  if (val && props.user) {
    formRef.value?.resetFields()
    form.username = props.user.username
    form.password = ''
    form.email = props.user.email ?? ''
    form.phone = props.user.phone ?? ''
    form.userId = props.user.userId ?? ''
    form.accountId = props.user.accountId ?? ''
    form.accessKey = props.user.accessKey ?? ''
    form.securityKey = props.user.securityKey ?? ''
    form.role = props.user.role
    form.status = props.user.status

    await reloadApiKeys()
  } else if (!val) {
    form.username = ''
    form.password = ''
    form.email = ''
    form.phone = ''
    form.userId = ''
    form.accountId = ''
    form.accessKey = ''
    form.securityKey = ''
    form.role = 'USER'
    form.status = 1
    localApiKeys.value = []
    formRef.value?.resetFields()
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await updateUser({
      id: props.user!.id,
      username: form.username,
      password: form.password || undefined,
      email: form.email,
      phone: form.phone,
      userId: form.userId || undefined,
      accountId: form.accountId || undefined,
      accessKey: form.accessKey || undefined,
      securityKey: form.securityKey || undefined,
      role: form.role,
      status: form.status,
    })

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
          <el-form-item label="天翼云用户ID">
            <el-input v-model="form.userId" placeholder="天翼云 userId" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="天翼云账户ID">
            <el-input v-model="form.accountId" placeholder="天翼云 accountId" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Access Key">
            <el-input v-model="form.accessKey" placeholder="天翼云 AccessKey" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Security Key">
            <el-input v-model="form.securityKey" type="password" show-password placeholder="天翼云 SecurityKey" />
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
          <el-table-column label="明文" min-width="160">
            <template #default="{ row }">
              <template v-if="row.apikey && row.apikey.length > 40">
                <el-popover placement="top" :width="400" trigger="click">
                  <template #reference>
                    <span class="plaintext-link">{{ row.apikey.slice(0, 40) }}...</span>
                  </template>
                  <div class="plaintext-full">{{ row.apikey }}</div>
                </el-popover>
              </template>
              <span v-else>{{ row.apikey || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="密文" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span :title="row.secretKey">{{ (row.secretKey || '').slice(0, 30) + (row.secretKey && row.secretKey.length > 30 ? '...' : '') || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="150">
            <template #default="{ row }">
              {{ row.createTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openEditKeyDialog(row)">
                修改
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-key-row">
          <el-button type="primary" link :loading="submitting" @click="addApiKeyRow">+ 添加 API Key</el-button>
        </div>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>

  <!-- 编辑 API Key 明文弹窗 -->
  <el-dialog
    v-model="editKeyDialogVisible"
    title="编辑 API Key 明文"
    width="420px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form label-position="top" @submit.prevent="confirmEditKey">
      <el-form-item label="API Key 明文标识">
        <el-input
          v-model="editKeyPlaintext"
          placeholder="请输入 API Key 明文标识（如：生产环境 DeepSeek Key）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editKeyDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="editKeySubmitting" @click="confirmEditKey">保存</el-button>
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
