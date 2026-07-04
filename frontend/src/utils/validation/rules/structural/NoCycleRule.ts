// frontend/src/utils/validation/rules/structural/NoCycleRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';

/**
 * 无环检测规则（DFS 回溯算法）
 *
 * 严重等级：HARD（必须修复，否则拦截提交）
 *
 * 检测逻辑：
 * 1. 从变更后的快照中，遍历所有节点
 * 2. 对每个节点，沿着父节点向上追溯到根
 * 3. 如果在追溯路径中遇到已访问过的节点，说明成环
 * 4. 记录成环路径，返回问题
 *
 * 应用场景：
 * - 组织调整提交时：预防用户把 A 挂到 B 下，B 又直接或间接挂到 A 下
 * - 审批写库前：二次校验，防止审批期间其他变更导致成环
 * - 全量对账：检测历史数据中是否存在环
 */
export class NoCycleRule extends BaseValidationRule {
  readonly code = RuleCode.NO_CYCLE;
  readonly category = RuleCategory.STRUCTURAL;
  readonly defaultSeverity = IssueSeverity.HARD;
  readonly name = '无环检测';
  readonly description = '组织树中不允许出现环状结构（A 的祖先不能是 A 自己）';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];
    const snapshot = ctx.afterSnapshot; // 检查变更后的快照

    // 遍历所有节点，检测是否成环
    for (const entityId of snapshot.getAllEntityIds()) {
      const cycle = this.detectCycle(entityId, snapshot);

      if (cycle.length > 0) {
        // 发现环，记录问题
        issues.push(
          this.createHardIssue(
            entityId,
            this.formatCycleMessage(cycle),
            snapshot.treeType,
            { cycle }
          )
        );

        // 只报告第一个环，避免重复报告同一个环的不同起点
        break;
      }
    }

    return issues;
  }

  /**
   * DFS 检测成环
   * @param startId 起始节点
   * @param snapshot 树快照
   * @returns 成环路径（空数组表示无环）
   */
  private detectCycle(
    startId: string,
    snapshot: import('../../snapshot/TreeSnapshot').TreeSnapshot
  ): string[] {
    const path: string[] = [];
    const visited = new Set<string>();
    let current: string | null = startId;

    // 沿着父节点向上追溯
    while (current) {
      // 检测到环：当前节点已在路径中
      if (visited.has(current)) {
        // 找到环的起点，截取环路径
        const cycleStartIndex = path.indexOf(current);
        return path.slice(cycleStartIndex);
      }

      // 标记访问
      visited.add(current);
      path.push(current);

      // 继续向上
      current = snapshot.getParent(current);
    }

    // 到达根节点，无环
    return [];
  }

  /**
   * 格式化成环消息
   */
  private formatCycleMessage(cycle: string[]): string {
    const node = cycle[0];
    const cyclePath = [...cycle, cycle[0]].join(' → ');

    return `检测到环状结构：${cyclePath}。节点 ${node} 的祖先链中包含自己，这会导致无限递归。`;
  }
}