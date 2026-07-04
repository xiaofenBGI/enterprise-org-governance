// frontend/src/utils/validation/engine/ValidationContext.ts

import { TreeSnapshot } from '../snapshot/TreeSnapshot';

/**
 * 变更请求（简化版，对应后端 ChangeRequest）
 */
export interface ChangeRequest {
  entityId: string;           // 要操作的公司
  treeType: string;           // 树类型
  changeType: 'ADD' | 'MOVE' | 'REMOVE';  // 变更类型
  newParentId?: string | null; // 新父节点（ADD/MOVE 时需要）
  effectiveDate: string;      // 生效日期
  expireDate: string;         // 失效日期
}

/**
 * 实体信息查询接口
 */
export interface EntityLookup {
  /**
   * 获取实体状态
   */
  getStatus(entityId: string): 'ACTIVE' | 'CANCELLED' | 'PENDING';

  /**
   * 获取实体成立日期
   */
  getEstablishDate(entityId: string): string | null;

  /**
   * 获取实体注销日期
   */
  getCancelDate(entityId: string): string | null;
}

/**
 * 校验配置（从字典读取）
 */
export interface ValidationConfig {
  maxDepth: number;           // 最大层级限制（如 10 层）
  reasonableDepth: number;    // 合理层级建议（如 6 层）
  rules: Map<string, RuleConfig>; // 规则配置
}

/**
 * 单条规则配置
 */
export interface RuleConfig {
  code: string;               // 规则代码
  enabled: boolean;           // 是否启用
  severity: 'HARD' | 'WARN' | 'INFO'; // 严重等级（可覆盖代码默认值）
}

/**
 * 校验上下文：规则需要的所有数据
 *
 * 设计原则：规则本身不查数据库，数据由 Context 统一准备好
 * 这样规则是纯函数，好测试、好复用
 */
export class ValidationContext {
  // === 场景区分 ===
  readonly isFullScan: boolean;        // 是否全量校验（对账用）
  readonly change?: ChangeRequest;     // 本次变更（组织调整用）

  // === 数据供给 ===
  readonly beforeSnapshot: TreeSnapshot;  // 变更前的树快照
  readonly afterSnapshot: TreeSnapshot;   // 应用变更后的树快照
  readonly checkpoints: string[];         // 关键时点列表（YYYY-MM-DD）
  readonly entityLookup: EntityLookup;    // 实体信息查询

  // === 配置 ===
  readonly config: ValidationConfig;      // 校验配置（从字典读）

  constructor(params: {
    isFullScan: boolean;
    change?: ChangeRequest;
    beforeSnapshot: TreeSnapshot;
    afterSnapshot: TreeSnapshot;
    checkpoints: string[];
    entityLookup: EntityLookup;
    config: ValidationConfig;
  }) {
    this.isFullScan = params.isFullScan;
    this.change = params.change;
    this.beforeSnapshot = params.beforeSnapshot;
    this.afterSnapshot = params.afterSnapshot;
    this.checkpoints = params.checkpoints;
    this.entityLookup = params.entityLookup;
    this.config = params.config;
  }

  /**
   * 获取规则配置
   */
  getRuleConfig(ruleCode: string): RuleConfig | undefined {
    return this.config.rules.get(ruleCode);
  }

  /**
   * 判断规则是否启用
   */
  isRuleEnabled(ruleCode: string): boolean {
    const ruleConfig = this.getRuleConfig(ruleCode);
    return ruleConfig ? ruleConfig.enabled : false;
  }

  /**
   * 获取最大层级限制
   */
  getMaxDepth(): number {
    return this.config.maxDepth;
  }

  /**
   * 获取合理层级建议
   */
  getReasonableDepth(): number {
    return this.config.reasonableDepth;
  }
}

/**
 * Context Builder（便捷构造器）
 */
export class ValidationContextBuilder {
  private params: any = {
    isFullScan: false,
    checkpoints: [],
  };

  fullScan(isFull: boolean): this {
    this.params.isFullScan = isFull;
    return this;
  }

  change(change: ChangeRequest): this {
    this.params.change = change;
    return this;
  }

  beforeSnapshot(snapshot: TreeSnapshot): this {
    this.params.beforeSnapshot = snapshot;
    return this;
  }

  afterSnapshot(snapshot: TreeSnapshot): this {
    this.params.afterSnapshot = snapshot;
    return this;
  }

  checkpoints(dates: string[]): this {
    this.params.checkpoints = dates;
    return this;
  }

  entityLookup(lookup: EntityLookup): this {
    this.params.entityLookup = lookup;
    return this;
  }

  config(config: ValidationConfig): this {
    this.params.config = config;
    return this;
  }

  build(): ValidationContext {
    return new ValidationContext(this.params);
  }
}