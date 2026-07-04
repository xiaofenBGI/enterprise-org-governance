// frontend/src/utils/validation/rules/temporal/ParentCoversChildRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';
import { TreeNode } from '../../snapshot/TreeSnapshot';

/**
 * 日期区间（用于计算覆盖关系）
 */
interface DateRange {
  start: string;  // YYYY-MM-DD
  end: string;    // YYYY-MM-DD
}

/**
 * 父存在期覆盖子存在期规则
 *
 * 严重等级：HARD（必须修复，否则拦截提交）
 *
 * 核心逻辑：
 * 子节点挂在父下面的时间段，必须完全落在父节点自己存在的时间段内。
 *
 * 时空矛盾示例：
 * - 子公司关系生效期：2020-01-01 ~ 2025-12-31
 * - 父公司在本树的存在期：2021-01-01 ~ 2024-12-31
 * 结果：子公司在 2020 年就挂到父下面了，但父公司 2021 年才在树中出现 ❌
 *
 * 父节点的"存在期"定义：
 * 它作为子节点的所有关系区间的并集（因为父节点也可能有多段关系）
 *
 * 应用场景：
 * - 组织调整提交时：检查新建的子关系是否超出父节点的存在期
 * - 审批写库前：二次校验，防止父节点的存在期在审批期间被缩短
 */
export class ParentCoversChildRule extends BaseValidationRule {
  readonly code = RuleCode.PARENT_COVERS_CHILD;
  readonly category = RuleCategory.TEMPORAL;
  readonly defaultSeverity = IssueSeverity.HARD;
  readonly name = '父存在期覆盖子';
  readonly description = '子节点的生效期必须完全落在父节点的存在期内';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];

    // 如果是移除操作，不需要检查父覆盖子
    if (ctx.change?.changeType === 'REMOVE') {
      return issues;
    }

    // 获取所有需要检查的子关系
    const childRelations = this.getChildRelationsToCheck(ctx);

    for (const childRelation of childRelations) {
      const parentId = childRelation.parentId;
      if (!parentId) {
        // 根节点，跳过
        continue;
      }

      // 计算父节点在本树中的存在期
      const parentLifespan = this.getEntityLifespanInTree(
        parentId,
        childRelation.treeType,
        ctx
      );

      if (!parentLifespan) {
        // 父节点在树中不存在（这应该被其他规则捕获）
        continue;
      }

      // 子关系的生效期
      const childRange: DateRange = {
        start: childRelation.effectiveDate,
        end: childRelation.expireDate,
      };

      // 检查父存在期是否覆盖子关系期
      if (!this.covers(parentLifespan, childRange)) {
        issues.push(
          this.createHardIssue(
            childRelation.entityId,
            this.formatCoverageMessage(
              childRelation.entityId,
              childRelation.entityName,
              parentId,
              parentLifespan,
              childRange
            ),
            childRelation.treeType,
            {
              parentId,
              parentLifespan,
              childRange,
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * 获取需要检查的子关系列表
   *
   * - 如果是变更场景：只检查本次新建/修改的关系
   * - 如果是全量校验：检查所有关系
   */
  private getChildRelationsToCheck(ctx: ValidationContext): TreeNode[] {
    if (ctx.isFullScan) {
      // 全量校验：检查所有节点
      return ctx.afterSnapshot.getAllEntityIds()
        .map(id => ctx.afterSnapshot.getNode(id))
        .filter(node => node !== undefined) as TreeNode[];
    }

    // 变更场景：只检查变更涉及的节点
    if (!ctx.change) {
      return [];
    }

    const changedNode = ctx.afterSnapshot.getNode(ctx.change.entityId);
    return changedNode ? [changedNode] : [];
  }

  /**
   * 计算某个实体在某棵树中的存在期
   *
   * 存在期 = 该实体作为子节点的所有关系区间的并集
   *
   * 例如：
   * - 关系1：2020-01-01 ~ 2021-12-31，父节点 A
   * - 关系2：2023-01-01 ~ 2025-12-31，父节点 B
   * 存在期 = 2020-01-01 ~ 2025-12-31（区间并集）
   */
  private getEntityLifespanInTree(
    entityId: string,
    treeType: string,
    ctx: ValidationContext
  ): DateRange | null {
    const snapshot = ctx.afterSnapshot;

    // 收集该实体的所有关系（作为子节点）
    const relations: TreeNode[] = [];

    // 从快照中找到该实体的所有历史关系
    // 注意：快照只包含某个时点的数据，这里需要从 Context 获取完整的时间线
    // 简化处理：只从快照中获取当前关系
    const node = snapshot.getNode(entityId);
    if (node) {
      relations.push(node);
    }

    if (relations.length === 0) {
      return null;
    }

    // 计算区间并集
    return this.mergeRanges(
      relations.map(r => ({
        start: r.effectiveDate,
        end: r.expireDate,
      }))
    );
  }

  /**
   * 合并多个日期区间为一个最大区间（取并集的外包络）
   */
  private mergeRanges(ranges: DateRange[]): DateRange {
    if (ranges.length === 0) {
      throw new Error('Cannot merge empty ranges');
    }

    let minStart = ranges[0].start;
    let maxEnd = ranges[0].end;

    for (const range of ranges) {
      if (range.start < minStart) {
        minStart = range.start;
      }
      if (range.end > maxEnd) {
        maxEnd = range.end;
      }
    }

    return { start: minStart, end: maxEnd };
  }

  /**
   * 判断父区间是否完全覆盖子区间
   *
   * 覆盖条件：parent.start <= child.start && child.end <= parent.end
   */
  private covers(parent: DateRange, child: DateRange): boolean {
    return parent.start <= child.start && child.end <= parent.end;
  }

  /**
   * 格式化覆盖失败的错误消息
   */
  private formatCoverageMessage(
    childId: string,
    childName: string,
    parentId: string,
    parentLifespan: DateRange,
    childRange: DateRange
  ): string {
    return (
      `节点 ${childName}(${childId}) 的关系生效期 ` +
      `(${childRange.start} ~ ${childRange.end}) ` +
      `超出了父节点 ${parentId} 在本树的存在期 ` +
      `(${parentLifespan.start} ~ ${parentLifespan.end})。` +
      `这会导致子节点在父节点不存在时就挂在父下面，产生时空矛盾。`
    );
  }
}