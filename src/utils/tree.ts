import type { TreeData, TreeNode } from '@/types/tree'

export function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root
  const children = root.children ?? []
  for (const c of children) {
    const hit = findNode(c, id)
    if (hit) return hit
  }
  return null
}

/**
 * 查找节点的父节点
 * 返回：父节点，如果找不到或节点是根节点则返回 null
 */
export function findParent(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return null // 根节点没有父节点
  const children = root.children ?? []
  // 检查直接子节点
  if (children.some((c) => c.id === id)) {
    return root
  }
  // 递归查找
  for (const c of children) {
    const parent = findParent(c, id)
    if (parent) return parent
  }
  return null
}

export function updateNode(root: TreeNode, id: string, patch: Partial<TreeNode>): boolean {
  const node = findNode(root, id)
  if (!node) return false
  Object.assign(node, patch)
  return true
}

/**
 * 删除 id 对应节点（连同子树）
 * 返回：是否删除成功
 */
export function removeNode(root: TreeNode, id: string): boolean {
  if (!root.children?.length) return false
  const idx = root.children.findIndex((c) => c.id === id)
  if (idx >= 0) {
    root.children.splice(idx, 1)
    return true
  }
  for (const c of root.children) {
    if (removeNode(c, id)) return true
  }
  return false
}

export function addChild(root: TreeNode, parentId: string, child: TreeNode): boolean {
  const parent = findNode(root, parentId)
  if (!parent) return false
  if (!parent.children) parent.children = []
  parent.children.push(child)
  return true
}

export function generateId(prefix = 'n'): string {
  // 足够用于毕设：时间戳 + 随机数
  const r = Math.random().toString(16).slice(2, 8)
  return `${prefix}-${Date.now().toString(16)}-${r}`
}

export function cloneTree<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export function validateTreeData(data: any): data is TreeData {
  if (!data || typeof data !== 'object') return false
  if (typeof data.id !== 'string' || typeof data.label !== 'string') return false
  if (data.children != null) {
    if (!Array.isArray(data.children)) return false
    return data.children.every(validateTreeData)
  }
  return true
}
