<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createModel, updateModel } from '@/api/model'
import type { ModelItem } from '@/types/model'

const props = defineProps<{
  visible: boolean
  model: ModelItem | null
}>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const formRef = ref()
const submitting = ref(false)
const isEdit = ref(false)

const form = reactive({
  modelName: '',
  modelCode: '',
  description: '',
})

const rules = {
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelCode: [{ required: true, message: '请输入模型代码', trigger: 'blur' }],
}

watch(() => props.visible, (val) => {
  if (val) {
    isEdit.value = !!props.model
    // 先重置表单校验状态，再赋值，否则 resetFields 会清空已回显的数据
    formRef.value?.resetFields()
    if (props.model) {
      form.modelName = props.model.modelName
      form.modelCode = props.model.modelCode
      form.description = props.model.description ?? ''
    } else {
      form.modelName = ''
      form.modelCode = ''
      form.description = ''
    }
  } else {
    // 弹窗关闭后清空表单缓存，避免下次打开时残留数据
    form.modelName = ''
    form.modelCode = ''
    form.description = ''
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && props.model) {
      await updateModel({ id: props.model.id, ...form })
      ElMessage.success('模型更新成功')
    } else {
      await createModel(form)
      ElMessage.success('模型创建成功')
    }
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
    :title="isEdit ? '编辑模型' : '新增模型'"
    width="480px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="模型名称" prop="modelName">
        <el-input v-model="form.modelName" placeholder="请输入模型名称" />
      </el-form-item>
      <el-form-item label="模型代码" prop="modelCode">
        <el-input v-model="form.modelCode" placeholder="请输入模型代码" />
      </el-form-item>
      <el-form-item label="模型描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入模型描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
