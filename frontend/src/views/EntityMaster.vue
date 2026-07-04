<!-- src/views/EntityMaster.vue -->
<template>
  <div class="entity-master-page">
    <!-- 顶部搜索栏 -->
    <div class="page-card search-bar">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索公司名称或编码"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-select
            v-model="searchForm.orgType"
            placeholder="公司类型"
            clearable
          >
            <el-option label="总部" value="总部" />
            <el-option label="省级" value="省级" />
            <el-option label="地市" value="地市" />
            <el-option label="县区" value="县区" />
          </el-select>
        </el-col>

        <el-col :span="4">
          <el-select
            v-model="searchForm.status"
            placeholder="状态"
            clearable
          >
            <el-option label="正常" value="ACTIVE" />
            <el-option label="已注销" value="CANCELLED" />
          </el-select>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>

        <el-col :span="6" style="text-align: right">
          <el-button type="primary" @click="handleAdd">
            <el-icon style="margin-right: 4px">
              <Plus />
            </el-icon>
            新增临时实体
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 实体列表 -->
    <div class="page-card entity-list">
      <el-table
        :data="entities"
        stripe
        v-loading="loading"
        @row-click="handleRowClick"
        style="cursor: pointer"
      >
        <el-table-column prop="orgCode" label="公司编码" width="150" />
        <el-table-column prop="orgName" label="公司名称" min-width="200" />
        <el-table-column prop="orgType" label="公司类型" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'ACTIVE' ? 'success' : 'info'"
              size="small"
            >
              {{ row.status === 'ACTIVE' ? '正常' : '已注销' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="legalRep" label="法人代表" width="120" />
        <el-table-column prop="registeredCapital" label="注册资本" width="120" />
        <el-table-column prop="establishDate" label="成立日期" width="110" />
        <el-table-column label="数据来源" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.dataSource === 'TEMP'"
              type="warning"
              size="small"
            >
              临时录入
            </el-tag>
            <el-tag v-else type="success" size="small">源头同步</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.dataSource === 'TEMP'"
              type="danger"
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button size="small" @click.stop="viewInTrees(row)">
              在树中查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: center"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>

    <!-- 编辑/新增对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editMode === 'add' ? '新增临时实体' : '编辑实体'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="120px"
      >
        <el-form-item label="公司编码" prop="orgCode">
          <el-input
            v-model="editForm.orgCode"
            placeholder="请输入公司编码"
            :disabled="editMode === 'edit'"
          />
        </el-form-item>

        <el-form-item label="公司名称" prop="orgName">
          <el-input v-model="editForm.orgName" placeholder="请输入公司名称" />
        </el-form-item>

        <el-form-item label="公司类型" prop="orgType">
          <el-select v-model="editForm.orgType" placeholder="请选择公司类型">
            <el-option label="总部" value="总部" />
            <el-option label="省级" value="省级" />
            <el-option label="地市" value="地市" />
            <el-option label="县区" value="县区" />
          </el-select>
        </el-form-item>

        <el-form-item label="法人代表">
          <el-input v-model="editForm.legalRep" placeholder="请输入法人代表" />
        </el-form-item>

        <el-form-item label="注册资本">
          <el-input
            v-model="editForm.registeredCapital"
            placeholder="请输入注册资本"
          />
        </el-form-item>

        <el-form-item label="成立日期">
          <el-date-picker
            v-model="editForm.establishDate"
            type="date"
            placeholder="选择成立日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-alert
          v-if="editMode === 'add'"
          title="提示：新增的临时实体需要在&quot;组织调整&quot;中手动挂入相应的树中"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
        />
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="实体详情" width="800px">
      <div v-if="currentEntity">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公司编码">
            {{ currentEntity.orgCode }}
          </el-descriptions-item>
          <el-descriptions-item label="公司名称">
            {{ currentEntity.orgName }}
          </el-descriptions-item>
          <el-descriptions-item label="公司类型">
            {{ currentEntity.orgType }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="currentEntity.status === 'ACTIVE' ? 'success' : 'info'"
              size="small"
            >
              {{ currentEntity.status === 'ACTIVE' ? '正常' : '已注销' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="法人代表">
            {{ currentEntity.legalRep || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="注册资本">
            {{ currentEntity.registeredCapital || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="成立日期">
            {{ currentEntity.establishDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="数据来源">
            <el-tag
              v-if="currentEntity.dataSource === 'TEMP'"
              type="warning"
              size="small"
            >
              临时录入
            </el-tag>
            <el-tag v-else type="success" size="small">源头同步</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentEntity.createdAt || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ currentEntity.updatedAt || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 在各树中的位置 -->
        <div class="tree-positions">
          <h4>在各树中的位置</h4>

          <el-empty
            v-if="treePositions.length === 0"
            description="该实体未在任何树中"
          />

          <el-table v-else :data="treePositions" stripe>
            <el-table-column label="树类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{
                  TREE_TYPE_LABELS[row.treeType]
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="parentName" label="父节点" />
            <el-table-column prop="levelNum" label="层级" width="80" />
            <el-table-column prop="effectiveDate" label="生效日期" width="110" />
            <el-table-column prop="expiryDate" label="失效日期" width="110" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { mockEntities, mockRelations } from '@/mock/orgData'
import type { OrgEntity, TreeType } from '@/types'
import { TREE_TYPE_LABELS } from '@/types'

dayjs.extend(isBetween)

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const showEditDialog = ref(false)
const showDetailDialog = ref(false)
const editMode = ref<'add' | 'edit'>('add')

const editFormRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  orgType: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const entities = ref<OrgEntity[]>([])
const currentEntity = ref<OrgEntity | null>(null)
const treePositions = ref<any[]>([])

const editForm = reactive({
  id: '',
  orgCode: '',
  orgName: '',
  orgType: '',
  legalRep: '',
  registeredCapital: '',
  establishDate: '',
  status: 'ACTIVE' as 'ACTIVE' | 'CANCELLED',
  dataSource: 'TEMP'
})

const editRules: FormRules = {
  orgCode: [{ required: true, message: '请输入公司编码', trigger: 'blur' }],
  orgName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  orgType: [{ required: true, message: '请选择公司类型', trigger: 'change' }]
}

onMounted(() => {
  handleSearch()
})

function handleSearch() {
  loading.value = true

  setTimeout(() => {
    let filtered = [...mockEntities]

    // 关键字搜索
    if (searchForm.keyword) {
      filtered = filtered.filter(
        (e) =>
          e.orgName.includes(searchForm.keyword) ||
          e.orgCode.toLowerCase().includes(searchForm.keyword.toLowerCase())
      )
    }

    // 类型筛选
    if (searchForm.orgType) {
      filtered = filtered.filter((e) => e.orgType === searchForm.orgType)
    }

    // 状态筛选
    if (searchForm.status) {
      filtered = filtered.filter((e) => e.status === searchForm.status)
    }

    pagination.total = filtered.length

    // 分页
    const start = (pagination.page - 1) * pagination.size
    const end = start + pagination.size
    entities.value = filtered.slice(start, end)

    loading.value = false
  }, 300)
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.orgType = ''
  searchForm.status = ''
  pagination.page = 1
  handleSearch()
}

function handleAdd() {
  editMode.value = 'add'
  Object.assign(editForm, {
    id: '',
    orgCode: '',
    orgName: '',
    orgType: '',
    legalRep: '',
    registeredCapital: '',
    establishDate: '',
    status: 'ACTIVE',
    dataSource: 'TEMP'
  })
  showEditDialog.value = true
}

function handleEdit(entity: OrgEntity) {
  editMode.value = 'edit'
  Object.assign(editForm, {
    ...entity,
    establishDate: entity.establishDate || ''
  })
  showEditDialog.value = true
}

async function handleSave() {
  if (!editFormRef.value) return

  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true

  // Mock: 保存实体
  setTimeout(() => {
    if (editMode.value === 'add') {
      ElMessage.success('临时实体创建成功，请在组织调整中将其挂入树中')
    } else {
      ElMessage.success('实体信息更新成功')
    }

    saving.value = false
    showEditDialog.value = false
    handleSearch()
  }, 800)
}

function handleDelete(entity: OrgEntity) {
  ElMessageBox.confirm(
    `确认删除临时实体"${entity.orgName}"？删除后无法恢复。`,
    '确认删除',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage.success('临时实体已删除')
      handleSearch()
    })
    .catch(() => {
      // 取消操作
    })
}

function handleRowClick(entity: OrgEntity) {
  currentEntity.value = entity
  loadTreePositions(entity.id)
  showDetailDialog.value = true
}

function loadTreePositions(entityId: string) {
  // Mock: 查询该实体在各树中的位置
  const positions: any[] = []

  const today = dayjs().format('YYYY-MM-DD')
  const treeTypes: TreeType[] = ['LEGAL', 'BUDGET', 'MANAGEMENT']

  treeTypes.forEach((treeType) => {
    const relation = mockRelations.find(
      (r) =>
        r.childId === entityId &&
        r.treeType === treeType &&
        dayjs(today).isBetween(r.effectiveDate, r.expiryDate, 'day', '[]')
    )

    if (relation) {
      const parent = mockEntities.find((e) => e.id === relation.parentId)
      positions.push({
        treeType,
        parentName: parent?.orgName || '根节点',
        levelNum: relation.levelNum,
        effectiveDate: relation.effectiveDate,
        expiryDate: relation.expiryDate
      })
    }
  })

  treePositions.value = positions
}

function viewInTrees(entity: OrgEntity) {
  // 跳转到组织浏览页面并高亮该节点
  router.push({
    path: '/org-browser',
    query: { highlight: entity.id }
  })
}
</script>

<style scoped lang="scss">
.entity-master-page {
  height: calc(100vh - 108px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-bar {
  flex-shrink: 0;
}

.entity-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.el-table) {
    flex: 1;
  }
}

.tree-positions {
  margin-top: 24px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 12px;
  }
}
</style>