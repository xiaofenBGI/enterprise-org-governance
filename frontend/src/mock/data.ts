import type {
  OrgNode,
  Entity,
  ChangeRequest,
  ApprovalTask,
  ReconReport,
  ReconIssue,
  ChangeEvent,
  PushStatus,
  TreeTypeMeta
} from '@/types'

// ========== 树类型元信息 ==========
export const treeTypeMetas: TreeTypeMeta[] = [
  { type: 'legal', label: '法人树', color: '#409EFF' },
  { type: 'budget', label: '预算树', color: '#67C23A' },
  { type: 'management', label: '管理树', color: '#E6A23C' }
]

// ========== 实体主数据 ==========
// 三棵树的节点最终都指向这批实体,通过 entityId 关联
export const entities: Entity[] = [
  {
    id: 'E001', name: '集团总部', code: 'HQ', type: 'company',
    legalNodeId: 'L001', budgetNodeId: 'B001', managementNodeId: 'M001',
    status: 'active', issueCount: 0
  },
  {
    id: 'E002', name: '华东子公司', code: 'EC', type: 'company',
    legalNodeId: 'L002', budgetNodeId: 'B002', managementNodeId: 'M002',
    status: 'active', issueCount: 1
  },
  {
    id: 'E003', name: '华南子公司', code: 'SC', type: 'company',
    legalNodeId: 'L003', budgetNodeId: 'B003', managementNodeId: 'M003',
    status: 'active', issueCount: 0
  },
  {
    id: 'E004', name: '研发中心', code: 'RD', type: 'department',
    legalNodeId: 'L004', budgetNodeId: 'B004', managementNodeId: 'M004',
    status: 'active', issueCount: 0
  },
  {
    id: 'E005', name: '销售中心', code: 'SALES', type: 'department',
    legalNodeId: 'L005', budgetNodeId: 'B005', managementNodeId: 'M005',
    status: 'active', issueCount: 2
  },
  {
    id: 'E006', name: '供应链中心', code: 'SCM', type: 'department',
    legalNodeId: 'L006', budgetNodeId: 'B006', managementNodeId: null,
    status: 'active', issueCount: 1
  },
  {
    id: 'E007', name: '成本中心-华东制造', code: 'CC-ECM', type: 'cost_center',
    legalNodeId: null, budgetNodeId: 'B007', managementNodeId: 'M007',
    status: 'active', issueCount: 0
  },
  {
    id: 'E008', name: '事业部-智能硬件', code: 'BU-IH', type: 'business_unit',
    legalNodeId: null, budgetNodeId: 'B008', managementNodeId: 'M008',
    status: 'frozen', issueCount: 1
  }
]

// ========== 法人树 ==========
export const legalTree: OrgNode[] = [
  {
    id: 'L001', name: '集团总部', code: 'HQ', treeType: 'legal',
    parentId: null, status: 'active', entityId: 'E001',
    effectiveFrom: '2020-01-01', effectiveTo: null, owner: '张伟',
    children: [
      {
        id: 'L002', name: '华东子公司', code: 'EC', treeType: 'legal',
        parentId: 'L001', status: 'active', entityId: 'E002',
        effectiveFrom: '2020-03-01', effectiveTo: null, owner: '李娜',
        children: [
          {
            id: 'L004', name: '研发中心', code: 'RD', treeType: 'legal',
            parentId: 'L002', status: 'active', entityId: 'E004',
            effectiveFrom: '2021-01-01', effectiveTo: null, owner: '王强',
            children: []
          },
          {
            id: 'L006', name: '供应链中心', code: 'SCM', treeType: 'legal',
            parentId: 'L002', status: 'active', entityId: 'E006',
            effectiveFrom: '2021-06-01', effectiveTo: null, owner: '陈静',
            children: []
          }
        ]
      },
      {
        id: 'L003', name: '华南子公司', code: 'SC', treeType: 'legal',
        parentId: 'L001', status: 'active', entityId: 'E003',
        effectiveFrom: '2020-05-01', effectiveTo: null, owner: '刘洋',
        children: [
          {
            id: 'L005', name: '销售中心', code: 'SALES', treeType: 'legal',
            parentId: 'L003', status: 'active', entityId: 'E005',
            effectiveFrom: '2021-02-01', effectiveTo: null, owner: '赵敏',
            children: []
          }
        ]
      }
    ]
  }
]

