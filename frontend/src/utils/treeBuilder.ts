// src/utils/treeBuilder.ts
import type { OrgEntity, OrgRelation, TreeNode, TreeType } from '@/types'
import dayjs from 'dayjs'

/**
 * 根据指定日期和树类型构建树结构
 */
export function buildTree(
  entities: OrgEntity[],
  relations: OrgRelation[],
  treeType: TreeType,
  targetDate: string
): TreeNode[] {
  // 1. 筛选出目标日期有效的关系
  const validRelations = relations.filter(r =>
    r.treeType === treeType &&
    dayjs(targetDate).isBetween(r.effectiveDate, r.expiryDate, 'day', '[]')
  )

  // 2. 构建 id -> entity 映射
  const entityMap = new Map<string, OrgEntity>()
  entities.forEach(e => entityMap.set(e.id, e))

  // 3. 构建 childId -> parentId 映射
  const parentMap = new Map<string, string | null>()
  const childrenMap = new Map<string, string[]>()

  validRelations.forEach(r => {
    parentMap.set(r.childId, r.parentId)

    if (r.parentId) {
      if (!childrenMap.has(r.parentId)) {
        childrenMap.set(r.parentId, [])
      }
      childrenMap.get(r.parentId)!.push(r.childId)
    }
  })

  // 4. 递归构建树节点
  function buildNode(entityId: string): TreeNode | null {
    const entity = entityMap.get(entityId)
    if (!entity) return null

    const relation = validRelations.find(r => r.childId === entityId)
    if (!relation) return null

    const node: TreeNode = {
      id: entity.id,
      label: entity.orgName,
      orgCode: entity.orgCode,
      levelNum: relation.levelNum,
      entity,
      children: []
    }

    // 递归构建子节点
    const childIds = childrenMap.get(entityId) || []
    node.children = childIds
      .map(buildNode)
      .filter(n => n !== null) as TreeNode[]

    return node
  }

  // 5. 找到根节点(parentId为null)
  const rootIds = validRelations
    .filter(r => r.parentId === null)
    .map(r => r.childId)

  return rootIds
    .map(buildNode)
    .filter(n => n !== null) as TreeNode[]
}

/**
 * 搜索树中的节点
 */
export function searchTree(
  nodes: TreeNode[],
  keyword: string
): TreeNode | null {
  for (const node of nodes) {
    if (
      node.label.includes(keyword) ||
      node.orgCode.toLowerCase().includes(keyword.toLowerCase())
    ) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = searchTree(node.children, keyword)
      if (found) return found
    }
  }
  return null
}

/**
 * 获取节点的祖先路径
 */
export function getAncestorPath(
  nodeId: string,
  relations: OrgRelation[],
  entities: OrgEntity[],
  treeType: TreeType,
  targetDate: string
): OrgEntity[] {
  const path: OrgEntity[] = []
  const entityMap = new Map<string, OrgEntity>()
  entities.forEach(e => entityMap.set(e.id, e))

  const validRelations = relations.filter(r =>
    r.treeType === treeType &&
    dayjs(targetDate).isBetween(r.effectiveDate, r.expiryDate, 'day', '[]')
  )

  let currentId: string | null = nodeId
  while (currentId) {
    const entity = entityMap.get(currentId)
    if (entity) {
      path.unshift(entity)
    }

    const relation = validRelations.find(r => r.childId === currentId)
    currentId = relation?.parentId || null
  }

  return path
}

/**
 * 展平树结构为数组
 */
export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []

  function traverse(node: TreeNode) {
    result.push(node)
    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  nodes.forEach(traverse)
  return result
}