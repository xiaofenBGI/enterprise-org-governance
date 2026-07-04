// frontend/src/utils/validation/rules/base/ValidationRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';

/**
 * 规则分类
 */
export enum RuleCategory {
  STRUCTURAL = 'STRUCTURAL',   // 结构规则：无环、单父、层级
  TEMPORAL = 'TEMPORAL',       // 时态规则：时态完整性、父覆盖子
  BUSINESS = 'BUSINESS',       // 业务规则：合理性建议
  CROSS_TREE = 'CROSS_TREE'   // 跨树规则：法人树与管理树一致性
}

/**
 * 校验规则接口
 *
 * 设计原则：
 * 1. 所有规则实现同一个接口
 * 2. 规则是纯函数：输入 Context，输出 Issue[]
 * 3. 规则不查数据库，数据由 Context 提供
 * 4. 新增规则只需实现接口，引擎自动收集调度
 */
export interface ValidationRule {
  /**
   * 规则代码（对应字典中的规则配置）
   */
  readonly code: RuleCode;

  /**
   * 规则分类
   */
  readonly category: RuleCategory;

  /**
   * 默认严重等级（可被字典配置覆盖）
   */
  readonly defaultSeverity: IssueSeverity;

  /**
   * 规则名称（中文）
   */
  readonly name: string;

  /**
   * 规则描述
   */
  readonly description: string;

  /**
   * 执行校验
   * @param ctx 校验上下文
   * @returns 问题列表（空数组表示通过）
   */
  validate(ctx: ValidationContext): Issue[];
}

/**
 * 抽象基类：提供通用方法
 */
export abstract class BaseValidationRule implements ValidationRule {
  abstract readonly code: RuleCode;
  abstract readonly category: RuleCategory;
  abstract readonly defaultSeverity: IssueSeverity;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract validate(ctx: ValidationContext): Issue[];

  /**
   * 创建 Issue 的便捷方法
   */
  protected createIssue(
    entityId: string,
    message: string,
    treeType?: string,
    extra?: Record<string, any>
  ): Issue {
    return {
      ruleCode: this.code,
      severity: this.defaultSeverity,
      entityId,
      treeType,
      message,
      extra,
    };
  }

  /**
   * 创建严重问题
   */
  protected createHardIssue(
    entityId: string,
    message: string,
    treeType?: string,
    extra?: Record<string, any>
  ): Issue {
    return {
      ruleCode: this.code,
      severity: IssueSeverity.HARD,
      entityId,
      treeType,
      message,
      extra,
    };
  }

  /**
   * 创建警告
   */
  protected createWarning(
    entityId: string,
    message: string,
    treeType?: string,
    extra?: Record<string, any>
  ): Issue {
    return {
      ruleCode: this.code,
      severity: IssueSeverity.WARN,
      entityId,
      treeType,
      message,
      extra,
    };
  }

  /**
   * 创建提示
   */
  protected createInfo(
    entityId: string,
    message: string,
    treeType?: string,
    extra?: Record<string, any>
  ): Issue {
    return {
      ruleCode: this.code,
      severity: IssueSeverity.INFO,
      entityId,
      treeType,
      message,
      extra,
    };
  }
}