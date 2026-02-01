<template>
  <a-space>
    <a-button type="primary" @click="$emit('add-child')">新增子节点</a-button>
    <a-button danger :disabled="!selectedId" @click="$emit('remove')">删除节点</a-button>

    <a-divider type="vertical" />

    <a-upload :before-upload="beforeUpload" :show-upload-list="false" accept="application/json">
      <a-button>导入 JSON</a-button>
    </a-upload>

    <a-button @click="$emit('export')">导出 JSON</a-button>
    <a-button @click="$emit('reset')">重置布局</a-button>
  </a-space>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

defineProps<{ selectedId: string | null }>()

const emit = defineEmits<{
  (e: 'add-child'): void
  (e: 'remove'): void
  (e: 'import', jsonText: string): void
  (e: 'export'): void
  (e: 'reset'): void
}>()

function beforeUpload(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result ?? '')
    emit('import', text)
  }
  reader.onerror = () => message.error('读取文件失败')
  reader.readAsText(file)
  // 阻止 antd 真正上传
  return false
}
</script>
