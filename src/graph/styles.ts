import type { TreeNode, NodeStyle, NodeIcon } from '@/types/tree'

/**
 * 节点样式配置
 * 对应论文第5章：节点样式和自定义节点渲染
 */
export const DEFAULT_NODE_STYLE: Required<NodeStyle> = {
  fill: '#FFFFFF',
  stroke: '#D9D9D9',
  lineWidth: 1,
  radius: 6,
  width: 140,
  height: 40,
}

/**
 * 根据节点数据生成节点样式配置
 */
export function getNodeStyle(node: TreeNode): Required<NodeStyle> {
  const style = node.style || {}
  return {
    fill: style.fill ?? DEFAULT_NODE_STYLE.fill,
    stroke: style.stroke ?? DEFAULT_NODE_STYLE.stroke,
    lineWidth: style.lineWidth ?? DEFAULT_NODE_STYLE.lineWidth,
    radius: style.radius ?? DEFAULT_NODE_STYLE.radius,
    width: style.width ?? DEFAULT_NODE_STYLE.width,
    height: style.height ?? DEFAULT_NODE_STYLE.height,
  }
}

/**
 * 图标配置映射
 */
export const ICON_CONFIG: Record<NodeIcon, { text: string; color: string }> = {
  folder: { text: '📁', color: '#1890FF' },
  file: { text: '📄', color: '#52C41A' },
  user: { text: '👤', color: '#722ED1' },
  team: { text: '👥', color: '#FA8C16' },
  setting: { text: '⚙️', color: '#EB2F96' },
  none: { text: '', color: '#000000' },
}

/**
 * 获取节点图标
 */
export function getNodeIcon(node: TreeNode): { text: string; color: string } {
  const iconType = node.icon || 'none'
  return ICON_CONFIG[iconType] || ICON_CONFIG.none
}

/**
 * 节点状态样式配置
 */
export const NODE_STATE_STYLES = {
  selected: {
    stroke: '#1677FF',
    lineWidth: 2,
    shadowColor: '#1677FF',
    shadowBlur: 8,
  },
  hover: {
    stroke: '#40A9FF',
    lineWidth: 1.5,
    shadowColor: '#40A9FF',
    shadowBlur: 4,
  },
  collapsed: {
    fill: '#F5F5F5',
    stroke: '#BFBFBF',
  },
}