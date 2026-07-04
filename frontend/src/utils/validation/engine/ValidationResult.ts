// frontend/src/utils/validation/engine/ValidationResult.ts

/**
 * 问题严重等级
 */
export enum IssueSeverity {
  HARD = 'HARD',     // 严重：必须修复，否则拦截提交
  WARN = 'WARN',     // 警告：建议修复，确认后可继续
  INFO = 'INFO'      // 提示：仅供参考
}

/**
 * 规则代码（对应字典中的规则配置）
 */
export enum RuleCode {
  // 结构规则
  NO_CYCLE = 'NO_CYCLE',                    // 无环检测
  SINGLE_PARENT = 'SINGLE_PARENT',          // 单父节点
  MAX_DEPTH = 'MAX_DEPTH',                  // 最大层级
  NO_ORPHAN = 'NO_ORPHAN',                  // 孤悬节点

  // 时态规则
  TEMPORAL_INTEGRITY = 'TEMPORAL_INTEGRITY', // 时态完整性
  PARENT_COVERS_CHILD = 'PARENT_COVERS_CHILD', // 父存在期覆盖子
  NO_OVERLAP = 'NO_OVERLAP',                // 无重叠父节点

  // 业务规则
  REASONABLE_DEPTH = 'REASONABLE_DEPTH',    // 层级合理性
  CANCEL_SYNC = 'CANCEL_SYNC'               // 注销联动提醒
}

/**
 * 校验问题
 */
export interface Issue {
  ruleCode: RuleCode;         // 规则代码
  severity: IssueSeverity;    // 严重等级
  entityId: string;           // 涉及哪个公司
  treeType?: string;          // 树类型
  message: string;            // 中文描述，给前端展示
  extra?: Record<string, any>; // 额外信息，比如成环路径
}

/**
 * 校验结果
 */
export class ValidationResult {
  private issues: Issue[] = [];

  /**
   * 添加单个问题
   */
  addIssue(issue: Issue): void {
    this.issues.push(issue);
  }

  /**
   * 添加多个问题
   */
  addAll(issues: Issue[]): void {
    this.issues.push(...issues);
  }

  /**
   * 获取所有问题
   */
  getAllIssues(): Issue[] {
    return [...this.issues];
  }

  /**
   * 是否有严重问题（HARD）
   */
  hasHardFailure(): boolean {
    return this.issues.some(i => i.severity === IssueSeverity.HARD);
  }

  /**
   * 获取严重问题列表
   */
  getHardIssues(): Issue[] {
    return this.issues.filter(i => i.severity === IssueSeverity.HARD);
  }

  /**
   * 获取警告列表
   */
  getWarnings(): Issue[] {
    return this.issues.filter(i => i.severity === IssueSeverity.WARN);
  }

  /**
   * 获取提示列表
   */
  getInfos(): Issue[] {
    return this.issues.filter(i => i.severity === IssueSeverity.INFO);
  }

  /**
   * 获取第一个严重问题的描述
   */
  getFirstHardMessage(): string | null {
    const hardIssue = this.getHardIssues()[0];
    return hardIssue ? hardIssue.message : null;
  }

  /**
   * 是否通过校验（无严重问题）
   */
  isPassed(): boolean {
    return !this.hasHardFailure();
  }

  /**
   * 获取问题数量统计
   */
  getSummary(): { hard: number; warn: number; info: number; total: number } {
    return {
      hard: this.getHardIssues().length,
      warn: this.getWarnings().length,
      info: this.getInfos().length,
      total: this.issues.length
    };
  }

  /**
   * 按规则分组
   */
  groupByRule(): Map<RuleCode, Issue[]> {
    const groups = new Map<RuleCode, Issue[]>();
    this.issues.forEach(issue => {
      if (!groups.has(issue.ruleCode)) {
        groups.set(issue.ruleCode, []);
      }
      groups.get(issue.ruleCode)!.push(issue);
    });
    return groups;
  }
}