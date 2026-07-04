// frontend/src/utils/validation/rules/business/EntityStatusRule.ts

import { ValidationContext } from '../../engine/ValidationContext';
import { Issue, RuleCode, IssueSeverity } from '../../engine/ValidationResult';
import {
  BaseValidationRule,
  RuleCategory
} from '../base/ValidationRule';

/**
 * 实体状态规则
 *
 * 严重等级：WARN（警告，可配置）
 *
 * 核心逻辑：
 * 某些状态的实体不应该作为父节点。
 * 例如：注销状态的公司不应该再有子公司挂在它下面。
 *
 * 状态定义：
 * - ACTIVE: 正常经营
 * - CANCELLED: 已注销
 * - SUSPENDED: 停业
 * - LIQUIDATING: 清算中
 *
 * 检测方法：
 * 1. 找出所有作为父节点的实体
 * 2. 检查这些实体的状态
 * 3. 如果状态不合法（如已注销），记录为警告
 *
 * 应用场景：
 * - 组织调整提交时：警告用户将子公司挂到注销公司下
 * - 全量对账：发现历史数据中的不合理挂靠
 */
export class EntityStatusRule extends BaseValidationRule {
  readonly code = RuleCode.ENTITY_STATUS;
  readonly category = RuleCategory.BUSINESS;
  readonly defaultSeverity = IssueSeverity.WARN;
  readonly name = '实体状态检查';
  readonly description = '注销或异常状态的实体不应作为父节点';

  validate(ctx: ValidationContext): Issue[] {
    const issues: Issue[] = [];
    const snapshot = ctx.afterSnapshot;

    // 从配置中读取禁止作为父节点的状态列表
    const forbiddenStatuses = ctx.config?.forbiddenParentStatuses || [
      'CANCELLED',
      'LIQUIDATING'
    ];

    // 收集所有作为父节点的实体
    const parentIds = new Set<string>();
    snapshot.getAllEntityIds().forEach(entityId => {
      const node = snapshot.getNode(entityId);
      if (node && node.parentId) {
        parentIds.add(node.parentId);
      }
    });

    // 检查每个父节点的状态
    for (const parentId of parentIds) {
      const entity = ctx.entityLookup?.getEntity(parentId);

      if (!entity) {
        // 实体信息不存在，跳过（这应该被其他规则捕获）
        continue;
      }

      if (forbiddenStatuses.includes(entity.status)) {
        const children = this.getChildren(parentId, snapshot);

        issues.push(
          this.createWarnIssue(
            parentId,
            this.formatStatusMessage(
              parentId,
              entity.name,
              entity.status,
              children
            ),
            snapshot.treeType,
            {
              status: entity.status,
              childCount: children.length,
              children,
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * 获取某个父节点的所有子节点
   */
  private getChildren(
    parentId: string,
    snapshot: import('../../snapshot/TreeSnapshot').TreeSnapshot
  ): string[] {
    return snapshot.getAllEntityIds()
      .filter(entityId => {
        const node = snapshot.getNode(entityId);
        return node && node.parentId === parentId;
      });
  }

  /**
   * 格式化状态异常的警告消息
   */
  private formatStatusMessage(
    parentId: string,
    parentName: string,
    status: string,
    children: string[]
  ): string {
    const statusText = this.getStatusText(status);
    const childrenCount = children.length;

    return (
      `节点 ${parentName}(${parentId}) 的状态为 ${statusText}，` +
      `但仍有 ${childrenCount} 个子节点挂在它下面。` +
      `建议将子节点迁移到正常状态的父节点下。`
    );
  }

  /**
   * 获取状态的中文描述
   */
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      ACTIVE: '正常经营',
      CANCELLED: '已注销',
      SUSPENDED: '停业',
      LIQUIDATING: '清算中',
    };
    return statusMap[status] || status;
  }
}

/**
 * 实体信息接口（从 EntityLookup 获取）
 */
export interface EntityInfo {
  entityId: string;
  name: string;
  status: string;
  establishDate?: string;
  cancelDate?: string;
}