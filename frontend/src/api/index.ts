import type {
  OrgNode,
  Entity,
  ChangeRequest,
  ApprovalTask,
  ReconReport,
  ReconIssue,
  ChangeEvent,
  PushStatus,
  TreeType,
  ChangeStatus,
  ApprovalAction
} from '@/types'
import {
  legalTree,
  budgetTree,
  managementTree,
  entities,
  changeRequests,
  approvalTasks,
  reconReports,
  reconIssues,
  changeEvents,
  pushStatuses
} from '@/mock/data'

/** 模拟网络延时 */
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(data)), ms)
  })
}

/** 深拷贝,避免 mock 数据被页面直接改动污染 */
function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

// ========== 组织树 ==========

/** 按类型获取组织树 */
export function fetchTree(treeType: TreeType): Promise<OrgNode[]> {
  const map: Record<TreeType, OrgNode[]> = {
    legal: legalTree,
    budget: budgetTree,
    management: managementTree
  }
  return delay(map[treeType])
}

/** 一次性获取三棵树,首页/管控台用 */
export function fetchAllTrees(): Promise<Record<TreeType, OrgNode[]>> {
  return delay({
    legal: legalTree,
    budget: budgetTree,
    management: managementTree
  })
}

// ========== 实体主数据 ==========

export function fetchEntities(): Promise<Entity[]> {
  return delay(entities)
}

/** 按 entityId 查实体,跨树高亮时用 */
export function fetchEntityById(entityId: string): Promise<Entity | null> {
  const found = entities.find((e) => e.id === entityId) ?? null
  return delay(found)
}

// ========== 变更单 ==========

export function fetchChangeRequests(status?: ChangeStatus): Promise<ChangeRequest[]> {
  const list = status
    ? changeRequests.filter((c) => c.status === status)
    : changeRequests
  return delay(list)
}

export function fetchChangeRequestById(id: string): Promise<ChangeRequest | null> {
  const found = changeRequests.find((c) => c.id === id) ?? null
  return delay(found)
}

/** 提交变更单(草稿转待审批) */
export function submitChangeRequest(id: string): Promise<ChangeRequest | null> {
  const cr = changeRequests.find((c) => c.id === id)
  if (cr) cr.status = 'pending'
  return delay(cr ?? null)
}

// ========== 审批 ==========

export function fetchApprovalTasks(): Promise<ApprovalTask[]> {
  return delay(approvalTasks)
}

/** 审批操作:通过 / 驳回 */
export function submitApproval(
  taskId: string,
  action: ApprovalAction,
  _comment?: string
): Promise<ApprovalTask | null> {
  const task = approvalTasks.find((t) => t.id === taskId)
  if (task) {
    const newStatus: ChangeStatus = action === 'approve' ? 'approved' : 'rejected'
    task.status = newStatus
    // 同步更新关联变更单状态
    const cr = changeRequests.find((c) => c.id === task.changeRequestId)
    if (cr) cr.status = newStatus
  }
  return delay(task ?? null)
}

// ========== 对账 ==========

export function fetchReconReports(): Promise<ReconReport[]> {
  return delay(reconReports)
}

export function fetchReconIssues(reportId: string): Promise<ReconIssue[]> {
  const list = reconIssues.filter((i) => i.reportId === reportId)
  return delay(list)
}

/** 触发重新对账,返回更新后的报告 */
export function runRecon(reportId: string): Promise<ReconReport | null> {
  const report = reconReports.find((r) => r.id === reportId)
  if (report) report.runAt = new Date().toLocaleString('zh-CN', { hour12: false })
  return delay(report ?? null, 800)
}

// ========== 监控 ==========

export function fetchChangeEvents(): Promise<ChangeEvent[]> {
  return delay(changeEvents)
}

export function fetchPushStatuses(): Promise<PushStatus[]> {
  return delay(pushStatuses)
}