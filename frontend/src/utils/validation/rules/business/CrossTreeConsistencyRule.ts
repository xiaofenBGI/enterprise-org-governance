// frontend/src/utils/validation/rules/business/CrossTreeConsistencyRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';

/**
 * 跨树一致性规则
 *
 * 严重等级：INFO（信息提示，不阻塞）
 *
 * 核心逻辑：
 * 法人树的父子关系在管理树中也应该存在。
 * 例如：如果 A 公司在法人树中是 B 公司的子公司，
 * 那么在管理树中，A 也应该在 B 的管理范围内（直接或间接）。
 *
 * 这是一条"软提示规则"：
 * - 违反不会阻塞提交
 * - 只是提醒用户可能存在不一致
 * - 有些场景下跨树不一致是合理的（例如：管理权委托给其他公司）
 *
 * 检测方法：
 * 1. 找出法人树中的所有父子关系
 * 2. 对每个关系，检查管理树中是否也存在对应的管理关系
 * 3. 如果不存在，记录为信息提示
 *
 * 应用场景：
 * - 组织调整提交时：提示用户跨树的一致性问题
 * - 全量对账：发现跨树不一致的情况
 */
export class CrossTreeConsistencyRule extends BaseValidationRule {
  readonly code = RuleCode.CROSS_TREE_CONSISTENCY;
  readonly category = RuleCategory.BUSINESS;
  readonly defaultSeverity = IssueSeverity.INFO;
  readonly name = '跨树一致性检查';
  readonly description = '法人树的父子关系在管理树中也应存在';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];

    // 只在法人树变更时检查
    if (ctx.afterSnapshot.treeType !== 'LEGAL') {
      return issues;
    }

    // 从配置中读取是否启用跨树检查
    const enableCrossTreeCheck = ctx.config?.enableCrossTreeCheck ?? true;
    if (!enableCrossTreeCheck) {
      return issues;
    }

    // 获取法人树和管理树的快照
    const legalSnapshot = ctx.afterSnapshot;
    const managementSnapshot = ctx.crossTreeSnapshots?.get('MANAGEMENT');

    if (!managementSnapshot) {
      // 没有管理树快照，跳过检查
      return issues;
    }

    // 检查法人树中的每个父子关系
    for (const entityId of legalSnapshot.getAllEntityIds()) {
      const node = legalSnapshot.getNode(entityId);

      if (!node || !node.parentId) {
        // 根节点或无效节点，跳过
        continue;
      }

      // 检查这个关系在管理树中是否存在
      const hasManagementRelation = this.checkManagementRelation(
        entityId,
        node.parentId,
        managementSnapshot
      );

      if (!hasManagementRelation) {
        issues.push(
          this.createInfoIssue(
            entityId,
            this.formatCrossTreeMessage(
              entityId,
              node.entityName,
              node.parentId
            ),
            legalSnapshot.treeType,
            {
              legalParent: node.parentId,
              managementParent: managementSnapshot.getParent(entityId),
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * 检查子节点在管理树中是否能回溯到法人父节点
   */
  private checkManagementRelation(
    childId: string,
    legalParentId: string,
    managementSnapshot: import('../../snapshot/TreeSnapshot').TreeSnapshot
  ): boolean {
    // 从子节点开始，沿着管理树向上回溯
    let current: string | null = childId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) {
        // 检测到环，终止
        return false;
      }
      visited.add(current);

      // 如果找到了法人父节点，说明存在管理关系
      if (current === legalParentId) {
        return true;
      }

      // 继续向上回溯
      const parent = managementSnapshot.getParent(current);
      if (parent === null) {
        // 到达根节点，没有找到法人父节点
        return false;
      }

      current = parent;
    }

    return false;
  }

  /**
   * 格式化跨树不一致的提示消息
   */
  private formatCrossTreeMessage(
    childId: string,
    childName: string,
    legalParentId: string
  ): string {
    return (
      `节点 ${childName}(${childId}) 在法人树中挂在 ${legalParentId} 下，` +
      `但在管理树中无法回溯到该父节点。` +
      `这可能导致跨树数据不一致。建议检查管理树中的挂靠关系。`
    );
  }
}