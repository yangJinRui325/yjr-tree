<template>
  <div class="h-full w-full p-4 overflow-auto">
    <div class="text-sm font-medium text-gray-900 mb-4">节点编辑</div>

    <div v-if="!node" class="text-gray-500 text-sm text-center py-8">
      请在画布中选择一个节点
    </div>

    <a-form v-else layout="vertical" :model="form">
      <!-- 基本信息 -->
      <a-divider orientation="left" style="margin: 16px 0 12px 0; font-size: 12px">基本信息</a-divider>

      <a-form-item label="ID">
        <a-input :value="node.id" disabled />
      </a-form-item>

      <a-form-item label="名称 label">
        <a-input
          v-model:value="form.label"
          @change="commit"
          placeholder="请输入节点名称"
          :maxlength="50"
          show-count
        />
      </a-form-item>

      <a-form-item label="描述 desc">
        <a-textarea
          v-model:value="form.desc"
          :rows="3"
          @change="commit"
          placeholder="可选，输入节点描述信息"
          :maxlength="200"
          show-count
        />
      </a-form-item>

      <!-- 样式设置 -->
      <a-divider orientation="left" style="margin: 16px 0 12px 0; font-size: 12px">样式设置</a-divider>

      <a-form-item label="图标类型">
        <a-select v-model:value="form.icon" @change="commit" placeholder="选择图标">
          <a-select-option value="none">无图标</a-select-option>
          <a-select-option value="folder">📁 文件夹</a-select-option>
          <a-select-option value="file">📄 文件</a-select-option>
          <a-select-option value="user">👤 用户</a-select-option>
          <a-select-option value="team">👥 团队</a-select-option>
          <a-select-option value="setting">⚙️ 设置</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="背景颜色">
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="form.style?.fill || '#FFFFFF'"
            @change="handleColorChange('fill', $event)"
            class="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <a-input
            :value="form.style?.fill || '#FFFFFF'"
            @change="handleStyleChange('fill', $event.target.value)"
            placeholder="#FFFFFF"
            style="flex: 1"
          />
        </div>
      </a-form-item>

      <a-form-item label="边框颜色">
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="form.style?.stroke || '#D9D9D9'"
            @change="handleColorChange('stroke', $event)"
            class="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <a-input
            :value="form.style?.stroke || '#D9D9D9'"
            @change="handleStyleChange('stroke', $event.target.value)"
            placeholder="#D9D9D9"
            style="flex: 1"
          />
        </div>
      </a-form-item>

      <a-form-item label="边框宽度">
        <a-slider
          :value="form.style?.lineWidth || 1"
          :min="1"
          :max="5"
          @change="handleStyleChange('lineWidth', $event)"
        />
      </a-form-item>

      <a-form-item label="圆角">
        <a-slider
          :value="form.style?.radius || 6"
          :min="0"
          :max="20"
          @change="handleStyleChange('radius', $event)"
        />
      </a-form-item>

      <a-form-item label="节点宽度">
        <a-input-number
          :value="form.style?.width || 140"
          :min="80"
          :max="300"
          @change="handleStyleChange('width', $event)"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="节点高度">
        <a-input-number
          :value="form.style?.height || 40"
          :min="30"
          :max="100"
          @change="handleStyleChange('height', $event)"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { TreeNode, NodeStyle, NodeIcon } from '@/types/tree'

const props = defineProps<{
  node: TreeNode | null
}>()

const emit = defineEmits<{
  (e: 'update', patch: Partial<TreeNode>): void
}>()

const form = reactive<{
  label: string
  desc?: string
  icon?: NodeIcon
  style?: NodeStyle
}>({
  label: '',
  desc: '',
  icon: 'none',
  style: {},
})

watch(
  () => props.node,
  (n) => {
    if (!n) return
    form.label = n?.label ?? ''
    form.desc = n?.desc ?? ''
    form.icon = n?.icon ?? 'none'
    form.style = { ...(n?.style || {}) }
  },
  { immediate: true },
)

function commit() {
  emit('update', {
    label: form.label,
    desc: form.desc,
    icon: form.icon,
    style: form.style,
  })
}

function handleColorChange(key: 'fill' | 'stroke', event: Event) {
  const target = event.target as HTMLInputElement
  handleStyleChange(key, target.value)
}

function handleStyleChange(key: keyof NodeStyle, value: any) {
  if (!form.style) {
    form.style = {}
  }
  form.style[key] = value
  commit()
}
</script>
