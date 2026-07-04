<!-- src/views/OrgAdjustment.vue -->



<template>
  <div class="org-adjustment-page">
    <!-- 顶部操作栏 -->
    <div class="page-card action-bar">
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleCreateNew"
      >
        发起组织调整
      </el-button>
    </div>

    <!-- 待审批列表 -->
    <div class="page-card pending-list">
      <h3 class="section-title">待审批变更</h3>

      <el-table
        :data="pendingRequests"
        stripe
        v-loading="loading"
      >
        <el-table-column prop="targetOrgName" label="目标公司" width="200" />
        <el-table-column label="树类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ TREE_TYPE_LABELS[row.treeType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变更类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTag(row.operationType)" size="small">
              {{ getOperationTypeLabel(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="变更原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="effectiveDate" label="生效日期" width="110" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="appliedAt" label="申请时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleApprove(row)"
            >
              审批
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 发起变更对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发起组织调整"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="newRequest"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
      >
        <el-form-item label="树类型" prop="treeType">
          <el-radio-group v-model="newRequest.treeType">
            <el-radio label="LEGAL">法人树</el-radio>
            <el-radio label="BUDGET">预算树</el-radio>
            <el-radio label="MANAGEMENT">管理树</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="变更类型" prop="operationType">
          <el-radio-group v-model="newRequest.operationType" @change="handleOperationTypeChange">
            <el-radio label="TRANSFER">转移</el-radio>
            <el-radio label="PROMOTE">提级</el-radio>
            <el-radio label="ADD">新增</el-radio>
            <el-radio label="REMOVE">移除</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标公司" prop="targetOrgId">
          <el-select
            v-model="newRequest.targetOrgId"
            placeholder="请选择目标公司"
            filterable
            style="width: 100%"
            @change="handleTargetOrgChange"
          >
            <el-option
              v-for="entity in mockEntities"
              :key="entity.id"
              :label="`${entity.orgName} (${entity.orgCode})`"
              :value="entity.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="needParentSelect"
          label="新父节点"
          prop="newParentId"
        >
          <el-select
            v-model="newRequest.newParentId"
            placeholder="请选择新父节点"
            filterable
            style="width: 100%"
          >
            <el-option label="移至根节点" :value="null" />
            <el-option
              v-for="entity in availableParents"
              :key="entity.id"
              :label="`${entity.orgName} (${entity.orgCode})`"
              :value="entity.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker
            v-model="newRequest.effectiveDate"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
            :clearable="false"
          />
        </el-form-item>

        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="newRequest.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入变更原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="handlePreview"
          :loading="loadingPreview"
        >
          预览变更
        </el-button>
      </template>
    </el-dialog>


<!-- Diff 预览对话框 -->
<el-dialog
  v-model="showPreviewDialog"
  title="变更预览"
  width="90%"
  :close-on-click-modal="false"
  @close="handlePreviewClose"
>


  <div class="preview-container" v-if="diffPreview">
    <!-- 使用 ValidationResult 组件 -->
    <ValidationResult :validation-result="validationResult" />

    <!-- 使用 DiffViewer 组件替换原有的 diff-section -->
    <DiffViewer
      :before-tree="diffPreview.before"
      :after-tree="diffPreview.after"
    />
  </div>

  <template #footer>
    <el-button @click="showPreviewDialog = false">取消</el-button>
    <el-button
      type="primary"
      @click="handleSubmit"
      :loading="loadingSubmit"
      :disabled="validationResult?.hasHardFailure"
    >
      提交申请
    </el-button>
  </template>
</el-dialog>


<!-- 审批对话框 -->
<el-dialog
  v-model="showApproveDialog"
  title="审批变更申请"
  width="80%"
  :close-on-click-modal="false"
>
  <div v-if="currentApprovalRequest">
    <!-- 申请信息 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="目标公司">
        {{ currentApprovalRequest.targetOrgName }}
      </el-descriptions-item>
      <el-descriptions-item label="树类型">
        <el-tag size="small">{{ TREE_TYPE_LABELS[currentApprovalRequest.treeType] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="变更类型">
        <el-tag :type="getOperationTypeTag(currentApprovalRequest.operationType)" size="small">
          {{ getOperationTypeLabel(currentApprovalRequest.operationType) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="生效日期">
        {{ currentApprovalRequest.effectiveDate }}
      </el-descriptions-item>
      <el-descriptions-item label="申请人">
        {{ currentApprovalRequest.applicant }}
      </el-descriptions-item>
      <el-descriptions-item label="申请时间">
        {{ currentApprovalRequest.appliedAt }}
      </el-descriptions-item>
      <el-descriptions-item label="变更原因" :span="2">
        {{ currentApprovalRequest.reason }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 实时校验结果 -->
    <div class="approval-validation">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <h4 style="margin: 0;">实时校验结果</h4>
        <el-button
          size="small"
          :icon="Refresh"
          @click="revalidateApproval"
          :loading="loadingApprovalValidation"
        >
          重新校验
        </el-button>
      </div>

      <!-- ✅ 使用 ValidationResult 组件替换原来的内联代码 -->
      <ValidationResult
        :validation-result="approvalValidation"
        :show-title="false"
      />
    </div>
  </div>

  <template #footer>
    <el-button @click="showApproveDialog = false">取消</el-button>
    <el-button
      type="danger"
      @click="handleReject(currentApprovalRequest!)"
    >
      驳回
    </el-button>
    <el-button
      type="primary"
      @click="confirmApprove"
      :disabled="approvalValidation?.hasHardFailure"
    >
      通过
    </el-button>
  </template>
</el-dialog>


    <!-- 驳回原因对话框 -->
    <el-dialog
      v-model="showRejectDialog"
      title="驳回原因"
      width="500px"
    >
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入驳回原因"
      />

      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmReject"
        >
          确认驳回
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import ValidationResult from '@/components/ValidationResult.vue'
import DiffViewer from '@/components/DiffViewer.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Refresh
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { mockEntities, mockRelations } from '@/mock/orgData'
import { generateMockValidationIssues } from '@/mock/validationRules'
import { buildTree } from '@/utils/treeBuilder'
import type {
  ChangeRequest,
  ChangeOperationType,
  TreeType,
  ValidationResultType,
  OrgEntity
} from '@/types'
import { TREE_TYPE_LABELS } from '@/types'

const loading = ref(false)
const loadingPreview = ref(false)
const loadingSubmit = ref(false)
const loadingApprovalValidation = ref(false)
const showCreateDialog = ref(false)
const showPreviewDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)

const formRef = ref<FormInstance>()

const pendingRequests = ref<ChangeRequest[]>([])
const diffPreview = ref<any>(null)
const validationResult = ref<ValidationResultType | null>(null)
const currentApprovalRequest = ref<ChangeRequest | null>(null)
const approvalValidation = ref<ValidationResultType | null>(null)
const rejectReason = ref('')

const newRequest = reactive({
  treeType: 'LEGAL' as TreeType,
  operationType: 'TRANSFER' as ChangeOperationType,
  targetOrgId: '',
  targetOrgName: '',
  oldParentId: undefined as string | undefined,
  newParentId: undefined as string | undefined,
  effectiveDate: dayjs().format('YYYY-MM-DD'),
  reason: ''
})

const formRules: FormRules = {
  treeType: [{ required: true, message: '请选择树类型', trigger: 'change' }],
  operationType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
  targetOrgId: [{ required: true, message: '请选择目标公司', trigger: 'change' }],
  newParentId: [{ required: true, message: '请选择新父节点', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入变更原因', trigger: 'blur' }]
}

const needParentSelect = computed(() => {
  return ['TRANSFER', 'PROMOTE', 'ADD'].includes(newRequest.operationType)
})

const availableParents = computed(() => {
  // 过滤掉目标公司自己
  return mockEntities.filter(e => e.id !== newRequest.targetOrgId)
})

onMounted(() => {
  loadPendingRequests()
})

function loadPendingRequests() {
  loading.value = true

  // Mock: 加载待审批列表
  setTimeout(() => {
    pendingRequests.value = [
      {
        id: '1',
        treeType: 'LEGAL',
        operationType: 'TRANSFER',
        targetOrgId: 'C10',
        targetOrgName: '江苏省10市分公司',
        oldParentId: 'P2',
        newParentId: 'P1',
        effectiveDate: '2025-06-01',
        reason: '业务调整，划转至广东省公司管理',
        status: 'PENDING',
        applicant: '张三',
        appliedAt: '2025-05-20 14:30:00'
      },
      {
        id: '2',
        treeType: 'BUDGET',
        operationType: 'ADD',
        targetOrgId: 'C99',
        targetOrgName: '新成立分公司',
        newParentId: 'P1',
        effectiveDate: '2025-07-01',
        reason: '新公司成立，挂入预算树',
        status: 'PENDING',
        applicant: '李四',
        appliedAt: '2025-05-21 09:15:00'
      }
    ]

    loading.value = false
  }, 500)
}

function handleCreateNew() {
  Object.assign(newRequest, {
    treeType: 'LEGAL',
    operationType: 'TRANSFER',
    targetOrgId: '',
    targetOrgName: '',
    oldParentId: undefined,
    newParentId: undefined,
    effectiveDate: dayjs().format('YYYY-MM-DD'),
    reason: ''
  })

  showCreateDialog.value = true
}

function handleOperationTypeChange() {
  newRequest.newParentId = undefined
}

function handleTargetOrgChange(entityId: string) {
  const entity = mockEntities.find(e => e.id === entityId)
  if (entity) {
    newRequest.targetOrgName = entity.orgName

    // 查找当前父节点
    const relation = mockRelations.find(r =>
      r.childId === entityId &&
      r.treeType === newRequest.treeType &&
      dayjs().isBetween(r.effectiveDate, r.expiryDate, 'day', '[]')
    )
    newRequest.oldParentId = relation?.parentId
  }
}

function getOperationTypeLabel(type: ChangeOperationType): string {
  const labels: Record<ChangeOperationType, string> = {
    TRANSFER: '转移',
    PROMOTE: '提级',
    ADD: '新增',
    REMOVE: '移除'
  }
  return labels[type]
}

function getOperationTypeTag(type: ChangeOperationType) {
  const typeMap: Record<ChangeOperationType, any> = {
    TRANSFER: 'primary',
    PROMOTE: 'warning',
    ADD: 'success',
    REMOVE: 'danger'
  }
  return typeMap[type]
}

async function handlePreview() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loadingPreview.value = true

  // Mock: 生成 diff 预览
  setTimeout(() => {
    // Mock: 构建变更前的树
    const beforeTree = buildTree(
      mockEntities,
      mockRelations,
      newRequest.treeType,
      dayjs().format('YYYY-MM-DD')
    )

    // Mock: 构建变更后的树（简化处理）
    const afterTree = JSON.parse(JSON.stringify(beforeTree))

    // Mock: 标记被移动的节点
    const markedAfterTree = JSON.parse(JSON.stringify(afterTree))
    markDiffNodes(markedAfterTree, newRequest)

    // Mock: 生成校验问题（根据操作类型决定是否有问题）
    const hasError = newRequest.operationType === 'PROMOTE' // 提级容易出现层级问题
    const issues = generateMockValidationIssues(hasError)

    diffPreview.value = {
      before: beforeTree,
      after: markedAfterTree,
      validation: {
        hasHardFailure: issues.some(i => i.severity === 'HARD'),
        issues
      }
    }

    validationResult.value = diffPreview.value.validation

    loadingPreview.value = false
    showPreviewDialog.value = true
  }, 800)
}

function markDiffNodes(nodes: any[], change: typeof newRequest) {
  // 简化的 diff 标记逻辑
  nodes.forEach((node: any) => {
    if (node.id === change.targetOrgId) {
      node.diffType = 'MOVED'
      node.oldParentId = change.oldParentId
      node.newParentId = change.newParentId
    } else {
      node.diffType = 'UNCHANGED'
    }

    if (node.children && node.children.length > 0) {
      markDiffNodes(node.children, change)
    }
  })
}

function handlePreviewClose() {
  diffPreview.value = null
  validationResult.value = null
}

async function handleSubmit() {
  loadingSubmit.value = true

  // Mock: 提交变更申请
  setTimeout(() => {
    ElMessage.success('变更申请已提交，等待审批')

    // 添加到待审批列表
    const newPending: ChangeRequest = {
      id: String(Date.now()),
      treeType: newRequest.treeType,
      operationType: newRequest.operationType,
      targetOrgId: newRequest.targetOrgId,
      targetOrgName: newRequest.targetOrgName,
      oldParentId: newRequest.oldParentId,
      newParentId: newRequest.newParentId,
      effectiveDate: newRequest.effectiveDate,
      reason: newRequest.reason,
      status: 'PENDING',
      applicant: '当前用户',
      appliedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    pendingRequests.value.unshift(newPending)

    loadingSubmit.value = false
    showPreviewDialog.value = false
    showCreateDialog.value = false

    // 重置表单
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }, 1000)
}

function handleApprove(request: ChangeRequest) {
  currentApprovalRequest.value = request
  approvalValidation.value = null
  showApproveDialog.value = true

  // 自动触发校验
  setTimeout(() => {
    revalidateApproval()
  }, 100)
}

function revalidateApproval() {
  if (!currentApprovalRequest.value) return

  loadingApprovalValidation.value = true

  // Mock: 重新校验
  setTimeout(() => {
    const hasError = Math.random() > 0.7 // 30% 概率出现新问题
    const issues = generateMockValidationIssues(hasError)

    approvalValidation.value = {
      hasHardFailure: issues.some(i => i.severity === 'HARD'),
      issues
    }

    loadingApprovalValidation.value = false
  }, 500)
}

function confirmApprove() {
  if (!currentApprovalRequest.value) return

  ElMessageBox.confirm(
    '确认通过此变更申请？通过后将立即生效。',
    '确认审批',
    {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // Mock: 审批通过
    const index = pendingRequests.value.findIndex(
      r => r.id === currentApprovalRequest.value!.id
    )
    if (index > -1) {
      pendingRequests.value[index].status = 'APPROVED'
      pendingRequests.value[index].approver = '管理员'
      pendingRequests.value[index].approvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      // 从待审批列表移除
      pendingRequests.value.splice(index, 1)
    }

    ElMessage.success('变更已审批通过')
    showApproveDialog.value = false
    currentApprovalRequest.value = null
  }).catch(() => {
    // 取消操作
  })
}

function handleReject(request: ChangeRequest) {
  currentApprovalRequest.value = request
  rejectReason.value = ''
  showRejectDialog.value = true
}

function confirmReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  // Mock: 驳回
  const index = pendingRequests.value.findIndex(
    r => r.id === currentApprovalRequest.value!.id
  )
  if (index > -1) {
    pendingRequests.value[index].status = 'REJECTED'
    pendingRequests.value[index].approver = '管理员'
    pendingRequests.value[index].approvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
    pendingRequests.value[index].rejectReason = rejectReason.value

    // 从待审批列表移除
    pendingRequests.value.splice(index, 1)
  }

  ElMessage.success('变更已驳回')
  showRejectDialog.value = false
  showApproveDialog.value = false
  currentApprovalRequest.value = null
  rejectReason.value = ''
}
</script>

<!-- src/views/OrgAdjustment.vue 样式部分 -->
<style scoped lang="scss">
.org-adjustment-page {
  height: calc(100vh - 108px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-bar {
  flex-shrink: 0;
}

.pending-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1F2421;
    margin-bottom: 16px;
    font-family: 'DM Serif Display', serif;
  }

  :deep(.el-table) {
    flex: 1;
  }
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.approval-validation {
  margin-top: 20px;
}
</style>