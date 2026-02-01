<template>
  <div ref="wrapRef" class="h-full w-full">
    <div ref="containerRef" class="h-full w-full bg-white rounded-lg border border-gray-200"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TreeData } from '@/types/tree'
import { createTreeGraph } from '@/graph/createTreeGraph'

const props = defineProps<{
  data: TreeData
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
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
    onSelect: (id) => emit('select', id),
  })

  api.render(toPlain(props.data))

  ro = new ResizeObserver(() => {
    if (!wrapRef.value || !api) return
    const s = getSize(wrapRef.value)
    api.resize(s.width, s.height)
    api.graph.fitView(24)
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

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  api?.destroy()
  api = null
})
</script>
