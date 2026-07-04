<!-- src/views/Reconciliation.vue -->
<template>
  <div class="reconciliation-page">
    <!-- 对账概览卡片 -->
    <div class="page-card overview-section">
      <h3>数据健康分</h3>
      <div class="health-score">
        <el-progress
          type="dashboard"
          :percentage="healthScore"
          :color="getScoreColor(healthScore)"
          :width="180"
        >
          <template #default="{ percentage }">
            <span class="score-number">{{ percentage }}</span>
            <span class="score-label">分</span>
          </template>
        </el-progress>
      </div>

      <el-row :gutter="20" style="margin-top: 24px">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalEntities }}</div>
            <div class="stat-label">实体总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card critical">
            <div class="stat-value">{{ stats.criticalIssues }}</div>
            <div class="stat-label">严重问题</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card warning">
            <div class="stat-value">{{ stats.warnings }}</div>
            <div class="stat-label">警告</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card info">
            <div class="stat-value">{{ stats.infos }}</div>
            <div class="stat-label">提示</div>
          </div>
        </el-col>
      </el-row>

      <div style="margin-top: 20px; text-align: right">
        <el-button type="primary" @click="showTriggerDialog = true">
          手动触发对账
        </el-button>
        <el-button @click="loadReport">刷新报告</el-button>
      </div>
    </div>

    <!-- 差异分类汇总 -->
    <div class="page-card categories-section">
      <h3>差异分类汇总</h3>

      <div class="category-group">
        <h4>数据源差异</h4>
        <el-row :gutter="16">
          <el-col :span="8">
            <div
              class="category-item warning"
              @click="viewDetails('SOURCE_EXTRA')"
            >
              <div class="category-icon">⚠️</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.sourceExtra }}</div>
                <div class="category-name">源头有你没有</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div
              class="category-item warning"
              @click="viewDetails('LOCAL_EXTRA')"
            >
              <div class="category-icon">⚠️</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.localExtra }}</div>
                <div class="category-name">你有源头没有</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div
              class="category-item warning"
              @click="viewDetails('INFO_MISMATCH')"
            >
              <div class="category-icon">⚠️</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.infoMismatch }}</div>
                <div class="category-name">信息不一致</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="category-group">
        <h4>树结构健康</h4>
        <el-row :gutter="16">
          <el-col :span="8">
            <div
              class="category-item critical"
              @click="viewDetails('ORPHAN_NODE')"
            >
              <div class="category-icon">❌</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.orphanNode }}</div>
                <div class="category-name">孤悬节点</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div
              class="category-item critical"
              @click="viewDetails('TEMPORAL_ISSUE')"
            >
              <div class="category-icon">❌</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.temporalIssue }}</div>
                <div class="category-name">时态断裂/重叠</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div
              class="category-item warning"
              @click="viewDetails('FLOATING_ENTITY')"
            >
              <div class="category-icon">⚠️</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.floatingEntity }}</div>
                <div class="category-name">游离实体</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="category-group">
        <h4>跨树差异（提醒）</h4>
        <el-row :gutter="16">
          <el-col :span="12">
            <div
              class="category-item info"
              @click="viewDetails('CANCEL_NOT_SYNCED')"
            >
              <div class="category-icon">ℹ️</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.cancelNotSynced }}</div>
                <div class="category-name">注销未联动</div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div
              class="category-item info"
              @click="viewDetails('TREE_UNIQUE')"
            >
              <div class="category-icon">ℹ️</div>
              <div class="category-content">
                <div class="category-count">{{ diffCounts.treeUnique }}</div>
                <div class="category-name">单树独有</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 差异明细对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="currentCategoryName"
      width="1000px"
      top="5vh"
    >
      <el-table :data="detailList" stripe v-loading="detailLoading">
        <el-table-column prop="entityCode" label="公司编码" width="120" />
        <el-table-column prop="entityName" label="公司名称" min-width="200" />
        <el-table-column prop="description" label="问题描述" min-width="250" />
        <el-table-column label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.severity === 'CRITICAL'
                  ? 'danger'
                  : row.severity === 'WARN'
                  ? 'warning'
                  : 'info'
              "
              size="small"
            >
              {{
                row.severity === 'CRITICAL'
                  ? '严重'
                  : row.severity === 'WARN'
                  ? '警告'
                  : '提示'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="discoveredAt" label="发现日期" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.actionStatus === 'RESOLVED'
                  ? 'success'
                  : row.actionStatus === 'IGNORED'
                  ? 'info'
                  : ''
              "
              size="small"
            >
              {{
                row.actionStatus === 'OPEN'
                  ? '待处理'
                  : row.actionStatus === 'RESOLVED'
                  ? '已处理'
                  : '已忽略'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.actionStatus === 'OPEN'"
              type="primary"
              size="small"
              @click="syncFromSource(row)"
            >
              立即同步
            </el-button>
            <el-button
              v-if="row.actionStatus === 'OPEN'"
              size="small"
              @click="createTicket(row)"
            >
              转工单
            </el-button>
            <el-button
              v-if="row.actionStatus === 'OPEN'"
              size="small"
              @click="ignoreIssue(row)"
            >
              忽略
            </el-button>
            <el-button size="small" @click="goToFix(row)">去修复</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="detailPagination.page"
        v-model:page-size="detailPagination.size"
        :total="detailPagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: center"
        @size-change="loadDetailList"
        @current-change="loadDetailList"
      />
    </el-dialog>

    <!-- 手动触发对账对话框 -->
    <el-dialog
      v-model="showTriggerDialog"
      title="手动触发对账"
      width="500px"
    >
      <el-form :model="triggerForm" label-width="100px">
        <el-form-item label="对账日期">
          <el-date-picker
            v-model="triggerForm.reconDate"
            type="date"
            placeholder="选择对账日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="对账范围">
          <el-radio-group v-model="triggerForm.scope">
            <el-radio label="ALL">全量对账</el-radio>
            <el-radio label="LEGAL">仅法人树</el-radio>
            <el-radio label="BUDGET">仅预算树</el-radio>
            <el-radio label="MANAGEMENT">仅管理树</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-alert
          title="提示：大数据量对账可能需要较长时间，请耐心等待"
          type="info"
          :closable="false"
        />
      </el-form>

      <template #footer>
        <el-button @click="showTriggerDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="triggerReconciliation"
          :loading="triggering"
        >
          开始对账
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()

const healthScore = ref(87)
const showDetailDialog = ref(false)
const showTriggerDialog = ref(false)
const detailLoading = ref(false)
const triggering = ref(false)
const currentCategory = ref('')
const currentCategoryName = ref('')

const stats = reactive({
  totalEntities: 245,
  criticalIssues: 5,
  warnings: 47,
  infos: 19
})

const diffCounts = reactive({
  sourceExtra: 12,
  localExtra: 8,
  infoMismatch: 19,
  orphanNode: 2,
  temporalIssue: 3,
  floatingEntity: 5,
  cancelNotSynced: 4,
  treeUnique: 15
})

const triggerForm = reactive({
  reconDate: new Date(),
  scope: 'ALL'
})

const detailPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const detailList = ref<any[]>([])

const CATEGORY_NAMES: Record<string, string> = {
  SOURCE_EXTRA: '源头有你没有',
  LOCAL_EXTRA: '你有源头没有',
  INFO_MISMATCH: '信息不一致',
  ORPHAN_NODE: '孤悬节点',
  TEMPORAL_ISSUE: '时态断裂/重叠',
  FLOATING_ENTITY: '游离实体',
  CANCEL_NOT_SYNCED: '注销未联动',
  TREE_UNIQUE: '单树独有'
}

onMounted(() => {
  loadReport()
})

function getScoreColor(score: number) {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#e6a23c'
  return '#f56c6c'
}

function loadReport() {
  // Mock: 加载最新对账报告
  ElMessage.success('对账报告已刷新')
}

function viewDetails(category: string) {
  currentCategory.value = category
  currentCategoryName.value = CATEGORY_NAMES[category]
  detailPagination.page = 1
  showDetailDialog.value = true
  loadDetailList()
}

function loadDetailList() {
  detailLoading.value = true

  // Mock 数据
  setTimeout(() => {
    const mockDetails = [
      {
        entityCode: 'COM20230101',
        entityName: '华南分公司',
        description: '源头系统存在，但本地未同步',
        severity: 'WARN',
        discoveredAt: '2024-01-15',
        actionStatus: 'OPEN'
      },
      {
        entityCode: 'COM20230102',
        entityName: '东北办事处',
        description: '公司名称不一致：源头为"东北办事处"，本地为"东北分公司"',
        severity: 'WARN',
        discoveredAt: '2024-01-15',
        actionStatus: 'OPEN'
      }
    ]

    detailList.value = mockDetails
    detailPagination.total = mockDetails.length
    detailLoading.value = false
  }, 300)
}

function syncFromSource(row: any) {
  ElMessageBox.confirm(
    `确认从源头同步"${row.entityName}"的数据？本地数据将被覆盖。`,
    '确认同步',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage.success('同步成功')
      loadDetailList()
    })
    .catch(() => {})
}

function createTicket(row: any) {
  ElMessage.success('问题工单已创建')
  loadDetailList()
}

function ignoreIssue(row: any) {
  ElMessageBox.prompt('请输入忽略原因', '忽略差异', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入忽略原因'
  })
    .then(() => {
      ElMessage.success('已标记为忽略')
      loadDetailList()
    })
    .catch(() => {})
}

function goToFix(row: any) {
  router.push({
    path: '/org-adjustment',
    query: { entityId: row.entityCode }
  })
}

function triggerReconciliation() {
  triggering.value = true

  setTimeout(() => {
    ElMessage.success('对账任务已启动，请稍后查看报告')
    triggering.value = false
    showTriggerDialog.value = false
    loadReport()
  }, 1500)
}
</script>

<style scoped lang="scss">
.reconciliation-page {
  height: calc(100vh - 108px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.overview-section {
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .health-score {
    display: flex;
    justify-content: center;
    padding: 20px 0;

    .score-number {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .score-label {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-left: 4px;
    }
  }

  .stat-card {
    text-align: center;
    padding: 20px;
    background: var(--color-surface);
    border-radius: 8px;
    border: 1px solid var(--color-border);

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    &.critical .stat-value {
      color: #f56c6c;
    }

    &.warning .stat-value {
      color: #e6a23c;
    }

    &.info .stat-value {
      color: #909399;
    }
  }
}

.categories-section {
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .category-group {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 12px;
    }
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--color-surface);
    border-radius: 8px;
    border: 2px solid var(--color-border);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .category-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .category-content {
      flex: 1;

      .category-count {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .category-name {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
    }

    &.critical {
      border-color: rgba(245, 108, 108, 0.3);
      background: rgba(245, 108, 108, 0.05);

      .category-count {
        color: #f56c6c;
      }
    }

    &.warning {
      border-color: rgba(230, 162, 60, 0.3);
      background: rgba(230, 162, 60, 0.05);

      .category-count {
        color: #e6a23c;
      }
    }

    &.info {
      border-color: rgba(144, 147, 153, 0.3);
      background: rgba(144, 147, 153, 0.05);

      .category-count {
        color: #909399;
      }
    }
  }
}
</style>