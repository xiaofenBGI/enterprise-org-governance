// frontend/src/utils/validation/rules/structural/SingleParentRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';
import { TreeNode } from '../../snapshot/TreeSnapshot';

/**
 * 单父节点规则
 *
 * 严重等级：HARD（必须修复，否则拦截提交）
 *
 * 核心逻辑：
 * 同一个节点在同一棵树的同一时点，只能有一个父节点。
 * 不允许出现"公司 A 在 2023-06-01 既挂在 B 下，又挂在 C 下"的情况。
 *
 * 检测方法：
 * 1. 找出所有关键时点（树形态变化的那几天）
 * 2. 对每个时点，检查是否有节点在该时点有多个有效的父节点关系
 * 3. 如果有，记录为严重问题
 *
 * 应用场景：
 * - 组织调整提交时：防止新建的关系与现有关系在时间上重叠
 * - 审批写库前：二次校验，确保审批期间没有引入重叠关系
 * - 全量对账：检查历史数据中是否存在一个节点多父的情况
 */
export class SingleParentRule extends BaseValidationRule {
  readonly code = RuleCode.SINGLE_PARENT;
  readonly category = RuleCategory.STRUCTURAL;
  readonly defaultSeverity = IssueSeverity.HARD;
  readonly name = '单父节点';
  readonly description = '同一节点在同一时点只能有一个父节点';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];
    const checkpoints = ctx.checkpoints;

    if (checkpoints.length === 0) {
      // 没有关键时点，跳过校验
      return issues;
    }

    // 对每个关键时点，检查是否有节点多父
    for (const checkpoint of checkpoints) {
      const multiParentIssues = this.checkMultipleParentsAtDate(
        checkpoint,
        ctx
      );
      issues.push(...multiParentIssues);
    }

    return issues;
  }

  /**
   * 检查某个时点是否有节点存在多个父节点
   */
  private checkMultipleParentsAtDate(
    date: string,
    ctx: ValidationContext
  ): Issue[] {
    const issues: Issue[] = [];
    const snapshot = ctx.afterSnapshot;

    // 收集该时点所有有效的关系
    const validRelations = this.getValidRelationsAtDate(date, ctx);

    // 按子节点分组，检查是否有多个父节点
    const childToParents = new Map<string, TreeNode[]>();

    validRelations.forEach(relation => {
      if (!childToParents.has(relation.entityId)) {
        childToParents.set(relation.entityId, []);
      }
      childToParents.get(relation.entityId)!.push(relation);
    });

    // 检查是否有子节点对应多个父节点
    childToParents.forEach((relations, childId) => {
      if (relations.length > 1) {
        // 找到多个父节点
        const parentIds = relations
          .map(r => r.parentId)
          .filter(p => p !== null);

        issues.push(
          this.createHardIssue(
            childId,
            this.formatMultipleParentsMessage(
              childId,
              relations[0].entityName,
              date,
              parentIds as string[]
            ),
            snapshot.treeType,
            {
              checkpoint: date,
              parentIds,
              relations: relations.map(r => ({
                parentId: r.parentId,
                effectiveDate: r.effectiveDate,
                expireDate: r.expireDate,
              })),
            }
          )
        );
      }
    });

    return issues;
  }

  /**
   * 获取某个日期所有有效的关系
   */
  private getValidRelationsAtDate(
    date: string,
    ctx: ValidationContext
  ): TreeNode[] {
    const snapshot = ctx.afterSnapshot;
    const allNodes = snapshot.getAllEntityIds();

    return allNodes
      .map(entityId => snapshot.getNode(entityId)!)
      .filter(node => {
        // 判断该关系在该日期是否有效
        return (
          node.effectiveDate <= date &&
          date <= node.expireDate
        );
      });
  }

  /**
   * 格式化多父节点的错误消息
   */
  private formatMultipleParentsMessage(
    childId: string,
    childName: string,
    date: string,
    parentIds: string[]
  ): string {
    const parentList = parentIds.join('、');
    return (
      `时点 ${date}：节点 ${childName}(${childId}) ` +
      `同时挂在多个父节点下（${parentList}）。` +
      `同一时点只能有一个父节点，请调整关系的生效期避免重叠。`
    );
  }
}