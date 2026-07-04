// frontend/src/utils/validation/snapshot/TreeSnapshot.ts

/**
 * 树节点：某个实体在某棵树中的某个时间段的关系
 */
export interface TreeNode {
  entityId: string;           // 公司编码
  entityName: string;          // 公司名称
  parentId: string | null;     // 父节点ID，根节点为null
  treeType: string;            // 树类型：LEGAL/BUDGET/MGMT
  effectiveDate: string;       // 生效日期 YYYY-MM-DD
  expireDate: string;          // 失效日期 YYYY-MM-DD (9999-12-31表示永久)
  depth?: number;              // 层级深度（根节点为0）
}

/**
 * 树快照：某棵树在某一天的完整状态
 * 核心数据结构，用于所有校验规则
 */
export class TreeSnapshot {
  readonly treeType: string;
  readonly date: string;       // 快照日期 YYYY-MM-DD
  readonly nodes: Map<string, TreeNode>;
  readonly rootId: string | null;

  // 预计算的索引，规则直接用，避免重复遍历
  readonly parentOf: Map<string, string>;           // 子 -> 父
  readonly childrenOf: Map<string, string[]>;       // 父 -> 子列表

  constructor(
    treeType: string,
    date: string,
    nodes: TreeNode[],
    rootId: string | null = null
  ) {
    this.treeType = treeType;
    this.date = date;
    this.rootId = rootId;
    this.nodes = new Map(nodes.map(n => [n.entityId, n]));

    // 预计算索引
    this.parentOf = new Map();
    this.childrenOf = new Map();

    nodes.forEach(node => {
      if (node.parentId) {
        // 构建 子 -> 父 映射
        this.parentOf.set(node.entityId, node.parentId);

        // 构建 父 -> 子列表 映射
        if (!this.childrenOf.has(node.parentId)) {
          this.childrenOf.set(node.parentId, []);
        }
        this.childrenOf.get(node.parentId)!.push(node.entityId);
      }
    });
  }

  /**
   * 获取节点
   */
  getNode(entityId: string): TreeNode | undefined {
    return this.nodes.get(entityId);
  }

  /**
   * 获取父节点ID
   */
  getParent(entityId: string): string | null {
    return this.parentOf.get(entityId) || null;
  }

  /**
   * 获取子节点ID列表
   */
  getChildren(entityId: string): string[] {
    return this.childrenOf.get(entityId) || [];
  }

  /**
   * 获取所有节点ID
   */
  getAllEntityIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * 判断节点是否存在
   */
  hasNode(entityId: string): boolean {
    return this.nodes.has(entityId);
  }

  /**
   * 获取根节点
   */
  getRoot(): TreeNode | null {
    return this.rootId ? this.nodes.get(this.rootId) || null : null;
  }

  /**
   * 获取从某节点到根的路径（用于检测成环）
   */
  getPathToRoot(entityId: string): string[] {
    const path: string[] = [];
    let current: string | null = entityId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) {
        // 检测到环
        return path;
      }
      visited.add(current);
      path.push(current);
      current = this.getParent(current);
    }

    return path;
  }

  /**
   * 计算节点深度（根节点为0）
   */
  getDepth(entityId: string): number {
    const path = this.getPathToRoot(entityId);
    return path.length - 1;
  }
}