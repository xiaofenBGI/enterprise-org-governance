<!-- src/components/DiffViewer.vue -->
<template>
  <div class="diff-viewer">
    <!-- 变更统计面板 -->
    <div class="diff-stats">
      <div class="stat-item stat-added">
        <el-icon><CirclePlus /></el-icon>
        <span class="stat-label">新增</span>
        <span class="stat-value">{{ stats.added }}</span>
      </div>
      <div class="stat-item stat-moved">
        <el-icon><Promotion /></el-icon>
        <span class="stat-label">移动</span>
        <span class="stat-value">{{ stats.moved }}</span>
      </div>
      <div class="stat-item stat-removed">
        <el-icon><Remove /></el-icon>
        <span class="stat-label">删除</span>
        <span class="stat-value">{{ stats.removed }}</span>
      </div>
    </div>

    <!-- 左右树形对比 -->
    <div class="diff-trees">
      <!-- 变更前 -->
      <div class="diff-tree-panel">
        <div class="panel-header">
          <h4>变更前</h4>
        </div>
        <div class="panel-body">
          <el-tree
            ref="beforeTreeRef"
            :data="beforeTree"
            :props="treeProps"
            default-expand-all
            node-key="id"
            :highlight-current="false"
          >
            <template #default="{ node, data }">
              <div
                class="tree-node-content"
                :class="{ 'is-highlighted': highlightedNodeId === data.id }"
                @mouseenter="handleNodeHover(data.id)"
                @mouseleave="handleNodeLeave"
              >
                <span class="node-name">{{ data.label }}</span>
                <span class="node-code">{{ data.orgCode }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 变更后 -->
      <div class="diff-tree-panel">
        <div class="panel-header">
          <h4>变更后</h4>
        </div>
        <div class="panel-body">
          <el-tree
            ref="afterTreeRef"
            :data="afterTree"
            :props="treeProps"
            default-expand-all
            node-key="id"
            :highlight-current="false"
          >
            <template #default="{ node, data }">
              <div
                class="tree-node-content"
                :class="{
                  'diff-added': data.diffType === 'ADDED',
                  'diff-removed': data.diffType === 'REMOVED',
                  'diff-moved': data.diffType === 'MOVED',
                  'is-highlighted': highlightedNodeId === data.id
                }"
                @mouseenter="handleNodeHover(data.id)"
                @mouseleave="handleNodeLeave"
              >
                <el-icon v-if="data.diffType === 'ADDED'" class="diff-icon">
                  <CirclePlus />
                </el-icon>
                <el-icon v-else-if="data.diffType === 'REMOVED'" class="diff-icon">
                  <Remove />
                </el-icon>
                <el-icon v-else-if="data.diffType === 'MOVED'" class="diff-icon">
                  <Promotion />
                </el-icon>
                <span class="node-name">{{ data.label }}</span>
                <span class="node-code">{{ data.orgCode }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CirclePlus, Remove, Promotion } from '@element-plus/icons-vue'

/**
 * 树节点数据结构
 */
interface TreeNode {
  id: string
  label: string
  orgCode: string
  diffType?: 'ADDED' | 'REMOVED' | 'MOVED' | 'UNCHANGED'
  children?: TreeNode[]
}

/**
 * Props 定义
 */
interface Props {
  beforeTree: TreeNode[]  // 变更前的树
  afterTree: TreeNode[]   // 变更后的树（带 diffType 标记）
}

const props = defineProps<Props>()

/**
 * el-tree 配置
 */
const treeProps = {
  children: 'children',
  label: 'label'
}

/**
 * 高亮的节点 ID（用于同步高亮）
 */
const highlightedNodeId = ref<string | null>(null)

/**
 * 树引用
 */
const beforeTreeRef = ref()
const afterTreeRef = ref()

/**
 * 计算变更统计
 */
const stats = computed(() => {
  let added = 0
  let moved = 0
  let removed = 0

  const countDiff = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.diffType === 'ADDED') added++
      else if (node.diffType === 'MOVED') moved++
      else if (node.diffType === 'REMOVED') removed++

      if (node.children && node.children.length > 0) {
        countDiff(node.children)
      }
    })
  }

  countDiff(props.afterTree)

  return { added, moved, removed }
})

/**
 * 鼠标悬停处理 - 同步高亮左右树
 */
function handleNodeHover(nodeId: string) {
  highlightedNodeId.value = nodeId
}

/**
 * 鼠标离开处理
 */
function handleNodeLeave() {
  highlightedNodeId.value = null
}
</script>

<style scoped lang="scss">
.diff-viewer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* 统计面板 */
.diff-stats {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #FBF7EF;
  border-radius: 12px;
  border: 1px solid #E2D9C8;

  .stat-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #FFFFFF;
    border-radius: 8px;
    border: 1px solid #E2D9C8;

    .el-icon {
      font-size: 20px;
    }

    .stat-label {
      font-size: 14px;
      color: #8A8A80;
    }

    .stat-value {
      margin-left: auto;
      font-size: 20px;
      font-weight: 700;
      font-family: 'DM Serif Display', serif;
    }

    &.stat-added {
      .el-icon {
        color: #67c23a;
      }
      .stat-value {
        color: #67c23a;
      }
    }

    &.stat-moved {
      .el-icon {
        color: #C8853F;
      }
      .stat-value {
        color: #C8853F;
      }
    }

    &.stat-removed {
      .el-icon {
        color: #f56c6c;
      }
      .stat-value {
        color: #f56c6c;
      }
    }
  }
}

/* 树形对比区域 */
.diff-trees {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 0;
}

.diff-tree-panel {
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2D9C8;
  overflow: hidden;

  .panel-header {
    padding: 16px 20px;
    background: #F6F1E8;
    border-bottom: 2px solid #C8853F;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      font-family: 'DM Serif Display', serif;
      color: #1F2421;
    }
  }

  .panel-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
}

/* 树节点样式 */
.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  .diff-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .node-name {
    font-size: 14px;
    color: #1F2421;
    font-weight: 500;
  }

  .node-code {
    font-size: 12px;
    color: #8A8A80;
    margin-left: auto;
  }

  /* 高亮状态（鼠标悬停同步） */
  &.is-highlighted {
    background: #F0E3D0;
    box-shadow: 0 0 0 2px #C8853F;
  }

  /* 新增节点 */
  &.diff-added {
    background: #f0f9ff;
    border-left: 3px solid #67c23a;

    .diff-icon {
      color: #67c23a;
    }

    .node-name {
      color: #67c23a;
      font-weight: 600;
    }
  }

  /* 移动节点 */
  &.diff-moved {
    background: #fef5e7;
    border-left: 3px solid #C8853F;

    .diff-icon {
      color: #C8853F;
    }

    .node-name {
      color: #C8853F;
      font-weight: 600;
    }
  }

  /* 删除节点 */
  &.diff-removed {
    background: #fef0f0;
    border-left: 3px solid #f56c6c;
    text-decoration: line-through;
    opacity: 0.7;

    .diff-icon {
      color: #f56c6c;
    }

    .node-name {
      color: #f56c6c;
      font-weight: 600;
    }
  }

  /* 鼠标悬停 */
  &:hover {
    background: #F0E3D0;
    cursor: pointer;
  }
}

/* 滚动条样式 */
.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: #F6F1E8;
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb {
  background: #C8853F;
  border-radius: 3px;

  &:hover {
    background: #A86B2C;
  }
}
</style>