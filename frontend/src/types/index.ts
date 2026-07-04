// src/types/index.ts

/** 组织实体 */
export interface OrgEntity {
  id: string
  orgCode: string
  orgName: string
  orgType: string // 总部/省级/地市/县区
  status: 'ACTIVE' | 'CANCELLED'
  legalRep?: string
  registeredCapital?: string
  establishDate?: string
  dataSource?: string
  createdAt?: string
  updatedAt?: string
}

/** 树类型 */
export type TreeType = 'LEGAL' | 'BUDGET' | 'MANAGEMENT'

export const TREE_TYPE_LABELS: Record<TreeType, string> = {
  LEGAL: '法人树',
  BUDGET: '预算树',
  MANAGEMENT: '管理树'
}

/** 组织关系 */
export interface OrgRelation {
  id: string
  childId: string
  parentId: string | null
  levelNum: number
  effectiveDate: string // YYYY-MM-DD
  expiryDate: string // YYYY-MM-DD
  treeType: TreeType
  reason?: string
}

/** 树节点(用于前端渲染) */
export interface TreeNode {
  id: string
  label: string
  orgCode: string
  levelNum: number
  children?: TreeNode[]
  entity: OrgEntity
}

/** 变更操作类型 */
export type ChangeOperationType =
  | 'ADD' // 新增
  | 'TRANSFER' // 转移
  | 'PROMOTE' // 提级
  | 'DEMOTE' // 降级
  | 'CANCEL' // 注销

export const CHANGE_OPERATION_LABELS: Record<ChangeOperationType, string> = {
  ADD: '新增组织',
  TRANSFER: '转移归属',
  PROMOTE: '组织提级',
  DEMOTE: '组织降级',
  CANCEL: '注销组织'
}

/** 变更申请 */
export interface ChangeRequest {
  id?: string
  treeType: TreeType
  operationType: ChangeOperationType
  targetOrgId: string
  targetOrgName?: string
  oldParentId?: string | null
  oldParentName?: string
  newParentId?: string | null
  newParentName?: string
  effectiveDate: string
  reason: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
  applicant?: string
  appliedAt?: string
  approver?: string
  approvedAt?: string
  rejectReason?: string
}

/** 校验规则级别 */
export type Severity = 'HARD' | 'WARN' | 'INFO'

export const SEVERITY_LABELS: Record<Severity, string> = {
  HARD: '严重(拦截)',
  WARN: '警告',
  INFO: '提示'
}

/** 校验问题 */
export interface ValidationIssue {
  ruleCode: string
  ruleName: string
  severity: Severity
  category: 'STRUCTURAL' | 'TEMPORAL' | 'BUSINESS' | 'CROSSTREE'
  message: string
  affectedOrgIds: string[]
  affectedOrgNames?: string[]
}

/** 校验结果 */
export interface ValidationResult {
  hasHardFailure: boolean
  issues: ValidationIssue[]
}

/** Diff 变更类型 */
export type DiffType = 'ADDED' | 'REMOVED' | 'MOVED' | 'UNCHANGED'

/** Diff 节点 */
export interface DiffNode extends TreeNode {
  diffType: DiffType
  oldParentId?: string | null
  newParentId?: string | null
}

/** 预览响应 */
export interface PreviewResponse {
  before: TreeNode[]
  after: DiffNode[]
  validation: ValidationResult
}

/** 对账差异类型 */
export type ReconDiffType =
  | 'SOURCE_ONLY' // 源头有你没有
  | 'LOCAL_ONLY' // 你有源头没有
  | 'INFO_MISMATCH' // 信息不一致
  | 'ORPHAN' // 孤悬节点
  | 'TEMPORAL_BREAK' // 时态断裂

/** 对账差异 */
export interface ReconDifference {
  id: string
  diffType: ReconDiffType
  orgCode: string
  orgName: string
  description: string
  sourceValue?: string
  localValue?: string
  detectedAt: string
  status: 'PENDING' | 'RESOLVED' | 'IGNORED'
}

/** 对账报告 */
export interface ReconReport {
  id: string
  reconDate: string
  scope: TreeType | 'ALL'
  totalCount: number
  healthScore: number
  diffSummary: {
    [key in ReconDiffType]: number
  }
  differences: ReconDifference[]
  createdAt: string
}

// ✅ 添加类型别名，避免与 Vue 组件命名冲突
export type ValidationResultType = ValidationResult