// ========== 预算树 ==========
export const budgetTree: OrgNode[] = [
  {
    id: 'B001', name: '集团总预算', code: 'HQ', treeType: 'budget',
    parentId: null, status: 'active', entityId: 'E001',
    effectiveFrom: '2020-01-01', effectiveTo: null, owner: '财务部',
    children: [
      {
        id: 'B002', name: '华东预算单元', code: 'EC', treeType: 'budget',
        parentId: 'B001', status: 'active', entityId: 'E002',
        effectiveFrom: '2020-03-01', effectiveTo: null,
        children: [
          {
            id: 'B004', name: '研发预算', code: 'RD', treeType: 'budget',
            parentId: 'B002', status: 'active', entityId: 'E004',
            effectiveFrom: '2021-01-01', effectiveTo: null, children: []
          },
          {
            id: 'B007', name: '华东制造成本中心', code: 'CC-ECM', treeType: 'budget',
            parentId: 'B002', status: 'active', entityId: 'E007',
            effectiveFrom: '2021-04-01', effectiveTo: null, children: []
          },
          {
            id: 'B006', name: '供应链预算', code: 'SCM', treeType: 'budget',
            parentId: 'B002', status: 'active', entityId: 'E006',
            effectiveFrom: '2021-06-01', effectiveTo: null, children: []
          }
        ]
      },
      {
        id: 'B003', name: '华南预算单元', code: 'SC', treeType: 'budget',
        parentId: 'B001', status: 'active', entityId: 'E003',
        effectiveFrom: '2020-05-01', effectiveTo: null,
        children: [
          {
            id: 'B005', name: '销售预算', code: 'SALES', treeType: 'budget',
            parentId: 'B003', status: 'active', entityId: 'E005',
            effectiveFrom: '2021-02-01', effectiveTo: null, children: []
          },
          {
            id: 'B008', name: '智能硬件事业部预算', code: 'BU-IH', treeType: 'budget',
            parentId: 'B003', status: 'frozen', entityId: 'E008',
            effectiveFrom: '2022-01-01', effectiveTo: null, children: []
          }
        ]
      }
    ]
  }
]

// ========== 管理树 ==========
export const managementTree: OrgNode[] = [
  {
    id: 'M001', name: '集团管理口径', code: 'HQ', treeType: 'management',
    parentId: null, status: 'active', entityId: 'E001',
    effectiveFrom: '2020-01-01', effectiveTo: null, owner: '张伟',
    children: [
      {
        id: 'M004', name: '研发中心', code: 'RD', treeType: 'management',
        parentId: 'M001', status: 'active', entityId: 'E004',
        effectiveFrom: '2021-01-01', effectiveTo: null, owner: '王强',
        children: []
      },
      {
        id: 'M008', name: '智能硬件事业部', code: 'BU-IH', treeType: 'management',
        parentId: 'M001', status: 'frozen', entityId: 'E008',
        effectiveFrom: '2022-01-01', effectiveTo: null, owner: '孙磊',
        children: [
          {
            id: 'M007', name: '华东制造', code: 'CC-ECM', treeType: 'management',
            parentId: 'M008', status: 'active', entityId: 'E007',
            effectiveFrom: '2021-04-01', effectiveTo: null, children: []
          }
        ]
      },
      {
        id: 'M002', name: '华东区域', code: 'EC', treeType: 'management',
        parentId: 'M001', status: 'active', entityId: 'E002',
        effectiveFrom: '2020-03-01', effectiveTo: null, owner: '李娜',
        children: [
          {
            id: 'M005', name: '销售中心', code: 'SALES', treeType: 'management',
            parentId: 'M002', status: 'active', entityId: 'E005',
            effectiveFrom: '2021-02-01', effectiveTo: null, owner: '赵敏',
            children: []
          }
        ]
      },
      {
        id: 'M003', name: '华南区域', code: 'SC', treeType: 'management',
        parentId: 'M001', status: 'active', entityId: 'E003',
        effectiveFrom: '2020-05-01', effectiveTo: null, owner: '刘洋',
        children: []
      }
    ]
  }
]

