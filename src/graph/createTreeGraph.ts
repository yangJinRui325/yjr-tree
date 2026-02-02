import G6 from '@antv/g6'
import type { TreeData, LayoutType } from '@/types/tree'
import { getLayoutConfig } from './layouts'
import { getNodeStyle, getNodeIcon, NODE_STATE_STYLES, DEFAULT_NODE_STYLE } from './styles'

/**
 * 图形创建选项
 * 对应论文第5章：图形渲染模块实现（G6 TreeGraph封装）
 */
export type CreateGraphOptions = {
  container: HTMLElement
  width: number
  height: number
  layoutType?: LayoutType
  onSelect?: (id: string | null) => void
  onNodeRightClick?: (id: string, x: number, y: number) => void
  onNodeHover?: (id: string | null) => void
}

/**
 * 注册自定义节点类型（带图标）
 * 对应论文第5章：节点样式和自定义节点渲染
 */
function registerCustomNode() {
  // 注册带图标的矩形节点
  G6.registerNode(
    'icon-rect',
    {
      draw(cfg: any, group: any) {
        const { style, icon, label } = cfg
        const { fill, stroke, lineWidth, radius, width, height } = style || DEFAULT_NODE_STYLE

        // 创建节点容器
        const container = group.addGroup()

        // 绘制矩形背景
        const rect = container.addShape('rect', {
          attrs: {
            x: -width / 2,
            y: -height / 2,
            width,
            height,
            fill,
            stroke,
            lineWidth,
            radius,
            cursor: 'pointer',
          },
          name: 'rect-shape',
        })

        // 添加图标
        if (icon && icon.text) {
          container.addShape('text', {
            attrs: {
              x: -width / 2 + 12,
              y: 0,
              text: icon.text,
              fontSize: 16,
              textAlign: 'left',
              textBaseline: 'middle',
            },
            name: 'icon-shape',
          })
        }

        // 添加标签文本
        const labelX = icon && icon.text ? -width / 2 + 32 : -width / 2 + 12
        container.addShape('text', {
          attrs: {
            x: labelX,
            y: 0,
            text: label || '',
            fontSize: 12,
            fill: '#262626',
            textAlign: 'left',
            textBaseline: 'middle',
          },
          name: 'label-shape',
        })

        return rect
      },
      setState(name: string, value: boolean, item: any) {
        const group = item.getContainer()
        const rect = group.find((e: any) => e.get('name') === 'rect-shape')
        if (!rect) return

        const model = item.getModel()
        const style = model.style || DEFAULT_NODE_STYLE

        if (name === 'selected' && value) {
          rect.attr(NODE_STATE_STYLES.selected)
        } else if (name === 'hover' && value) {
          rect.attr(NODE_STATE_STYLES.hover)
        } else {
          rect.attr({
            stroke: style.stroke || DEFAULT_NODE_STYLE.stroke,
            lineWidth: style.lineWidth || DEFAULT_NODE_STYLE.lineWidth,
            shadowColor: undefined,
            shadowBlur: undefined,
          })
        }
      },
    },
    'rect'
  )
}

/**
 * 创建树图实例
 * 对应论文第5章：图形渲染模块实现（G6 TreeGraph封装）
 */
