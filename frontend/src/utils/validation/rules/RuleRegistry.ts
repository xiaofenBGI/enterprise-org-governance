// frontend/src/utils/validation/rules/RuleRegistry.ts

import { ValidationRule } from './base/ValidationRule';
import { RuleCode } from '../engine/ValidationResult';

// 结构规则
import { NoCycleRule } from './structural/NoCycleRule';
import { SingleParentRule } from './structural/SingleParentRule';
import { NoOrphanRule } from './structural/NoOrphanRule';
import { MaxDepthRule } from './structural/MaxDepthRule';

// 时态规则
import { TemporalIntegrityRule } from './temporal/TemporalIntegrityRule';
import { ParentCoversChildRule } from './temporal/ParentCoversChildRule';

// 业务规则
import { EntityStatusRule } from './business/EntityStatusRule';
import { FutureDateRule } from './business/FutureDateRule';
import { CrossTreeConsistencyRule } from './business/CrossTreeConsistencyRule';

/**
 * 规则注册器
 *
 * 职责：
 * 1. 统一管理所有校验规则
 * 2. 提供规则查询和过滤能力
 * 3. 支持动态启用/禁用规则
 *
 * 设计原则：
 * - 单例模式：全局只有一个注册器实例
 * - 懒加载：规则实例只在第一次使用时创建
 * - 可扩展：新增规则只需在这里注册，不需要修改引擎代码
 */
export class RuleRegistry {
  private static instance: RuleRegistry;
  private rules: Map<RuleCode, ValidationRule>;
  private initialized = false;

  private constructor() {
    this.rules = new Map();
  }

  /**
   * 获取注册器单例
   */
  static getInstance(): RuleRegistry {
    if (!RuleRegistry.instance) {
      RuleRegistry.instance = new RuleRegistry();
    }
    return RuleRegistry.instance;
  }

  /**
   * 初始化所有规则
   */
  private initialize(): void {
    if (this.initialized) {
      return;
    }

    // 注册结构规则
    this.register(new NoCycleRule());
    this.register(new SingleParentRule());
    this.register(new NoOrphanRule());
    this.register(new MaxDepthRule());

    // 注册时态规则
    this.register(new TemporalIntegrityRule());
    this.register(new ParentCoversChildRule());

    // 注册业务规则
    this.register(new EntityStatusRule());
    this.register(new FutureDateRule());
    this.register(new CrossTreeConsistencyRule());

    this.initialized = true;
  }

  /**
   * 注册单个规则
   */
  private register(rule: ValidationRule): void {
    if (this.rules.has(rule.code)) {
      console.warn(`规则 ${rule.code} 已存在，将被覆盖`);
    }
    this.rules.set(rule.code, rule);
  }

  /**
   * 获取所有规则
   */
  getAllRules(): ValidationRule[] {
    this.initialize();
    return Array.from(this.rules.values());
  }

  /**
   * 根据规则代码获取规则
   */
  getRule(code: RuleCode): ValidationRule | undefined {
    this.initialize();
    return this.rules.get(code);
  }

  /**
   * 根据分类获取规则
   */
  getRulesByCategory(category: string): ValidationRule[] {
    this.initialize();
    return Array.from(this.rules.values())
      .filter(rule => rule.category === category);
  }

  /**
   * 根据严重等级获取规则
   */
  getRulesBySeverity(severity: string): ValidationRule[] {
    this.initialize();
    return Array.from(this.rules.values())
      .filter(rule => rule.defaultSeverity === severity);
  }

  /**
   * 检查规则是否存在
   */
  hasRule(code: RuleCode): boolean {
    this.initialize();
    return this.rules.has(code);
  }

  /**
   * 获取规则总数
   */
  getRuleCount(): number {
    this.initialize();
    return this.rules.size;
  }

  /**
   * 重置注册器（主要用于测试）
   */
  reset(): void {
    this.rules.clear();
    this.initialized = false;
  }
}

/**
 * 便捷函数：获取所有规则
 */
export function getAllRules(): ValidationRule[] {
  return RuleRegistry.getInstance().getAllRules();
}

/**
 * 便捷函数：获取单个规则
 */
export function getRule(code: RuleCode): ValidationRule | undefined {
  return RuleRegistry.getInstance().getRule(code);
}

/**
 * 便捷函数：根据分类获取规则
 */
export function getRulesByCategory(category: string): ValidationRule[] {
  return RuleRegistry.getInstance().getRulesByCategory(category);
}