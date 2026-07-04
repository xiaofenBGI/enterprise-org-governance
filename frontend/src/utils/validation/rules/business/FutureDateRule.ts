// frontend/src/utils/validation/rules/business/FutureDateRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';

/**
 * 未来日期规则
 *
 * 严重等级：WARN（警告，可配置）
 *
 * 核心逻辑：
 * 生效日期不能太远。防止误操作或不合理的未来变更。
 * 例如：不允许提交"2050年生效"的组织调整。
 *
 * 检测方法：
 * 1. 检查变更的生效日期
 * 2. 计算距离今天的天数
 * 3. 如果超过配置的阈值（例如：3年），记录为警告
 *
 * 应用场景：
 * - 组织调整提交时：警告用户生效日期设置过远
 * - 防止误操作：用户可能不小心选错了年份
 */
export class FutureDateRule extends BaseValidationRule {
  readonly code = RuleCode.FUTURE_DATE;
  readonly category = RuleCategory.BUSINESS;
  readonly defaultSeverity = IssueSeverity.WARN;
  readonly name = '未来日期检查';
  readonly description = '生效日期不能过于遥远';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];

    // 如果不是变更场景，跳过检查
    if (!ctx.change) {
      return issues;
    }

    // 从配置中读取最大未来天数（默认 3 年 = 1095 天）
    const maxFutureDays = ctx.config?.maxFutureDays ?? 1095;

    // 获取今天的日期
    const today = this.getTodayString();

    // 检查变更的生效日期
    const effectiveDate = ctx.change.effectiveDate;
    const daysDiff = this.calculateDaysDiff(today, effectiveDate);

    if (daysDiff > maxFutureDays) {
      issues.push(
        this.createWarnIssue(
          ctx.change.entityId,
          this.formatFutureDateMessage(
            effectiveDate,
            daysDiff,
            maxFutureDays
          ),
          ctx.change.treeType,
          {
            effectiveDate,
            daysDiff,
            maxFutureDays,
            today,
          }
        )
      );
    }

    return issues;
  }

  /**
   * 获取今天的日期字符串（YYYY-MM-DD）
   */
  private getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 计算两个日期之间的天数差
   */
  private calculateDaysDiff(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * 格式化未来日期过远的警告消息
   */
  private formatFutureDateMessage(
    effectiveDate: string,
    daysDiff: number,
    maxFutureDays: number
  ): string {
    const years = Math.floor(daysDiff / 365);
    const maxYears = Math.floor(maxFutureDays / 365);

    return (
      `生效日期 ${effectiveDate} 距今约 ${years} 年（${daysDiff} 天），` +
      `超过了允许的最大未来期限（${maxYears} 年 / ${maxFutureDays} 天）。` +
      `请检查日期是否正确，避免误操作。`
    );
  }
}