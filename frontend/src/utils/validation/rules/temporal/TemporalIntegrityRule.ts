// frontend/src/utils/validation/rules/temporal/TemporalIntegrityRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';
import { TreeSnapshot } from '../../snapshot/TreeSnapshot';

/**
 * 时态完整性规则（关键时点算法）
 *
 * 严重等级：HARD（必须修复，否则拦截提交）
 *
 * 核心思想：
 * 不是逐天检查（性能爆炸），而是找出"关键时点"——树形态发生变化的那几天。
 * 只在这些关键时点上校验树的合法性（无环、连通性等）。
 *
 * 关键时点定义：
 * 1. 任何关系的生效日（effectiveDate）
 * 2. 任何关系的失效次日（expireDate + 1天，因为失效次日树形态变了）
 *
 * 算法流程：
 * 1. 收集受影响时间段内所有关系的生效日和失效次日
 * 2. 去重排序，得到关键时点列表（通常十几个时点）
 * 3. 对每个时点，构建该时点的树快照
 * 4. 在该快照上执行基础结构校验（无环、连通性）
 * 5. 如果某个时点的树不合法，记录问题
 *
 * 应用场景：
 * - 组织调整提交时：检查新关系在整个生效期间不会破坏树结构
 * - 审批写库前：二次校验，确保审批期间其他变更没有引入时态冲突
 * - 全量对账：检查历史数据在所有关键时点上是否合法
 */
export class TemporalIntegrityRule extends BaseValidationRule {
  readonly code = RuleCode.TEMPORAL_INTEGRITY;
  readonly category = RuleCategory.TEMPORAL;
  readonly defaultSeverity = IssueSeverity.HARD;
  readonly name = '时态完整性';
  readonly description = '在所有关键时点上，树结构必须合法（无环、连通）';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];
    const checkpoints = ctx.checkpoints;

    if (checkpoints.length === 0) {
      // 没有关键时点，跳过校验
      return issues;
    }

    // 对每个关键时点，检查树的合法性
    for (const checkpoint of checkpoints) {
      const snapshotIssues = this.validateAtCheckpoint(
        checkpoint,
        ctx.afterSnapshot.treeType,
        ctx
      );
      issues.push(...snapshotIssues);
    }

    return issues;
  }

  /**
   * 在某个时点上校验树的合法性
   */
  private validateAtCheckpoint(
    date: string,
    treeType: string,
    ctx: ValidationContext
  ): Issue[] {
    const issues: Issue[] = [];

    // 构建该时点的树快照
    const snapshot = this.buildSnapshotAtDate(date, treeType, ctx);

    // 检查1：无环检测
    const cycleIssues = this.checkNoCycle(snapshot, date);
    issues.push(...cycleIssues);

    // 检查2：连通性检测（所有节点都能回溯到根）
    const orphanIssues = this.checkConnectivity(snapshot, date);
    issues.push(...orphanIssues);

    return issues;
  }

  /**
   * 构建某个日期的树快照
   *
   * 从 afterSnapshot 中筛选出在该日期有效的所有关系
   */
  private buildSnapshotAtDate(
    date: string,
    treeType: string,
    ctx: ValidationContext
  ): TreeSnapshot {
    const allNodes = ctx.afterSnapshot.getAllEntityIds();
    const validNodesAtDate = allNodes.filter(entityId => {
      const node = ctx.afterSnapshot.getNode(entityId);
      if (!node) return false;

      // 判断该节点在该日期是否有效
      return (
        node.effectiveDate <= date &&
        date <= node.expireDate
      );
    });

    const nodesAtDate = validNodesAtDate.map(entityId =>
      ctx.afterSnapshot.getNode(entityId)!
    );

    return new TreeSnapshot(treeType, date, nodesAtDate);
  }

  /**
   * 检查无环
   */
  private checkNoCycle(snapshot: TreeSnapshot, date: string): Issue[] {
    const issues: Issue[] = [];
    const visited = new Set<string>();

    for (const entityId of snapshot.getAllEntityIds()) {
      if (visited.has(entityId)) continue;

      const cycle = this.detectCycleFrom(entityId, snapshot, visited);
      if (cycle.length > 0) {
        issues.push(
          this.createHardIssue(
            entityId,
            `时点 ${date}：检测到环状结构 ${cycle.join(' → ')}`,
            snapshot.treeType,
            { checkpoint: date, cycle }
          )
        );
        break; // 只报告第一个环
      }
    }

    return issues;
  }

  /**
   * DFS 检测成环
   */
  private detectCycleFrom(
    startId: string,
    snapshot: TreeSnapshot,
    globalVisited: Set<string>
  ): string[] {
    const path: string[] = [];
    const pathSet = new Set<string>();
    let current: string | null = startId;

    while (current) {
      if (pathSet.has(current)) {
        // 找到环
        const cycleStart = path.indexOf(current);
        return path.slice(cycleStart);
      }

      globalVisited.add(current);
      pathSet.add(current);
      path.push(current);

      current = snapshot.getParent(current);
    }

    return [];
  }

  /**
   * 检查连通性（所有节点都能回溯到根）
   */
  private checkConnectivity(snapshot: TreeSnapshot, date: string): Issue[] {
    const issues: Issue[] = [];
    const root = snapshot.getRoot();

    if (!root && snapshot.getAllEntityIds().length > 0) {
      // 有节点但没有根节点
      issues.push(
        this.createHardIssue(
          'TREE_ROOT',
          `时点 ${date}：树中没有根节点，所有节点都是孤悬的`,
          snapshot.treeType,
          { checkpoint: date }
        )
      );
      return issues;
    }

    // 检查每个节点是否能回溯到根
    for (const entityId of snapshot.getAllEntityIds()) {
      if (!this.canReachRoot(entityId, snapshot)) {
        issues.push(
          this.createHardIssue(
            entityId,
            `时点 ${date}：节点无法回溯到根，是孤悬节点`,
            snapshot.treeType,
            { checkpoint: date }
          )
        );
      }
    }

    return issues;
  }

  /**
   * 判断节点是否能回溯到根
   */
  private canReachRoot(entityId: string, snapshot: TreeSnapshot): boolean {
    const visited = new Set<string>();
    let current: string | null = entityId;

    while (current) {
      if (visited.has(current)) {
        // 检测到环，无法到达根
        return false;
      }
      visited.add(current);

      const parent = snapshot.getParent(current);
      if (!parent) {
        // 到达根节点
        return true;
      }
      current = parent;
    }

    return true;
  }
}