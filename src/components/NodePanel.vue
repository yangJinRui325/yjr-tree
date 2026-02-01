<template>
  <div class="h-full w-full p-4">
    <div class="text-sm font-medium text-gray-700 mb-3">节点属性</div>

    <div v-if="!node" class="text-gray-500 text-sm">
      请在画布中选择一个节点
    </div>

    <a-form v-else layout="vertical">
      <a-form-item label="ID">
        <a-input :value="node.id" disabled />
      </a-form-item>

      <a-form-item label="名称 label">
        <a-input v-model:value="form.label" @change="commit" placeholder="请输入节点名称" />
      </a-form-item>

      <a-form-item label="描述 desc">
        <a-textarea v-model:value="form.desc" :rows="4" @change="commit" placeholder="可选" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { TreeNode } from '@/types/tree'

const props = defineProps<{
  node: TreeNode | null
}>()

const emit = defineEmits<{
  (e: 'update', patch: Partial<TreeNode>): void
}>()

const form = reactive<{ label: string; desc?: string }>({
  label: '',
  desc: '',
})

watch(
  () => props.node,
  (n) => {
    form.label = n?.label ?? ''
    form.desc = n?.desc ?? ''
  },
  { immediate: true },
)

function commit() {
  emit('update', { label: form.label, desc: form.desc })
}
</script>