// ========== 变更单 ==========
export const changeRequests: ChangeRequest[] = [
  {
    id: 'CR20240001', title: '销售中心迁移至华东区域', treeType: 'management',
    changeType: 'move', targetNodeId: 'M005', targetNodeName: '销售中心',
    status: 'pending',
    diffs: [
      { field: 'parentId', label: '上级组织', before: '华南区域', after: '华东区域' },
      { field: 'owner', label: '负责人', before: '赵敏', after: '赵敏' }
    ],
    validations: [
      { level: 'warning', message: '该节点在预算树中仍挂靠华南预算单元,迁移后需同步调整' },
      { level: 'info', message: '涉及 12 名员工的汇报关系变更' }
    ],
    applicant: '李娜', createdAt: '2024-06-10 09:23', effectiveDate: '2024-07-01',
    remark: '组织架构优化,华东区域统一管理销售'
  },
  {
    id: 'CR20240002', title: '新设智能硬件事业部', treeType: 'management',
    changeType: 'create', targetNodeId: 'M008', targetNodeName: '智能硬件事业部',
    status: 'pending',
    diffs: [
      { field: 'name', label: '名称', before: null, after: '智能硬件事业部' },
      { field: 'code', label: '编码', before: null, after: 'BU-IH' },
      { field: 'parentId', label: '上级组织', before: null, after: '集团管理口径' }
    ],
    validations: [
      { level: 'error', message: '编码 BU-IH 在法人树中无对应法人实体,请先完成工商注册' },
      { level: 'info', message: '预算树中已存在同编码预算单元' }
    ],
    applicant: '孙磊', createdAt: '2024-06-11 14:05', effectiveDate: '2024-07-01'
  },
  {
    id: 'CR20240003', title: '供应链中心更名', treeType: 'legal',
    changeType: 'rename', targetNodeId: 'L006', targetNodeName: '供应链中心',
    status: 'approved',
    diffs: [
      { field: 'name', label: '名称', before: '供应链中心', after: '智慧供应链中心' }
    ],
    validations: [
      { level: 'info', message: '更名将同步至预算树对应节点' }
    ],
    applicant: '陈静', createdAt: '2024-06-08 11:30', effectiveDate: '2024-06-15'
  },
  {
    id: 'CR20240004', title: '关闭华南子公司下冗余成本中心', treeType: 'budget',
    changeType: 'close', targetNodeId: 'B008', targetNodeName: '智能硬件事业部预算',
    status: 'draft',
    diffs: [
      { field: 'status', label: '状态', before: '冻结', after: '关闭' }
    ],
    validations: [
      { level: 'warning', message: '该预算单元本年度尚有未核销预算 ¥1,200,000' }
    ],
    applicant: '财务部', createdAt: '2024-06-12 16:40', effectiveDate: '2024-12-31'
  }
]

// ========== 审批任务 ==========
export const approvalTasks: ApprovalTask[] = [
  {
    id: 'AP001', changeRequestId: 'CR20240001', changeTitle: '销售中心迁移至华东区域',
    treeType: 'management', changeType: 'move', applicant: '李娜',
    submittedAt: '2024-06-10 09:23', status: 'pending', currentApprover: '当前用户'
  },
  {
    id: 'AP002', changeRequestId: 'CR20240002', changeTitle: '新设智能硬件事业部',
    treeType: 'management', changeType: 'create', applicant: '孙磊',
    submittedAt: '2024-06-11 14:05', status: 'pending', currentApprover: '当前用户'
  }
]

