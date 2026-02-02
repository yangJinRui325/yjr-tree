import type { LayoutType, LayoutDirection } from '@/types/tree'
import type { TreeGraphData } from '@antv/g6'

/**
 * 布局配置生成器
 * 对应论文第4章：G6图形渲染设计 - 树图布局算法
 * 对应论文第5章：图形刷新和布局更新
 */
export function getLayoutConfig(
  type: LayoutType = 'compactBox',
  direction: LayoutDirection = 'LR'
) {
  const baseConfig = {
    getId: (d: any) => d.id,
    getHeight: () => 40,
    getWidth: (d: any) => {
      // 根据节点标签长度动态计算宽度
      const label = d.label || ''
      return Math.max(120, Math.min(200, label.length * 12 + 40))
    },
    getVGap: () => 20, // 垂直间距
    getHGap: () => 60,  // 水平间距
  }

  switch (type) {
    case 'compactBox':
      return {
        type: 'compactBox',
        direction,
        ...baseConfig,
      }

    case 'dendrogram':
      return {
        type: 'dendrogram',
        direction,
        nodeSep: 50,  // 节点间距
        rankSep: 100, // 层级间距
        ...baseConfig,
      }

    case 'indented':
      return {
        type: 'indented',
        direction: 'LR',
        indent: 80,    // 缩进距离
        getSide: () => 'right',
        ...baseConfig,
      }

    case 'mindmap':
      return {
        type: 'mindmap',
        direction: 'H',
        getSubTreeSep: () => 20,
        getVGap: () => 10,
        getHGap: () => 50,
        ...baseConfig,
      }

    case 'compactBox-v':
      return {
        type: 'compactBox',
        direction: 'TB',
        ...baseConfig,
      }

    default:
      return {
        type: 'compactBox',
        direction,
        ...baseConfig,
      }
  }
}

/**
 * 获取布局的显示名称
 */
export function getLayoutName(type: LayoutType): string {
  const names: Record<LayoutType, string> = {
    compactBox: '紧凑盒状树（水平）',
    'compactBox-v': '紧凑盒状树（垂直）',
    dendrogram: '树状图',
    indented: '缩进树',
    mindmap: '思维导图',
  }
  return names[type] || type
}