// frontend/src/utils/validation/rules/structural/MaxDepthRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';

/**
 * 最大层级限制规则
 *
 * 严重等级：WARN（警告，可确认后继续）
 *
 * 核心逻辑：
 * 树的层级不能超过配置的最大深度（例如：不超过 10 层）。
 * 层级过深会导致：
 * 1. 前端渲染性能问题（树太深，节点太多）
 * 2. 查询性能问题（回溯路径过长）
 * 3. 业务合理性问题（组织结构过于复杂，管理困难）
 *
 * 层级定义：
 * - 根节点：第 1 层
 * - 根的子节点：第 2 层
 * - 以此类推
 *
 * 检测方法：
 * 对每个节点，沿着父节点向上回溯到根，计算路径长度。
 * 如果长度超过配置的最大深度，记录为警告。
 *
 * 应用场景：
 * - 组织调整提交时：检查变更后是否有节点超深
 * - 审批写库前：二次校验层级
 * - 全量对账：检查历史数据中的深层节点
 */
export class MaxDepthRule extends BaseValidationRule {
  readonly code = RuleCode.MAX_DEPTH;
  readonly category = RuleCategory.STRUCTURAL;
  readonly defaultSeverity = IssueSeverity.WARN;
  readonly name = '最大层级限制';
  readonly description = '树的层级不能超过配置的最大深度';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];
    const snapshot = ctx.afterSnapshot;

    // 从配置中读取最大深度（默认 10 层）
    const maxDepth = ctx.config?.maxDepth ?? 10;

    // 检查每个节点的深度
    for (const entityId of snapshot.getAllEntityIds()) {
      const depth = this.calculateDepth(entityId, snapshot);

      if (depth > maxDepth) {
        const path = this.getPathToRoot(entityId, snapshot);
        issues.push(
          this.createWarnIssue(
            entityId,
            this.formatDepthMessage(entityId, depth, maxDepth, path),
            snapshot.treeType,
            {
              currentDepth: depth,
              maxDepth,
              path,
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * 计算节点的深度（从根到该节点的层数）
   */
  private calculateDepth(
    entityId: string,
    snapshot: import('../../snapshot/TreeSnapshot').TreeSnapshot
  ): number {
    let depth = 1;
    let current: string | null = entityId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) {
        // 检测到环，返回一个很大的深度触发警告
        return 999;
      }
      visited.add(current);

      const parent = snapshot.getParent(current);
      if (parent === null) {
        // 到达根节点
        return depth;
      }

      depth++;
      current = parent;
    }

    return depth;
  }

  /**
   * 获取从节点到根的完整路径（用于错误消息展示）
   */
  private getPathToRoot(
    entityId: string,
    snapshot: import('../../snapshot/TreeSnapshot').TreeSnapshot
  ): string[] {
    const path: string[] = [];
    let current: string | null = entityId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) {
        // 检测到环，终止
        break;
      }
      visited.add(current);
      path.push(current);

      const parent = snapshot.getParent(current);
      if (parent === null) {
        // 到达根节点
        break;
      }
      current = parent;
    }

    // 反转路径，使其从根到叶
    return path.reverse();
  }

  /**
   * 格式化深度超限的警告消息
   */
  private formatDepthMessage(
    entityId: string,
    currentDepth: number,
    maxDepth: number,
    path: string[]
  ): string {
    const pathStr = path.join(' → ');

    return (
      `节点 ${entityId} 的层级为 ${currentDepth}，超过了最大层级限制 ${maxDepth}。` +
      `这可能导致性能问题和管理复杂度过高。` +
      `完整路径：${pathStr}`
    );
  }
}