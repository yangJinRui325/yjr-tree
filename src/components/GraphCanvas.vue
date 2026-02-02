<template>
  <div ref="wrapRef" class="h-full w-full relative">
    <div ref="containerRef" class="h-full w-full bg-white rounded-lg border border-gray-200"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TreeData, LayoutType } from '@/types/tree'
import { createTreeGraph } from '@/graph/createTreeGraph'

const props = defineProps<{
  data: TreeData
  selectedId: string | null
  layoutType?: LayoutType
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'node-right-click', id: string, x: number, y: number): void
  (e: 'node-hover', id: string | null): void
}>()

const wrapRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

let api: ReturnType<typeof createTreeGraph> | null = null

function getSize(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return { width: Math.max(100, rect.width), height: Math.max(100, rect.height) }
}

/** 关键：把响应式数据转为纯对象，避免 G6 改动触发 Vue deep watch 死循环 */
function toPlain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

let ro: ResizeObserver | null = null

onMounted(() => {
  if (!wrapRef.value || !containerRef.value) return
  const { width, height } = getSize(wrapRef.value)

  api = createTreeGraph({
    container: containerRef.value,
    width,
    height,
    layoutType: props.layoutType,
    onSelect: (id) => emit('select', id),
    onNodeRightClick: (id, x, y) => emit('node-right-click', id, x, y),
    onNodeHover: (id) => emit('node-hover', id),
  })

  api.render(toPlain(props.data))

  ro = new ResizeObserver(() => {
    if (!wrapRef.value || !api) return
    const s = getSize(wrapRef.value)
    api.resize(s.width, s.height)
    api.fitView(24)
  })
  ro.observe(wrapRef.value)
})

watch(
  () => props.data,
  (d) => {
    if (!api) return
    api.changeData(toPlain(d))
  },
  { deep: true },
)

watch(
  () => props.selectedId,
  (id) => {
    if (!api) return
    api.setSelected(id)
  },
)

watch(
  () => props.layoutType,
  (layoutType) => {
    if (!api || !layoutType) return
    api.updateLayout(layoutType)
  },
)

// 暴露方法供父组件调用
defineExpose({
  zoom: (ratio: number) => api?.zoom(ratio),
  zoomTo: (ratio: number) => api?.zoomTo(ratio),
  fitView: (padding?: number) => api?.fitView(padding),
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  api?.destroy()
  api = null
})
</script>
