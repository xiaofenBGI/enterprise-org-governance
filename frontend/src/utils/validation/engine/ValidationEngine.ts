// frontend/src/utils/validation/engine/ValidationEngine.ts

import { ValidationRule } from '../rules/base/ValidationRule';
import { ValidationContext } from './ValidationContext';
import { ValidationResult, Issue } from './ValidationResult';

/**
 * 校验引擎：注册和调度所有规则
 *
 * 核心逻辑只有三行：
 * 1. 遍历所有规则
 * 2. 检查规则是否启用
 * 3. 执行规则并收集结果
 */
export class ValidationEngine {
  private rules: ValidationRule[] = [];

  /**
   * 注册规则
   */
  registerRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * 批量注册规则
   */
  registerRules(rules: ValidationRule[]): void {
    this.rules.push(...rules);
  }

  /**
   * 获取所有已注册规则
   */
  getRules(): ValidationRule[] {
    return [...this.rules];
  }

  /**
   * 运行校验引擎
   * @param ctx 校验上下文
   * @returns 校验结果
   */
  run(ctx: ValidationContext): ValidationResult {
    const result = new ValidationResult();

    for (const rule of this.rules) {
      // 检查规则是否启用（从字典配置读取）
      const ruleConfig = ctx.getRuleConfig(rule.code);
      if (!ruleConfig || !ruleConfig.enabled) {
        continue; // 规则未启用，跳过
      }

      try {
        // 执行规则校验
        const issues = rule.validate(ctx);

        // 用字典配置的级别覆盖代码默认级别
        issues.forEach(issue => {
          issue.severity = ruleConfig.severity;
        });

        // 收集问题
        result.addAll(issues);
      } catch (error) {
        // 规则执行异常时，记录为严重问题
        console.error(`规则 ${rule.code} 执行失败:`, error);
        result.addIssue({
          ruleCode: rule.code,
          severity: 'HARD',
          entityId: 'SYSTEM',
          message: `规则执行异常: ${rule.name}`,
          extra: { error: String(error) },
        });
      }
    }

    return result;
  }

  /**
   * 清空所有规则
   */
  clear(): void {
    this.rules = [];
  }
}