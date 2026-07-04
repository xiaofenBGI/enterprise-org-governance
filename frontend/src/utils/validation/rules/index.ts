// frontend/src/utils/validation/rules/index.ts

/**
 * 规则模块统一导出
 *
 * 这个文件是规则模块的唯一对外入口，外部代码应该从这里导入所需的类型和函数。
 *
 * 使用示例：
 * ```typescript
 * import { getAllRules, RuleCode, ValidationRule } from '@/utils/validation/rules';
 *
 * const rules = getAllRules();
 * const cycleRule = getRule(RuleCode.NO_CYCLE);
 * ```
 */

// ==================== 基础类型 ====================
export {
  ValidationRule,
  RuleCategory,
  BaseValidationRule
} from './base/ValidationRule';

// ==================== 结构规则 ====================
export { NoCycleRule } from './structural/NoCycleRule';
export { SingleParentRule } from './structural/SingleParentRule';
export { NoOrphanRule } from './structural/NoOrphanRule';
export { MaxDepthRule } from './structural/MaxDepthRule';

// ==================== 时态规则 ====================
export { TemporalIntegrityRule } from './temporal/TemporalIntegrityRule';
export { ParentCoversChildRule } from './temporal/ParentCoversChildRule';

// ==================== 业务规则 ====================
export { EntityStatusRule, type EntityInfo } from './business/EntityStatusRule';
export { FutureDateRule } from './business/FutureDateRule';
export { CrossTreeConsistencyRule } from './business/CrossTreeConsistencyRule';

// ==================== 规则注册器 ====================
export {
  RuleRegistry,
  getAllRules,
  getRule,
  getRulesByCategory
} from './RuleRegistry';

// ==================== 引擎相关类型（从上层导出） ====================
export {
  RuleCode,
  IssueSeverity,
  Issue,
  ValidationResult
} from '../engine/ValidationResult';

export { ValidationContext } from '../engine/ValidationContext';
export { ValidationEngine } from '../engine/ValidationEngine';

// ==================== 便捷类型别名 ====================
/**
 * 规则分类枚举
 */
export const RULE_CATEGORIES = {
  STRUCTURAL: 'STRUCTURAL',
  TEMPORAL: 'TEMPORAL',
  BUSINESS: 'BUSINESS',
} as const;

/**
 * 严重等级枚举
 */
export const SEVERITIES = {
  HARD: 'HARD',
  WARN: 'WARN',
  INFO: 'INFO',
} as const;

/**
 * 规则代码枚举（方便 IDE 自动补全）
 */
export const RULES = {
  // 结构规则
  NO_CYCLE: RuleCode.NO_CYCLE,
  SINGLE_PARENT: RuleCode.SINGLE_PARENT,
  NO_ORPHAN: RuleCode.NO_ORPHAN,
  MAX_DEPTH: RuleCode.MAX_DEPTH,

  // 时态规则
  TEMPORAL_INTEGRITY: RuleCode.TEMPORAL_INTEGRITY,
  PARENT_COVERS_CHILD: RuleCode.PARENT_COVERS_CHILD,

  // 业务规则
  ENTITY_STATUS: RuleCode.ENTITY_STATUS,
  FUTURE_DATE: RuleCode.FUTURE_DATE,
  CROSS_TREE_CONSISTENCY: RuleCode.CROSS_TREE_CONSISTENCY,
} as const;