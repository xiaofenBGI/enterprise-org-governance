# 项目： 企业组织管理平台 

# 读 CLAUDE.md，继续按其中"待完成"列表接着做。
# 技术栈、已完成模块、关键约定以 CLAUDE.md 为准，不要改技术栈。

## 技术栈
后端: Node.js + Express + PostgreSQL + Prisma
前端: Vue 3 + TypeScript + Element Plus + Vite
数据库: PostgreSQL

## ⚠️ 禁止行为
- 不得擅自更换为 React / Nuxt / Vue 2
- 不得使用 any-ui（必须用 Element Plus）
- 不得移除已实现的 Amount 格式化逻辑

## MVP 实施建议
| 优先级 | 模块 | 理由 |
|--------|------|------|
| P0 | 组织浏览(三树 + 时光机) | 核心价值展示 |
| P0 | 校验引擎 | 底座,被多处调用,先做 |
| P0 | 组织调整(diff + 审批) | 核心写入能力 |
| P1 | 监控与对账 | 依赖校验引擎和源头快照 |
| P1 | 实体主数据 + 工单 | 与对账闭环 |
| P2 | 系统设置(权限、订阅、字典、日志) | 支撑性功能 |

## 前端先出视觉效果和交互流程,拿着 mock 数据跑通演示,给业务方看、收反馈、快速迭代,确认价值后再投后端资源。
## 项目结构 
org-tree-frontend/
├── src/
│   ├── api/ 
│   │   ├── index.ts              # 已完成
│   ├── mock/ 
│   │   ├── orgData.ts            # 已完成
│   │   ├── validationRules.ts    # 已完成
│   ├── views/
│   │   ├── OrgBrowser.vue        # P0: 组织浏览，已完成
│   │   ├── OrgAdjustment.vue     # P0: 组织调整，已完成
│   │   ├── Reconciliation.vue    # P1: 监控对账，已完成
│   │   └── EntityMaster.vue      # P1: 实体主数据，已完成
│   ├── components/
│   │   ├── OrgTree.vue           # 组织树组件，已完成
│   │   ├── DiffViewer.vue        # 变更前后对比
│   │   └── ValidationResult.vue  # 校验结果展示
│   ├── mock/
│   │   ├── orgData.ts            # mock 组织数据，已完成
│   │   └── validationRules.ts    # mock 校验规则，已完成
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义， 已完成
│   ├── utils/
│   │   └── treeBuilder.ts        # 工具函数 根据指定日期和树类型构建树结构，已完成
│   ├── router/
│   │   └── index.ts              # 已完成
│   ├── styles/
│   │   └── index.scss              # 已完成
│   ├── main.ts                   # 应用主入口
│   │  
│   └── App.vue                   # 已完成
├── package.json                  # 已完成
├── tsconfig.json                 # 已完成
├── tsconfig.node.json            # 已完成
├── index.html                    # 已完成
└── vite.config.ts                # 已完成

## 已完成的模块（截止2026-07-03）
P0 核心功能：
✅ 组织浏览 - 三树并列展示 + 时光机
✅ 组织调整 - 变更申请 + Diff 预览 + 校验 + 审批
P1 功能：
✅ 监控对账 - 对账报告 + 差异处理
✅ 实体主数据 - 实体管理 + 树中位置查看

## 待完成
我们继续推进组织树项目。根据知识库中的设计文档，我建议按以下优先级推进：

📋 接下来的实施计划
P0 优先级（核心功能）
1. 校验引擎（底座） ⭐ 建议先做
这是整个平台的地基，会被组织调整、对账报告等多处复用。

关键点：

规则接口设计（ValidationRule）
上下文数据结构（ValidationContext、TreeSnapshot）
引擎调度逻辑
三条最难的规则实现：
无环检测（NoCycleRule）
时态完整性（TemporalIntegrityRule）
父存在期覆盖子（ParentCoversChildRule）
2. 组织调整的 Diff 预览
依赖校验引擎，实现变更前后的对比视图和实时校验反馈。

3. 完善 Mock 数据
补充更真实的时态关系数据，支持时光机演示。

具体方案选择
根据文档，先在前端实现校验引擎原型

用 TypeScript 实现核心校验逻辑
在前端的 diff 预览中直接调用
验证算法正确性后再迁移到后端

理由：

快速验证：前端实现更快，可以立即在 UI 中看到效果
易于演示：不需要启动后端服务就能展示核心逻辑
逻辑可复用：TypeScript 和 Java 的算法逻辑是通用的