export function createTreeGraph(opts: CreateGraphOptions) {
  const { container, width, height, layoutType = 'compactBox', onSelect, onNodeRightClick, onNodeHover } = opts

  // 注册自定义节点
  registerCustomNode()

  // 创建图形实例
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
      type: 'icon-rect',
      size: [DEFAULT_NODE_STYLE.width, DEFAULT_NODE_STYLE.height],
      style: {
        ...DEFAULT_NODE_STYLE,
      },
    },
    nodeStateStyles: NODE_STATE_STYLES,
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#BFBFBF',
        lineWidth: 1,
        endArrow: {
          path: G6.Arrow.triangle(6, 8, 0),
          fill: '#BFBFBF',
        },
      },
    },
    layout: getLayoutConfig(layoutType),
  })

  // 数据转换：将节点数据转换为 G6 需要的格式（包含样式和图标）
  function transformData(data: TreeData): any {
    const style = getNodeStyle(data)
    const icon = getNodeIcon(data)

    const result: any = {
      id: data.id,
      label: data.label,
      desc: data.desc,
      collapsed: data.collapsed,
      style,
      icon,
      extra: data.extra,
    }

    if (data.children && data.children.length > 0) {
      result.children = data.children.map(transformData)
    }

    return result
  }

  // 事件处理：节点点击选中
  graph.on('node:click', (ev: any) => {
    const item = ev.item
    if (!item) return
    const model = item.getModel()
    onSelect?.(model?.id ?? null)
  })

  // 事件处理：节点右键菜单
  graph.on('node:contextmenu', (ev: any) => {
    ev.preventDefault()
    const item = ev.item
    if (!item) return
    const model = item.getModel()
    
    // 获取节点在画布中的边界框（画布坐标系）
    const nodeBBox = item.getBBox()
    
    // 计算节点右边缘中心点的画布坐标
    const nodeRightX = nodeBBox.x + nodeBBox.width
    const nodeCenterY = nodeBBox.y + nodeBBox.height / 2
    
    // 使用 G6 的 getClientByPoint 方法将画布坐标转换为客户端坐标（相对于视口）
    // 这个方法会自动处理缩放和平移
    const clientPoint = graph.getClientByPoint(nodeRightX, nodeCenterY)
    
    // 菜单显示在节点右侧，添加一点偏移避免遮挡
    const pageX = clientPoint.x + 10
    const pageY = clientPoint.y
    
    onNodeRightClick?.(model?.id, pageX, pageY)
  })

  // 事件处理：节点悬停
  graph.on('node:mouseenter', (ev: any) => {
    const item = ev.item
    if (item) {
      graph.setItemState(item, 'hover', true)
      const model = item.getModel()
      onNodeHover?.(model?.id)
    }
  })

  graph.on('node:mouseleave', (ev: any) => {
    const item = ev.item
    if (item) {
      graph.setItemState(item, 'hover', false)
    }
    onNodeHover?.(null)
  })

  // 事件处理：点击画布空白取消选中
  graph.on('canvas:click', () => {
    graph.getNodes().forEach((n) => graph.clearItemStates(n, ['selected', 'hover']))
    onSelect?.(null)
  })

  /**
   * 渲染树图
   * 对应论文第5章：图形刷新和布局更新
   */
  function render(data: TreeData) {
    const transformedData = transformData(data)
    graph.data(transformedData)
    graph.render()
    graph.fitView(24)
  }

  /**
   * 更新数据并重新渲染
   */
  function changeData(data: TreeData) {
    const transformedData = transformData(data)
    graph.changeData(transformedData)
    graph.fitView(24)
  }

  /**
   * 设置选中节点
   */
  function setSelected(id: string | null) {
    graph.getNodes().forEach((n) => graph.clearItemStates(n, ['selected']))
    if (!id) return
    const item = graph.findById(id)
    if (item) graph.setItemState(item, 'selected', true)
  }

  /**
   * 更新布局
   */
  function updateLayout(layoutType: LayoutType) {
    graph.updateLayout(getLayoutConfig(layoutType))
    graph.fitView(24)
  }

  /**
   * 调整画布大小
   */
  function resize(w: number, h: number) {
    graph.changeSize(w, h)
  }

  /**
   * 缩放控制
   */
  function zoom(ratio: number) {
    graph.zoom(ratio)
  }

  function zoomTo(ratio: number) {
    graph.zoomTo(ratio)
  }

  function fitView(padding?: number) {
    graph.fitView(padding)
  }

  /**
   * 销毁图形实例
   */
  function destroy() {
    graph.destroy()
  }

  return {
    graph,
    render,
    changeData,
    setSelected,
    updateLayout,
    resize,
    zoom,
    zoomTo,
    fitView,
    destroy,
  }
}
