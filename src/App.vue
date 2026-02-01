<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 顶部工具栏 -->
    <div class="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
      <div class="font-semibold text-gray-800">树状结构可视化编辑器（Vue3 + G6）</div>
      <Toolbar
        :selected-id="selectedId"
        @add-child="onAddChild"
        @remove="onRemove"
        @import="onImport"
        @export="onExport"
        @reset="onReset"
      />
    </div>

    <!-- 主体 -->
    <div class="flex-1 flex overflow-hidden p-4 gap-4">
      <div class="flex-1 overflow-hidden">
        <GraphCanvas
          :data="treeData"
          :selected-id="selectedId"
          @select="(id) => (selectedId = id)"
        />
      </div>

      <div class="w-80 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <NodePanel :node="selectedNode" @update="onUpdateNode" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import GraphCanvas from '@/components/GraphCanvas.vue'
import Toolbar from '@/components/Toolbar.vue'
import NodePanel from '@/components/NodePanel.vue'

import type { TreeData, TreeNode } from '@/types/tree'
import { demoTree } from '@/data/demoTree'
import { addChild, cloneTree, findNode, generateId, removeNode, updateNode, validateTreeData } from '@/utils/tree'

const treeData = ref<TreeData>(cloneTree(demoTree))
const selectedId = ref<string | null>('root')

const selectedNode = computed<TreeNode | null>(() => {
  if (!selectedId.value) return null
  return findNode(treeData.value, selectedId.value)
})

function onUpdateNode(patch: Partial<TreeNode>) {
  if (!selectedId.value) return
  const ok = updateNode(treeData.value, selectedId.value, patch)
  if (!ok) message.warning('节点不存在或已被删除')
  // 触发 GraphCanvas watch（深度监听会捕捉到变更）
}

function onAddChild() {
  const pid = selectedId.value ?? 'root'
  const id = generateId('node')
  const child: TreeNode = { id, label: '新节点', desc: '' }
  const ok = addChild(treeData.value, pid, child)
  if (!ok) {
    message.error('新增失败：父节点不存在')
    return
  }
  selectedId.value = id
}

function onRemove() {
  if (!selectedId.value || selectedId.value === 'root') {
    message.info('根节点不允许删除')
    return
  }
  const id = selectedId.value

  Modal.confirm({
    title: '确认删除该节点及其子树？',
    content: '删除后不可恢复（可通过导出 JSON 备份）。',
    okText: '删除',
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk: () => {
      const ok = removeNode(treeData.value, id)
      if (!ok) {
        message.warning('删除失败：节点不存在或已被删除')
        return
      }
      selectedId.value = 'root'
    },
  })
}

function onExport() {
  const json = JSON.stringify(treeData.value, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `tree-${Date.now()}.json`
  a.click()

  URL.revokeObjectURL(url)
}

function onImport(text: string) {
  try {
    const obj = JSON.parse(text)
    if (!validateTreeData(obj)) {
      message.error('导入失败：JSON 结构不符合 TreeData（必须包含 id、label、children?）')
      return
    }
    treeData.value = cloneTree(obj)
    selectedId.value = obj.id
    message.success('导入成功')
  } catch (e) {
    message.error('导入失败：不是合法 JSON')
  }
}

function onReset() {
  // 简单重置：重新赋值一次，触发 Graph changeData + fitView
  treeData.value = cloneTree(treeData.value)
  message.success('已重置布局（重新适配视图）')
}
</script>
