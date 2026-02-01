import type { TreeData } from '@/types/tree'

export const demoTree: TreeData = {
  id: 'root',
  label: '根节点',
  desc: '这是树的根节点',
  children: [
    {
      id: 'n1',
      label: '一级节点 A',
      desc: 'A 的描述',
      children: [
        { id: 'n1-1', label: '二级节点 A-1' },
        { id: 'n1-2', label: '二级节点 A-2' },
      ],
    },
    {
      id: 'n2',
      label: '一级节点 B',
      desc: 'B 的描述',
      children: [{ id: 'n2-1', label: '二级节点 B-1' }],
    },
  ],
}
