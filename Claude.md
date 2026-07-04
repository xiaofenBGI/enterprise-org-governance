# 项目： 企业组织管理平台 

# 读 CLAUDE.md，继续按其中"待完成"列表接着做。

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
#以下是整理后的内容，突出已完成的工作和待办事项，确保表达的准确性：

---

## 项目结构
### org-tree-frontend/
```
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
│   │   ├── DiffViewer.vue        # 变更前后对比，已完成
│   │   └── ValidationResult.vue  # 校验结果展示，已完成
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义，已完成
│   ├── utils/
│   │   └── treeBuilder.ts        # 工具函数，根据指定日期和树类型构建树结构，已完成
│   ├── router/
│   │   └── index.ts              # 已完成
│   ├── styles/
│   │   └── index.scss            # 已完成
│   ├── main.ts                   # 应用主入口
│   └── App.vue                   # 已完成
├── package.json                  # 已完成
├── tsconfig.json                 # 已完成
├── tsconfig.node.json            # 已完成
├── index.html                    # 已完成
└── vite.config.ts                # 已完成
```

## ✅ 已实现的完整文件结构及编码
```
frontend/src/utils/validation/rules/
├── base/
│   └── ValidationRule.ts                    # ✅ 已实现
├── structural/                              
│   ├── NoCycleRule.ts                       # ✅ 已实现
│   ├── SingleParentRule.ts                  # ✅ 已实现
│   ├── NoOrphanRule.ts                      # ✅ 已实现
│   └── MaxDepthRule.ts                      # ✅ 已实现
├── temporal/                                
│   ├── TemporalIntegrityRule.ts             # ✅ 已实现
│   └── ParentCoversChildRule.ts             # ✅ 已实现
├── business/                                
│   ├── EntityStatusRule.ts                  # ✅ 已实现
│   ├── FutureDateRule.ts                    # ✅ 已实现
│   └── CrossTreeConsistencyRule.ts          # ✅ 已实现
├── RuleRegistry.ts                          # ✅ 已实现
└── index.ts                                 # ✅ 已实现
```

## 待完成 


## 关键约定
函数，变量，文件名等命名规范，业务逻辑，风格样式等在所有编码中统一，禁止随意变换。
新写文件之前，先查阅已经存在哪些文件受到影响，以及需要引用已经存在的文件，请先告知。
每次只写一个文件，得到认可后，再往后做。
每次写完一个文件的代码，总结这个文件实现了什么功能。
每个文件代码里面有详细的注释。建议注释包括这个文件在项目的相对路径。

## 需求文档 
详见 企业组织树管理平台.md (已上传知识库)