frontend/src/utils/validation/        # 前端也能用的校验逻辑
├── engine/
│   ├── ValidationEngine.ts           # 引擎核心
│   ├── ValidationContext.ts          # 上下文数据结构
│   └── ValidationResult.ts           # 结果和 Issue
├── rules/
│   ├── base/
│   │   └── ValidationRule.ts         # 规则接口
│   ├── structural/                   # 结构规则
│   │   ├── NoCycleRule.ts           # 无环检测 ⭐
│   │   ├── SingleParentRule.ts      # 单父节点
│   │   ├── MaxDepthRule.ts          # 最大层级
│   │   └── NoOrphanRule.ts          # 孤悬节点
│   ├── temporal/                     # 时态规则
│   │   ├── TemporalIntegrityRule.ts # 时态完整性 ⭐
│   │   ├── ParentCoversChildRule.ts # 父覆盖子 ⭐
│   │   └── NoOverlapRule.ts         # 无重叠父节点
│   └── business/                     # 软规则（可配置）
│       ├── ReasonableDepthRule.ts   # 层级合理性
│       └── CancelSyncRule.ts        # 注销联动提醒
└── snapshot/
    ├── TreeSnapshot.ts               # 树快照
    └── SnapshotBuilder.ts            # 快照构建器

backend/src/validation/               # 后端可以直接引用上面的代码
└── index.ts                          # 导出给 API 使用

实施步骤（按优先级）
第一步：核心数据结构（1-2小时）
实现：

TreeSnapshot - 树快照（某棵树在某天的状态）
ValidationContext - 校验上下文（装载变更前后快照、配置）
ValidationResult & Issue - 校验结果和问题
第二步：引擎调度（30分钟）
实现：

ValidationEngine - 遍历所有规则，收集问题
规则开关和级别配置（从前端 mock 配置读取）
第三步：三条最难的规则（4-6小时） ⭐
实现：

NoCycleRule - 无环检测（DFS 回溯）
TemporalIntegrityRule - 时态完整性（关键时点算法）
ParentCoversChildRule - 父存在期覆盖子
第四步：其他基础规则（2-3小时）
实现：

SingleParentRule - 单父节点
MaxDepthRule - 最大层级
NoOrphanRule - 孤悬节点
第五步：前端集成（2小时）
在组织调整页面的 diff 预览中调用校验引擎，实时显示问题。

💡 我的建议
推荐方案：先在前端实现 TypeScript 版校验引擎

理由：

✅ 快速验证 - 不需要启动后端，直接在浏览器里看效果
✅ 易于调试 - Vue DevTools 可以实时查看校验结果
✅ 前后端复用 - 后端只需要 import 前端的代码
✅ 演示友好 - MVP 演示时无需数据库，用 mock 数据就能展示核心逻辑
后续扩展：

当需要大数据量对账时，再把引擎移到后端 API
Prisma 查询结果可以直接转换成 TreeSnapshot 喂给引擎

建议立即开始实现核心数据结构和引擎框架

创建完整的校验引擎骨架代码 - 所有接口、类型定义、引擎调度逻辑
实现三条最难的规则 - NoCycleRule、TemporalIntegrityRule、ParentCoversChildRule
写单元测试 - 针对成环、时态断裂等场景构造测试用例
集成到组织调整页面 - 在 diff 预览中实时显示校验结果


## 关键约定
函数，变量，文件名等命名规范在所有编码中统一，禁止随意变换。
新写一个文件之前，要先查阅已经存在哪些文件受到影响，以及需要引用已经存在的文件，请先告知。
每次只写一个文件，得到认可后，再往后做。
每次写完一个文件的代码，总结这个文件实现了什么功能。
每个文件代码里面有详细的注释。

## 需求文档 
详见 企业组织树管理平台.md (已上传知识库)

## 术语表

| 术语 | 含义 |
|------|------|
| 时光机 | 查询任意历史/未来时点组织形态的能力 |
| 硬规则(HARD) | 违反则拦截提交的强制规则 |
| 软规则(WARN) | 违反给出警告,确认后可继续 |
| 孤悬节点 | 在树中但无法回溯到根的节点 |
| 游离实体 | 在三棵树中都找不到位置的公司 |
| diff 预览 | 变更前后树形态的对比视图 |
| 数据健康分 | 各类差异按权重扣分得出的一致性评分 |
| 业务生效日(effective_date) | 组织调整在业务上生效的日期,非系统录入日 

