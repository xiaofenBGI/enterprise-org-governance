// src/mock/validationRules.ts
import type { ValidationIssue, Severity } from '@/types'

/** Mock 校验规则配置 */
export interface ValidationRuleConfig {
  code: string
  name: string
  severity: Severity
  category: 'STRUCTURAL' | 'TEMPORAL' | 'BUSINESS' | 'CROSSTREE'
  enabled: boolean
  description: string
}

export const mockRuleConfigs: ValidationRuleConfig[] = [
  {
    code: 'SINGLE_PARENT',
    name: '单一父节点',
    severity: 'HARD',
    category: 'STRUCTURAL',
    enabled: true,
    description: '同一时点,每个节点只能有一个父节点'
  },
  {
    code: 'NO_CYCLE',
    name: '无环检测',
    severity: 'HARD',
    category: 'STRUCTURAL',
    enabled: true,
    description: '树中不能存在环路'
  },
  {
    code: 'NO_ORPHAN',
    name: '无孤悬节点',
    severity: 'HARD',
    category: 'STRUCTURAL',
    enabled: true,
    description: '除根节点外,所有节点必须能回溯到根'
  },
  {
    code: 'LEVEL_CONTINUITY',
    name: '层级连续性',
    severity: 'HARD',
    category: 'STRUCTURAL',
    enabled: true,
    description: '子节点层级=父节点层级+1'
  },
  {
    code: 'NO_TEMPORAL_GAP',
    name: '时态连续性',
    severity: 'WARN',
    category: 'TEMPORAL',
    enabled: true,
    description: '节点的有效期不能有间断'
  },
  {
    code: 'NO_TEMPORAL_OVERLAP',
    name: '时态无重叠',
    severity: 'HARD',
    category: 'TEMPORAL',
    enabled: true,
    description: '同一节点的有效期不能重叠'
  },
  {
    code: 'CROSS_TREE_SYNC',
    name: '跨树同步检查',
    severity: 'WARN',
    category: 'CROSSTREE',
    enabled: true,
    description: '注销实体应在所有树中同步终止'
  },
  {
    code: 'LEVEL_THRESHOLD',
    name: '层级深度限制',
    severity: 'WARN',
    category: 'BUSINESS',
    enabled: true,
    description: '组织层级不应超过6层'
  },
  {
    code: 'SPAN_OF_CONTROL',
    name: '管理跨度检查',
    severity: 'INFO',
    category: 'BUSINESS',
    enabled: true,
    description: '单个节点直接子节点不宜超过20个'
  }
]

/** Mock 校验结果生成器 */
export function generateMockValidationIssues(
  hasError: boolean = false
): ValidationIssue[] {
  if (!hasError) {
    return []
  }

  return [
    {
      ruleCode: 'LEVEL_CONTINUITY',
      ruleName: '层级连续性',
      severity: 'HARD',
      category: 'STRUCTURAL',
      message: '子节点层级不连续:期望层级3,实际层级5',
      affectedOrgIds: ['C3'],
      affectedOrgNames: ['广东省3市分公司']
    },
    {
      ruleCode: 'SPAN_OF_CONTROL',
      ruleName: '管理跨度检查',
      severity: 'INFO',
      category: 'BUSINESS',
      message: '广东省公司的直接子节点有25个,超过建议值20',
      affectedOrgIds: ['P1'],
      affectedOrgNames: ['广东省公司']
    }
  ]
}