<template>
  <a-layout class="h-full bg-gray-50 flex">
    <!-- 顶部标题栏 -->
    <a-layout-header
      class="!h-14 !leading-[56px] !px-6 !bg-white border-b border-gray-200 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="text-[16px] font-semibold text-gray-900">
          杨锦瑞 · 可视化编辑树 · 毕业设计
        </div>
        <span class="text-xs text-gray-500">Vue3 · G6 · Ant Design Vue</span>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-xs text-gray-500">
          当前选中：<span class="text-gray-800">{{ selectedId ?? '无' }}</span>
        </div>
        <a-divider type="vertical" style="height: 20px" />
        <div class="text-xs text-gray-500">
          布局：<a-select
            v-model:value="layoutType"
            size="small"
            style="width: 140px"
            @change="onLayoutChange"
          >
            <a-select-option value="compactBox">紧凑盒状树（水平）</a-select-option>
            <a-select-option value="compactBox-v">紧凑盒状树（垂直）</a-select-option>
            <a-select-option value="dendrogram">树状图</a-select-option>
            <a-select-option value="indented">缩进树</a-select-option>
            <a-select-option value="mindmap">思维导图</a-select-option>
          </a-select>
        </div>
      </div>
    </a-layout-header>

    <!-- 关键：这一层必须 flex-1 + min-h-0，否则 Content 高度会塌 -->
    <a-layout class="flex-1 min-h-0">
      <!-- 左侧画布区域 -->
      <a-layout-content class="p-4 min-h-0">
        <!-- 关键：让内部容器真正占满 -->
        <div class="h-full min-h-0 rounded-xl border border-gray-200 bg-white overflow-hidden relative">
          <!-- 画布顶部工具栏 -->
          <div class="h-11 px-4 flex items-center justify-between border-b border-gray-100 bg-white">
            <div class="text-sm font-medium text-gray-800">画布</div>
            <div class="flex items-center gap-2">
              <a-button-group size="small">
                <a-button @click="onZoomOut" title="缩小">
                  <template #icon><span>🔍-</span></template>
                </a-button>
                <a-button @click="onZoomReset" title="重置缩放">
                  <template #icon><span>🔍</span></template>
                </a-button>
                <a-button @click="onZoomIn" title="放大">
                  <template #icon><span>🔍+</span></template>
                </a-button>
                <a-button @click="onFitView" title="适应画布">
                  <template #icon><span>📐</span></template>
                </a-button>
              </a-button-group>
              <span class="text-xs text-gray-500 ml-2">拖拽画布 / 滚轮缩放 / 点击节点选中 / 右键菜单</span>
            </div>
          </div>

          <!-- 关键：GraphCanvas 外层必须是 flex-1 且 min-h-0 -->
          <div class="h-[calc(100%-44px)] min-h-0 p-3 relative">
            <GraphCanvas
              ref="canvasRef"
              :data="treeData"
              :selected-id="selectedId"
              :layout-type="layoutType"
              @select="(id: string | null) => (selectedId = id)"
              @node-right-click="onNodeRightClick"
              @node-hover="onNodeHover"
            />
            <!-- 右键菜单 -->
            <ContextMenu
              :visible="contextMenu.visible"
              :x="contextMenu.x"
              :y="contextMenu.y"
              :node-id="contextMenu.nodeId"
              :has-clipboard="!!clipboardNode"
              @copy="onCopy"
              @paste="onPaste"
              @add-child="onAddChild"
              @add-sibling="onAddSibling"
              @delete="onRemove"
              @close="closeContextMenu"
            />
          </div>
        </div>
      </a-layout-content>

      <!-- 右侧侧边栏 -->
      <a-layout-sider
        width="360"
        class="!bg-white border-l border-gray-200"
      >
        <div class="h-full flex flex-col">
          <!-- 快捷操作 -->
          <div class="p-4 border-b border-gray-200">
            <div class="text-sm font-medium text-gray-900 mb-3">快捷操作</div>

            <div class="grid grid-cols-2 gap-2">
              <a-button type="primary" @click="onAddChild">新增子节点</a-button>
              <a-button danger :disabled="!selectedId || selectedId === 'root'" @click="onRemove">
                删除节点
              </a-button>

              <a-upload :before-upload="beforeUpload" :show-upload-list="false" accept="application/json">
                <a-button class="w-full">导入 JSON</a-button>
              </a-upload>
              <a-button class="w-full" @click="onExport">导出 JSON</a-button>

              <a-button class="col-span-2" @click="onReset">重置布局</a-button>
            </div>
          </div>

          <!-- 属性面板 -->
          <div class="flex-1 min-h-0 overflow-auto">
            <NodePanel :node="selectedNode" @update="onUpdateNode" />
          </div>
        </div>
      </a-layout-sider>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import GraphCanvas from '@/components/GraphCanvas.vue'
