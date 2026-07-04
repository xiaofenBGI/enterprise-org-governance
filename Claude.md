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

## # 📁 校验引擎规则模块 - 文件结构总览(2026-07-04)

## ✅ 已实现的完整文件结构

```
frontend/src/utils/validation/rules/
├── base/
│   └── ValidationRule.ts                    # ✅ 已实现
│       # 作用: 规则基类，定义统一接口和通用方法
│       # 功能: 抽象类，提供 validate()、createIssue() 等模板方法
│
├── structural/                              # 结构规则（4条）
│   ├── NoCycleRule.ts                       # ✅ 已实现
│   │   # 作用: 无环检测规则
│   │   # 功能: 使用 DFS 回溯检测树中是否存在环路
│   │   # 严重等级: HARD（硬规则，阻塞提交）
│   │
│   ├── SingleParentRule.ts                  # ✅ 已实现
│   │   # 作用: 单父节点规则
│   │   # 功能: 确保每个节点在同一时刻只有一个父节点
│   │   # 严重等级: HARD（硬规则，阻塞提交）
│   │
│   ├── NoOrphanRule.ts                      # ✅ 已实现
│   │   # 作用: 孤悬节点检测
│   │   # 功能: 检测无法回溯到根节点的孤悬节点
│   │   # 严重等级: HARD（硬规则，阻塞提交）
│   │
│   └── MaxDepthRule.ts                      # ✅ 已实现
│       # 作用: 最大层级限制
│       # 功能: 防止树的层级过深（默认10层，可配置）
│       # 严重等级: WARN（警告，可确认后继续）
│
├── temporal/                                # 时态规则（2条）
│   ├── TemporalIntegrityRule.ts             # ✅ 已实现
│   │   # 作用: 时态完整性检查
│   │   # 功能: 确保父子关系的时间段连续无断裂
│   │   # 严重等级: HARD（硬规则，阻塞提交）
│   │   # 核心算法: 关键时点算法，检测时间段断裂
│   │
│   └── ParentCoversChildRule.ts             # ✅ 已实现
│       # 作用: 父存在期覆盖子
│       # 功能: 父节点存在期必须完全覆盖子节点存在期
│       # 严重等级: HARD（硬规则，阻塞提交）
│
├── business/                                # 业务规则（3条）
│   ├── EntityStatusRule.ts                  # ✅ 已实现
│   │   # 作用: 实体状态规则
│   │   # 功能: 注销/停用的公司不能作为父节点
│   │   # 严重等级: HARD（硬规则，阻塞提交）
│   │
│   ├── FutureDateRule.ts                    # ✅ 已实现
│   │   # 作用: 未来日期检查
│   │   # 功能: 限制生效日期不能超过当前日期+N天
│   │   # 严重等级: WARN（警告，可配置阈值）
│   │
│   └── CrossTreeConsistencyRule.ts          # ✅ 已实现
│       # 作用: 跨树一致性检查
│       # 功能: 法人树的父子关系在管理树中也应存在
│       # 严重等级: INFO（信息提示，不阻塞）
│
├── RuleRegistry.ts                          # ✅ 已实现
│   # 作用: 规则注册器（单例模式）
│   # 功能: 统一管理所有规则，提供查询和过滤能力
│   # 特性: 懒加载、可扩展、支持按分类/等级查询
│
└── index.ts                                 # ✅ 已实现
    # 作用: 统一导出入口
    # 功能: 导出所有规则类、接口、工具函数
    # 使用: 外部通过此文件导入所有校验相关内容
```

---
### src/components/DiffViewer.vue 已完成（2026-07-04）
DiffViewer.vue 组件实现了：

顶部统计面板 - 显示新增/移动/删除节点的数量
左右树形对比 - 使用 el-tree 展示变更前后的树结构
视觉标记 - 新增（绿色）、移动（琥珀色）、删除（红色）
同步高亮 - 鼠标悬停时，左右树对应节点同步高亮
温暖设计 - 纸质背景 #F6F1E8、琥珀色强调 #C8853F
## 📊 实现统计

### 按分类统计
- **结构规则（Structural）**: 4条 ✅
- **时态规则（Temporal）**: 2条 ✅
- **业务规则（Business）**: 3条 ✅

### 按严重等级统计
- **HARD（硬规则）**: 6条 - 阻塞提交
- **WARN（警告）**: 2条 - 可确认后继续
- **INFO（提示）**: 1条 - 仅信息展示

### 文件总数
- **规则实现**: 9个文件
- **基础设施**: 2个文件（base + registry）
- **导出入口**: 1个文件
- **总计**: **12个文件** ✅

---

## 🎯 核心亮点

1. **策略模式** - 每条规则独立封装，可灵活组合
2. **单例模式** - 规则注册器全局唯一，避免重复创建
3. **模板方法** - 基类提供通用方法，子类专注核心逻辑
4. **可配置** - 规则级别、开关、阈值全部可从字典读取
5. **高性能** - 关键时点算法、DFS 回溯、预计算索引
---
## 🔗 与已有模块的关系
这些规则会被以下已完成模块调用：
- ✅ **OrgAdjustment.vue**（组织调整）- 提交变更时调用校验
- ✅ **Reconciliation.vue**（监控对账）- 对账报告中调用健康检查
- ✅ **EntityMaster.vue**（实体主数据）- 状态校验
## 待完成  实现的组件 ValidationResult.vue
alidationResult.vue 组件会被以下模块调用
1. OrgAdjustment.vue（组织调整）✅ 已存在
调用场景: 提交变更时显示校验结果
当前状态: 已经在 Diff 预览对话框中内联实现了校验结果展示
影响: 可以提取成独立组件，复用代码
2. Reconciliation.vue（监控对账）✅ 已存在
调用场景: 对账报告中显示健康检查结果
当前状态: 需要补充校验结果展示
影响: 需要导入并使用 ValidationResult.vue
3. EntityMaster.vue（实体主数据）✅ 已存在
调用场景: 实体状态校验结果展示
当前状态: 需要补充校验结果展示
影响: 需要导入并使用 ValidationResult.vue
实施步骤
第一步：创建 ValidationResult.vue 组件
从 OrgAdjustment.vue 中提取校验结果展示逻辑
封装成独立、可复用的组件
第二步：重构 OrgAdjustment.vue
删除内联的校验结果代码
改用 <ValidationResult :validation-result="validationResult" />
第三步：补充 Reconciliation.vue
在对账报告中导入并使用 ValidationResult.vue
第四步：补充 EntityMaster.vue
在实体状态校验中导入并使用 ValidationResult.vue



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