// ========== 对账报告 ==========
export const reconReports: ReconReport[] = [
  {
    id: 'RC001', name: '法人树 vs 预算树 一致性对账',
    sourceTree: 'legal', targetTree: 'budget', status: 'failed',
    runAt: '2024-06-12 02:00', totalCount: 8, matchedCount: 5, issueCount: 3
  },
  {
    id: 'RC002', name: '法人树 vs 管理树 一致性对账',
    sourceTree: 'legal', targetTree: 'management', status: 'failed',
    runAt: '2024-06-12 02:05', totalCount: 8, matchedCount: 6, issueCount: 2
  },
  {
    id: 'RC003', name: '预算树 vs 管理树 一致性对账',
    sourceTree: 'budget', targetTree: 'management', status: 'passed',
    runAt: '2024-06-12 02:10', totalCount: 8, matchedCount: 8, issueCount: 0
  }
]

// ========== 对账问题明细 ==========
export const reconIssues: ReconIssue[] = [
  {
    id: 'RI001', reportId: 'RC001', level: 'critical', issueType: 'missing',
    entityCode: 'CC-ECM', entityName: '华东制造成本中心',
    description: '预算树存在该成本中心,法人树中无对应法人节点',
    sourceValue: null, targetValue: 'B007'
  },
  {
    id: 'RI002', reportId: 'RC001', level: 'critical', issueType: 'missing',
    entityCode: 'BU-IH', entityName: '智能硬件事业部',
    description: '预算树存在该事业部,法人树中无对应法人节点',
    sourceValue: null, targetValue: 'B008'
  },
  {
    id: 'RI003', reportId: 'RC001', level: 'minor', issueType: 'mismatch',
    entityCode: 'SCM', entityName: '供应链中心',
    description: '名称不一致:法人树"智慧供应链中心",预算树"供应链预算"',
    sourceValue: '智慧供应链中心', targetValue: '供应链预算'
  },
  {
    id: 'RI004', reportId: 'RC002', level: 'major', issueType: 'mismatch',
    entityCode: 'SALES', entityName: '销售中心',
    description: '归属不一致:法人树挂靠华南子公司,管理树挂靠华东区域',
    sourceValue: '华南子公司', targetValue: '华东区域'
  },
  {
    id: 'RI005', reportId: 'RC002', level: 'major', issueType: 'orphan',
    entityCode: 'SCM', entityName: '供应链中心',
    description: '法人树存在该节点,管理树中无对应管理口径节点',
    sourceValue: 'L006', targetValue: null
  }
]

// ========== 变更事件流 ==========
export const changeEvents: ChangeEvent[] = [
  {
    id: 'EV001', type: 'change_applied', title: '供应链中心更名已生效',
    treeType: 'legal', occurredAt: '2024-06-15 00:00',
    detail: 'CR20240003 变更已应用到法人树'
  },
  {
    id: 'EV002', type: 'push_failed', title: 'HR 系统推送失败',
    treeType: 'management', occurredAt: '2024-06-15 00:05',
    detail: '智能硬件事业部因缺少法人实体,HR 系统拒绝接收'
  },
  {
    id: 'EV003', type: 'push_success', title: '财务系统推送成功',
    treeType: 'budget', occurredAt: '2024-06-15 00:03',
    detail: '3 个预算单元变更已同步至财务系统'
  },
  {
    id: 'EV004', type: 'recon_done', title: '每日对账完成',
    treeType: null, occurredAt: '2024-06-12 02:15',
    detail: '3 个对账任务完成,发现 5 项问题'
  }
]

// ========== 下游系统推送状态 ==========
export const pushStatuses: PushStatus[] = [
  { id: 'PS001', system: 'HR 系统', lastPushAt: '2024-06-15 00:05', status: 'failed', pendingCount: 1 },
  { id: 'PS002', system: '财务系统', lastPushAt: '2024-06-15 00:03', status: 'success', pendingCount: 0 },
  { id: 'PS003', system: '主数据平台 MDM', lastPushAt: '2024-06-15 00:02', status: 'success', pendingCount: 0 },
  { id: 'PS004', system: 'BI 数仓', lastPushAt: '2024-06-15 00:08', status: 'pending', pendingCount: 2 }
]