<!-- src/components/OrgTree.vue -->
<template>
  <div class="org-tree-container">
    <div class="tree-header">
      <h3 class="tree-title">{{ treeTypeLabel }}</h3>
      <el-button
        size="small"
        text
        @click="expandAll"
      >
        全部展开
      </el-button>
      <el-button
        size="small"
        text
        @click="collapseAll"
      >
        全部收起
      </el-button>
    </div>

    <div class="tree-content" v-loading="loading">
      <el-empty
        v-if="!treeData || treeData.length === 0"
        description="暂无数据"
      />

      <el-tree
        v-else
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :highlight-current="true"
        :expand-on-click-node="false"
        :default-expanded-keys="defaultExpandedKeys"
        node-key="id"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span
            class="tree-node-label"
            :class="{ 'is-highlighted': highlightedId === data.id }"
          >
            <span class="node-name">{{ node.label }}</span>
            <span class="node-code">{{ data.orgCode }}</span>
            <el-tag
              v-if="data.entity.status === 'CANCELLED'"
              size="small"
              type="info"
            >
              已注销
            </el-tag>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ElTree } from 'element-plus'
import type { TreeNode, TreeType } from '@/types'
import { TREE_TYPE_LABELS } from '@/types'

interface Props {
  treeType: TreeType
  treeData: TreeNode[]
  loading?: boolean
  highlightedId?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  highlightedId: ''
})

const emit = defineEmits<{
  nodeClick: [node: TreeNode]
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()

const treeTypeLabel = computed(() => TREE_TYPE_LABELS[props.treeType])

const treeProps = {
  children: 'children',
  label: 'label'
}

const defaultExpandedKeys = ref<string[]>([])

// 监听高亮节点变化,自动展开到该节点
watch(() => props.highlightedId, (newId) => {
  if (newId && treeRef.value) {
    treeRef.value.setCurrentKey(newId)
    // 展开到该节点的路径
    expandToNode(newId)
  }
})

function expandToNode(nodeId: string) {
  if (!treeRef.value) return

  const node = treeRef.value.getNode(nodeId)
  if (node) {
    let parent = node.parent
    while (parent) {
      if (parent.key) {
        defaultExpandedKeys.value.push(parent.key as string)
      }
      parent = parent.parent
    }
  }
}

function expandAll() {
  if (!treeRef.value) return

  const allKeys: string[] = []
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      allKeys.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(props.treeData)

  allKeys.forEach(key => {
    const node = treeRef.value!.getNode(key)
    if (node) {
      node.expanded = true
    }
  })
}

function collapseAll() {
  if (!treeRef.value) return

  const allKeys: string[] = []
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      allKeys.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(props.treeData)

  allKeys.forEach(key => {
    const node = treeRef.value!.getNode(key)
    if (node && node.level > 1) { // 保留根节点展开
      node.expanded = false
    }
  })
}

function handleNodeClick(data: TreeNode) {
  emit('nodeClick', data)
}
</script>

<style scoped lang="scss">
.org-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-white);
  border-radius: 8px;
  border: 1px solid var(--color-border-warm);
  overflow: hidden;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border-warm);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);

  .tree-title {
    font-family: 'Roboto Slab', serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
  }
}

.tree-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &.is-highlighted {
    .node-name {
      color: var(--color-accent);
      font-weight: 600;
    }
  }

  .node-name {
    color: var(--color-text-primary);
  }

  .node-code {
    color: var(--color-text-muted);
    font-size: 12px;
  }
}

:deep(.el-tree-node__content) {
  height: 36px;

  &:hover {
    background: var(--color-accent-tint);
  }
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--color-accent-tint);
}
</style>