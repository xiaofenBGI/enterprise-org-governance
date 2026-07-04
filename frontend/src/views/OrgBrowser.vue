<!-- src/views/OrgBrowser.vue -->
<template>
  <div class="org-browser-page">
    <!-- 顶部筛选栏 -->
    <div class="page-card filter-bar">
      <el-row :gutter="16" align="middle">
        <el-col :span="6">
          <div class="filter-item">
            <label>时光机日期:</label>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              :clearable="false"
              @change="handleDateChange"
            />
          </div>
        </el-col>

        <el-col :span="6">
          <div class="filter-item">
            <label>搜索公司:</label>
            <el-input
              v-model="searchKeyword"
              placeholder="输入公司名称或编码"
              clearable
              @clear="handleSearch"
            >
              <template #append>
                <el-button
                  :icon="Search"
                  @click="handleSearch"
                />
              </template>
            </el-input>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="quick-dates">
            <span class="label">快捷选择:</span>
            <el-button-group>
              <el-button
                size="small"
                @click="selectQuickDate('today')"
              >
                今天
              </el-button>
              <el-button
                size="small"
                @click="selectQuickDate('lastMonth')"
              >
                上月
              </el-button>
              <el-button
                size="small"
                @click="selectQuickDate('lastYear')"
              >
                去年
              </el-button>
              <el-button
                size="small"
                @click="selectQuickDate('nextMonth')"
              >
                下月
              </el-button>
            </el-button-group>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 三棵树并列展示 -->
    <div class="trees-container">
      <div class="tree-wrapper">
        <OrgTree
          tree-type="LEGAL"
          :tree-data="legalTree"
          :loading="loading"
          :highlighted-id="highlightedNodeId"
          @node-click="handleNodeClick"
        />
      </div>

      <div class="tree-wrapper">
        <OrgTree
          tree-type="BUDGET"
          :tree-data="budgetTree"
          :loading="loading"
          :highlighted-id="highlightedNodeId"
          @node-click="handleNodeClick"
        />
      </div>

      <div class="tree-wrapper">
        <OrgTree
          tree-type="MANAGEMENT"
          :tree-data="managementTree"
          :loading="loading"
          :highlighted-id="highlightedNodeId"
          @node-click="handleNodeClick"
        />
      </div>
    </div>

    <!-- 底部信息面板 -->
    <div class="page-card info-panel" v-if="selectedEntity">
      <h3 class="section-title">
        实体详情
        <el-tag
          :type="selectedEntity.status === 'ACTIVE' ? 'success' : 'info'"
          size="small"
        >
          {{ selectedEntity.status === 'ACTIVE' ? '正常' : '已注销' }}
        </el-tag>
      </h3>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="公司编码">
          {{ selectedEntity.orgCode }}
        </el-descriptions-item>
        <el-descriptions-item label="公司全称">
          {{ selectedEntity.orgName }}
        </el-descriptions-item>
        <el-descriptions-item label="公司类型">
          {{ selectedEntity.orgType }}
        </el-descriptions-item>
        <el-descriptions-item label="法人代表">
          {{ selectedEntity.legalRep || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册资本">
          {{ selectedEntity.registeredCapital || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="成立日期">
          {{ selectedEntity.establishDate || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 祖先路径 -->
      <div class="ancestor-paths" style="margin-top: 20px;">
        <h4 style="margin-bottom: 12px; font-size: 14px; color: var(--color-text-muted);">
          在各树中的路径:
        </h4>

        <div class="path-item" v-for="(path, treeType) in ancestorPaths" :key="treeType">
          <span class="path-label">{{ TREE_TYPE_LABELS[treeType as TreeType] }}:</span>
          <el-breadcrumb separator=">">
            <el-breadcrumb-item
              v-for="entity in path"
              :key="entity.id"
            >
              {{ entity.orgName }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import OrgTree from '@/components/OrgTree.vue'
import { buildTree, searchTree, getAncestorPath } from '@/utils/treeBuilder'
import { mockEntities, mockRelations } from '@/mock/orgData'
import type { TreeNode, OrgEntity, TreeType } from '@/types'
import { TREE_TYPE_LABELS } from '@/types'

dayjs.extend(isBetween)

const route = useRoute()

const loading = ref(false)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const searchKeyword = ref('')
const highlightedNodeId = ref('')
const selectedEntity = ref<OrgEntity | null>(null)

const legalTree = ref<TreeNode[]>([])
const budgetTree = ref<TreeNode[]>([])
const managementTree = ref<TreeNode[]>([])

const ancestorPaths = ref<Record<string, OrgEntity[]>>({})

onMounted(() => {
  loadTrees()

  // 处理从其他页面跳转过来的高亮参数
  if (route.query.highlight) {
    const entityId = route.query.highlight as string
    highlightedNodeId.value = entityId

    // 查找实体并加载详情
    const entity = mockEntities.find(e => e.id === entityId)
    if (entity) {
      selectedEntity.value = entity
      loadAncestorPaths(entityId)
    }
  }
})

// 监听路由变化
watch(() => route.query.highlight, (newHighlight) => {
  if (newHighlight) {
    const entityId = newHighlight as string
    highlightedNodeId.value = entityId

    const entity = mockEntities.find(e => e.id === entityId)
    if (entity) {
      selectedEntity.value = entity
      loadAncestorPaths(entityId)
    }
  }
})

function loadTrees() {
  loading.value = true

  try {
    legalTree.value = buildTree(
      mockEntities,
      mockRelations,
      'LEGAL',
      selectedDate.value
    )

    budgetTree.value = buildTree(
      mockEntities,
      mockRelations,
      'BUDGET',
      selectedDate.value
    )

    managementTree.value = buildTree(
      mockEntities,
      mockRelations,
      'MANAGEMENT',
      selectedDate.value
    )
  } finally {
    loading.value = false
  }
}

function handleDateChange() {
  loadTrees()
  // 如果之前有选中的实体，重新加载其路径
  if (selectedEntity.value) {
    loadAncestorPaths(selectedEntity.value.id)
  }
}

function handleSearch() {
  if (!searchKeyword.value.trim()) {
    highlightedNodeId.value = ''
    selectedEntity.value = null
    return
  }

  // 在法人树中搜索
  const found = searchTree(legalTree.value, searchKeyword.value)

  if (found) {
    highlightedNodeId.value = found.id
    selectedEntity.value = found.entity
    loadAncestorPaths(found.id)
  } else {
    ElMessage.warning('未找到匹配的公司')
  }
}

function handleNodeClick(node: TreeNode) {
  highlightedNodeId.value = node.id
  selectedEntity.value = node.entity
  loadAncestorPaths(node.id)
}

function loadAncestorPaths(nodeId: string) {
  ancestorPaths.value = {
    LEGAL: getAncestorPath(
      nodeId,
      mockRelations,
      mockEntities,
      'LEGAL',
      selectedDate.value
    ),
    BUDGET: getAncestorPath(
      nodeId,
      mockRelations,
      mockEntities,
      'BUDGET',
      selectedDate.value
    ),
    MANAGEMENT: getAncestorPath(
      nodeId,
      mockRelations,
      mockEntities,
      'MANAGEMENT',
      selectedDate.value
    )
  }
}

function selectQuickDate(type: string) {
  switch (type) {
    case 'today':
      selectedDate.value = dayjs().format('YYYY-MM-DD')
      break
    case 'lastMonth':
      selectedDate.value = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
      break
    case 'lastYear':
      selectedDate.value = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
      break
    case 'nextMonth':
      selectedDate.value = dayjs().add(1, 'month').format('YYYY-MM-DD')
      break
  }
  handleDateChange()
}
</script>

<style scoped lang="scss">
.org-browser-page {
  height: calc(100vh - 108px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-bar {
  flex-shrink: 0;

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
  }

  .quick-dates {
    display: flex;
    align-items: center;
    gap: 12px;

    .label {
      font-size: 14px;
      color: var(--color-text-muted);
    }
  }
}

.trees-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 0;

  .tree-wrapper {
    height: 100%;
    min-height: 0;
  }
}

.info-panel {
  flex-shrink: 0;
  max-height: 300px;
  overflow: auto;

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ancestor-paths {
    .path-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .path-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
        min-width: 80px;
      }
    }
  }
}
</style>