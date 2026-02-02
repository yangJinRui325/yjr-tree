<template>
  <div
    v-if="visible"
    ref="menuRef"
    class="context-menu"
    :style="{ left: `${x}px`, top: `${y}px` }"
    @click.stop
  >
    <div class="menu-item" @click="handleCopy">
      <span>📋 复制节点</span>
    </div>
    <div class="menu-item" @click="handlePaste" :class="{ disabled: !hasClipboard }">
      <span>📄 粘贴节点</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" @click="handleAddChild">
      <span>➕ 添加子节点</span>
    </div>
    <div class="menu-item" @click="handleAddSibling" :class="{ disabled: nodeId === 'root' }">
      <span>➕ 添加兄弟节点</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item danger" @click="handleDelete" :class="{ disabled: nodeId === 'root' }">
      <span>🗑️ 删除节点</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  nodeId: string
  hasClipboard: boolean
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'paste'): void
  (e: 'add-child'): void
  (e: 'add-sibling'): void
  (e: 'delete'): void
  (e: 'close'): void
}>()

const menuRef = ref<HTMLElement | null>(null)

function handleCopy() {
  emit('copy')
  emit('close')
}

function handlePaste() {
  if (!props.hasClipboard) return
  emit('paste')
  emit('close')
}

function handleAddChild() {
  emit('add-child')
  emit('close')
}

function handleAddSibling() {
  if (props.nodeId === 'root') return
  emit('add-sibling')
  emit('close')
}

function handleDelete() {
  if (props.nodeId === 'root') return
  emit('delete')
  emit('close')
}

// 点击外部关闭菜单
function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 160px;
  z-index: 1000;
  font-size: 14px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover:not(.disabled) {
  background-color: #f5f5f5;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.danger {
  color: #ff4d4f;
}

.menu-item.danger:hover:not(.disabled) {
  background-color: #fff1f0;
}

.menu-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}
</style>