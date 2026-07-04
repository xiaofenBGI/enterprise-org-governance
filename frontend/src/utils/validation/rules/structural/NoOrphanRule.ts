// frontend/src/utils/validation/rules/structural/NoOrphanRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';

/**
 * 孤悬节点检测规则
 *
 * 严重等级：HARD（必须修复，否则拦截提交）
 *
 * 核心逻辑：
 * 树中的所有节点都必须能回溯到根节点。
 * 如果某个节点无法到达根，说明它是"孤悬节点"——在树中但与主树断开连接。
 *
 * 孤悬节点产生原因：
 * 1. 父节点被移除，但子节点没有重新挂到其他父节点下
 * 2. 关系的时间段设置错误，导致某个时点子节点有效但父节点无效
 * 3. 数据导入时缺失了某些父节点关系
 *
 * 检测方法：
 * 对每个节点，沿着父节点向上回溯：
 * - 如果能到达根节点（parentId 为 null 的节点），则合法
 * - 如果回溯过程中进入了环，无法到达根
 * - 如果父节点不存在，无法到达根
 *
 * 应用场景：
 * - 组织调整提交时：检查变更后是否产生孤悬节点
 * - 审批写库前：二次校验，确保没有孤悬节点
 * - 全量对账：检查历史数据中的孤悬节点
 */
export class NoOrphanRule extends BaseValidationRule {
  readonly code = RuleCode.NO_ORPHAN;
  readonly category = RuleCategory.STRUCTURAL;
  readonly defaultSeverity = IssueSeverity.HARD;
  readonly name = '孤悬节点检测';
  readonly description = '所有节点都必须能回溯到根节点';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];
    const snapshot = ctx.afterSnapshot;

    // 检查是否有根节点
    const root = snapshot.getRoot();
    if (!root && snapshot.getAllEntityIds().length > 0) {
      // 有节点但没有根，所有节点都是孤悬的
      issues.push(
        this.createHardIssue(
          'TREE_ROOT',
          '树中没有根节点，所有节点都无法回溯到根',
          snapshot.treeType
        )
      );
      return issues;
    }

    // 检查每个节点是否能回溯到根
    for (const entityId of snapshot.getAllEntityIds()) {
      const reachability = this.checkReachability(entityId, snapshot);

      if (!reachability.canReachRoot) {
        issues.push(
          this.createHardIssue(
            entityId,
            this.formatOrphanMessage(entityId, reachability),
            snapshot.treeType,
            {
              reason: reachability.reason,
              path: reachability.path,
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * 检查节点是否能到达根
   */
  private checkReachability(
    entityId: string,
    snapshot: import('../../snapshot/TreeSnapshot').TreeSnapshot
  ): ReachabilityResult {
    const path: string[] = [];
    const visited = new Set<string>();
    let current: string | null = entityId;

    while (current) {
      // 检测环
      if (visited.has(current)) {
        return {
          canReachRoot: false,
          reason: 'CYCLE',
          path,
        };
      }

      visited.add(current);
      path.push(current);

      // 获取父节点
      const parent = snapshot.getParent(current);

      if (parent === null) {
        // 到达根节点
        return {
          canReachRoot: true,
          reason: 'SUCCESS',
          path,
        };
      }

      // 检查父节点是否存在
      const parentNode = snapshot.getNode(parent);
      if (!parentNode) {
        return {
          canReachRoot: false,
          reason: 'PARENT_NOT_FOUND',
          path,
          missingParent: parent,
        };
      }

      current = parent;
    }

    // 理论上不应该到这里（current 变为 null 但上面的 parent === null 没触发）
    return {
      canReachRoot: false,
      reason: 'UNKNOWN',
      path,
    };
  }

  /**
   * 格式化孤悬节点错误消息
   */
  private formatOrphanMessage(
    entityId: string,
    reachability: ReachabilityResult
  ): string {
    const pathStr = reachability.path.join(' → ');

    switch (reachability.reason) {
      case 'CYCLE':
        return (
          `节点 ${entityId} 无法回溯到根：回溯路径中存在环 (${pathStr})。` +
          `这说明树结构中存在环状依赖。`
        );

      case 'PARENT_NOT_FOUND':
        return (
          `节点 ${entityId} 无法回溯到根：父节点 ${reachability.missingParent} 不存在。` +
          `回溯路径：${pathStr}。这说明父节点已被移除或从未存在。`
        );

      case 'UNKNOWN':
      default:
        return (
          `节点 ${entityId} 无法回溯到根，原因未知。` +
          `回溯路径：${pathStr}。`
        );
    }
  }
}

/**
 * 可达性检查结果
 */
interface ReachabilityResult {
  canReachRoot: boolean;          // 是否能到达根
  reason: 'SUCCESS' | 'CYCLE' | 'PARENT_NOT_FOUND' | 'UNKNOWN';
  path: string[];                 // 回溯路径
  missingParent?: string;         // 缺失的父节点（如果原因是 PARENT_NOT_FOUND）
}