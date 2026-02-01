import G6 from '@antv/g6'
import type { TreeData } from '@/types/tree'

export type CreateGraphOptions = {
  container: HTMLElement
  width: number
  height: number
  onSelect?: (id: string | null) => void
}

export function createTreeGraph(opts: CreateGraphOptions) {
  const { container, width, height, onSelect } = opts

  const graph = new G6.TreeGraph({
    container,
    width,
    height,
    linkCenter: true,
    modes: {
      default: [
        'drag-canvas',
        'zoom-canvas',
        'click-select',
        {
          type: 'collapse-expand',
          onChange: (item: any, collapsed: boolean) => {
            const data = item.getModel()
            data.collapsed = collapsed
            return true
          },
        },
      ],
    },
    defaultNode: {
      type: 'rect',
      size: [140, 36],
      style: {
        radius: 6,
        stroke: '#D9D9D9',
        fill: '#FFFFFF',
        lineWidth: 1,
      },
      labelCfg: {
        style: {
          fill: '#262626',
          fontSize: 12,
        },
      },
    },
    nodeStateStyles: {
      selected: {
        stroke: '#1677FF',
        lineWidth: 2,
        shadowColor: '#1677FF',
        shadowBlur: 8,
      },
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#BFBFBF',
      },
    },
    layout: {
      type: 'compactBox',
      direction: 'LR',
      getId: (d: any) => d.id,
      getHeight: () => 36,
      getWidth: () => 140,
      getVGap: () => 18,
      getHGap: () => 60,
    },
  })

  // 选中联动
  graph.on('node:click', (ev: any) => {
    const item = ev.item
    if (!item) return
    const model = item.getModel()
    onSelect?.(model?.id ?? null)
  })

  // 点击空白取消选中
  graph.on('canvas:click', () => {
    graph.getNodes().forEach((n) => graph.clearItemStates(n, ['selected']))
    onSelect?.(null)
  })

  function render(data: TreeData) {
    graph.data(data)
    graph.render()
    graph.fitView(24)
  }

  function changeData(data: TreeData) {
    graph.changeData(data)
    graph.fitView(24)
  }

  function setSelected(id: string | null) {
    graph.getNodes().forEach((n) => graph.clearItemStates(n, ['selected']))
    if (!id) return
    const item = graph.findById(id)
    if (item) graph.setItemState(item, 'selected', true)
  }

  function resize(w: number, h: number) {
    graph.changeSize(w, h)
  }

  function destroy() {
    graph.destroy()
  }

  return { graph, render, changeData, setSelected, resize, destroy }
}