import NodePanel from '@/components/NodePanel.vue'
import ContextMenu from '@/components/ContextMenu.vue'

import type { TreeData, TreeNode, LayoutType } from '@/types/tree'
import { demoTree } from '@/data/demoTree'
import {
  addChild,
  cloneTree,
  findNode,
  findParent,
  generateId,
  removeNode,
  updateNode,
  validateTreeData,
} from '@/utils/tree'

const treeData = ref<TreeData>(cloneTree(demoTree))
const selectedId = ref<string | null>('root')
const layoutType = ref<LayoutType>('compactBox')
const canvasRef = ref<InstanceType<typeof GraphCanvas> | null>(null)

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  nodeId: '',
})

// 剪贴板（用于复制粘贴）
const clipboardNode = ref<TreeNode | null>(null)

const selectedNode = computed<TreeNode | null>(() => {
  if (!selectedId.value) return null
  return findNode(treeData.value, selectedId.value)
})

// 布局切换
function onLayoutChange() {
  // 布局切换由 GraphCanvas 组件内部处理
  message.success('布局已切换')
}

// 缩放控制
function onZoomIn() {
  canvasRef.value?.zoom(1.2)
}

function onZoomOut() {
  canvasRef.value?.zoom(0.8)
}

function onZoomReset() {
  canvasRef.value?.zoomTo(1)
}

function onFitView() {
  canvasRef.value?.fitView(24)
}

// 节点更新
function onUpdateNode(patch: Partial<TreeNode>) {
  if (!selectedId.value) return
  const ok = updateNode(treeData.value, selectedId.value, patch)
  if (!ok) message.warning('节点不存在或已被删除')
}

// 添加子节点
function onAddChild() {
  const pid = selectedId.value ?? 'root'
  const id = generateId('node')
  const child: TreeNode = { id, label: '新节点', desc: '' }
  const ok = addChild(treeData.value, pid, child)
  if (!ok) return message.error('新增失败：父节点不存在')
  selectedId.value = id
  message.success('已添加子节点')
}

// 添加兄弟节点
function onAddSibling() {
  if (!selectedId.value || selectedId.value === 'root') return
  const parent = findParent(treeData.value, selectedId.value)
  if (!parent) return message.error('找不到父节点')
  const id = generateId('node')
  const sibling: TreeNode = { id, label: '新节点', desc: '' }
  const ok = addChild(treeData.value, parent.id, sibling)
  if (!ok) return message.error('新增失败')
  selectedId.value = id
  message.success('已添加兄弟节点')
}

// 删除节点
function onRemove() {
  if (!selectedId.value || selectedId.value === 'root') return
  const id = selectedId.value
  Modal.confirm({
    title: '确认删除该节点及其子树？',
    okText: '删除',
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk: () => {
      const ok = removeNode(treeData.value, id)
      if (!ok) return message.warning('删除失败：节点不存在或已被删除')
      selectedId.value = 'root'
      message.success('已删除节点')
    },
  })
}

// 复制节点
function onCopy() {
  if (!selectedId.value) return
  const node = findNode(treeData.value, selectedId.value)
  if (!node) return
  // 深拷贝节点（不包含 children，只复制当前节点）
  clipboardNode.value = {
    ...node,
    children: undefined, // 复制时不包含子节点
  }
  message.success('已复制节点')
}

// 粘贴节点
function onPaste() {
  if (!clipboardNode.value || !selectedId.value) return
  const pid = selectedId.value
  const id = generateId('node')
  const newNode: TreeNode = {
    ...cloneTree(clipboardNode.value),
    id, // 生成新ID
  }
  const ok = addChild(treeData.value, pid, newNode)
  if (!ok) return message.error('粘贴失败：父节点不存在')
  selectedId.value = id
  message.success('已粘贴节点')
}

// 右键菜单
function onNodeRightClick(id: string, x: number, y: number) {
  contextMenu.value = {
    visible: true,
    x,
    y,
    nodeId: id,
  }
  selectedId.value = id
}

function closeContextMenu() {
  contextMenu.value.visible = false
}

// 节点悬停
function onNodeHover(_id: string | null) {
  // 可以在这里添加悬停提示等功能
}

// 导出 JSON
function onExport() {
  const json = JSON.stringify(treeData.value, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tree-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.success('已导出 JSON')
}

// 导入 JSON
function beforeUpload(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result ?? '')
    try {
      const obj = JSON.parse(text)
      if (!validateTreeData(obj)) return message.error('导入失败：JSON 结构不合法')
      treeData.value = cloneTree(obj)
      selectedId.value = obj.id
      message.success('导入成功')
    } catch {
      message.error('导入失败：不是合法 JSON')
    }
  }
  reader.onerror = () => message.error('读取文件失败')
  reader.readAsText(file)
  return false
}

// 重置布局
function onReset() {
  treeData.value = cloneTree(treeData.value)
  message.success('已重置布局')
}
</script>
