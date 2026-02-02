/**
 * 节点样式配置
 */
export type NodeStyle = {
  /** 节点背景颜色 */
  fill?: string
  /** 节点边框颜色 */
  stroke?: string
  /** 节点边框宽度 */
  lineWidth?: number
  /** 节点圆角 */
  radius?: number
  /** 节点宽度 */
  width?: number
  /** 节点高度 */
  height?: number
}

/**
 * 节点图标类型
 */
export type NodeIcon = 'folder' | 'file' | 'user' | 'team' | 'setting' | 'none'

/**
 * 树节点数据结构
 * 对应论文第4章：数据结构设计
 */
export type TreeNode = {
  /** 节点唯一标识 */
  id: string
  /** 节点显示名称 */
  label: string
  /** 节点描述信息 */
  desc?: string
  /** 子节点列表 */
  children?: TreeNode[]
  /** 节点是否折叠（用于展开/收起功能） */
  collapsed?: boolean
  /** 节点样式配置 */
  style?: NodeStyle
  /** 节点图标类型 */
  icon?: NodeIcon
  /** 节点扩展属性（用于存储其他自定义数据） */
  extra?: Record<string, any>
}

/**
 * 树数据根节点类型
 */
export type TreeData = TreeNode

/**
 * 布局算法类型
 * 对应论文第4章：G6图形渲染设计 - 树图布局算法
 */
export type LayoutType = 
  | 'compactBox'      // 紧凑盒状树布局
  | 'dendrogram'      // 树状图布局
  | 'indented'        // 缩进树布局
  | 'mindmap'         // 思维导图布局
  | 'compactBox-v'    // 垂直紧凑盒状树布局

/**
 * 布局方向
 */
export type LayoutDirection = 'LR' | 'RL' | 'TB' | 'BT' | 'H' | 'V'
