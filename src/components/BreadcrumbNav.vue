<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const items: { title: string; path?: string }[] = []
  const matched = route.matched

  for (const record of matched) {
    const title = record.meta.title as string | undefined
    if (title) {
      items.push({ title, path: record.path || undefined })
    }
  }
  return items
})
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span v-if="index === breadcrumbs.length - 1">{{ item.title }}</span>
      <router-link v-else :to="item.path || '/'">{{ item.title }}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.el-breadcrumb {
  padding: 4px 0 12px;
}

.el-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #4a3b34;
  font-weight: 500;
}

.el-breadcrumb :deep(.el-breadcrumb__inner) {
  color: #9b8a78;
  transition: color 0.2s;
}

.el-breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: #c68b5e;
}

.el-breadcrumb :deep(.el-breadcrumb__separator) {
  color: #c4b5a0;
}
</style>
