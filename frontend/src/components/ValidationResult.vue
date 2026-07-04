<!-- src/components/ValidationResult.vue -->
<template>
  <div class="validation-result" v-if="validationResult">
    <!-- 标题 -->
    <h4 v-if="showTitle" class="result-title">{{ title }}</h4>

    <!-- 整体状态 -->
    <el-alert
      v-if="validationResult.hasHardFailure"
      title="存在硬规则失败，无法提交"
      type="error"
      :closable="false"
      class="status-alert"
    />
    <el-alert
      v-else-if="validationResult.issues.some(i => i.severity === 'WARN')"
      title="存在警告，请确认后继续"
      type="warning"
      :closable="false"
      class="status-alert"
    />
    <el-alert
      v-else-if="validationResult.issues.length === 0"
      title="校验通过"
      type="success"
      :closable="false"
      class="status-alert"
    />
    <el-alert
      v-else
      title="仅提示信息"
      type="info"
      :closable="false"
      class="status-alert"
    />

    <!-- 问题列表 -->
    <div class="issues-list" v-if="validationResult.issues.length > 0">
      <div
        v-for="issue in validationResult.issues"
        :key="issue.ruleCode"
        class="issue-item"
        :class="`issue-${issue.severity.toLowerCase()}`"
      >
        <div class="issue-header">
          <el-icon v-if="issue.severity === 'HARD'" class="issue-icon">
            <CircleClose />
          </el-icon>
          <el-icon v-else-if="issue.severity === 'WARN'" class="issue-icon">
            <Warning />
          </el-icon>
          <el-icon v-else class="issue-icon">
            <InfoFilled />
          </el-icon>
          <span class="issue-title">{{ issue.ruleName }}</span>
          <span class="issue-code">{{ issue.ruleCode }}</span>
        </div>
        <div class="issue-message">{{ issue.message }}</div>
        <div class="issue-affected" v-if="issue.affectedOrgNames.length > 0">
          <span class="affected-label">涉及公司:</span>
          <el-tag
            v-for="(orgName, index) in issue.affectedOrgNames"
            :key="index"
            size="small"
            class="affected-tag"
          >
            {{ orgName }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleClose, Warning, InfoFilled } from '@element-plus/icons-vue'
import type { ValidationResult } from '@/types'

/**
 * Props 定义
 */
interface Props {
  validationResult: ValidationResult | null  // 校验结果对象
  title?: string                             // 标题
  showTitle?: boolean                        // 是否显示标题
}

const props = withDefaults(defineProps<Props>(), {
  title: '校验结果',
  showTitle: true
})
</script>

<style scoped lang="scss">
.validation-result {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .result-title {
    font-size: 14px;
    font-weight: 600;
    color: #1F2421;
    margin: 0;
    font-family: 'DM Serif Display', serif;
  }

  .status-alert {
    border-radius: 8px;
  }

  .issues-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .issue-item {
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid;
      background: #FBF7EF;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transform: translateX(2px);
      }

      /* 硬规则（错误） */
      &.issue-hard {
        background: #fef0f0;
        border-left-color: #f56c6c;

        .issue-icon {
          color: #f56c6c;
        }

        .issue-title {
          color: #f56c6c;
        }
      }

      /* 警告 */
      &.issue-warn {
        background: #fdf6ec;
        border-left-color: #C8853F;

        .issue-icon {
          color: #C8853F;
        }

        .issue-title {
          color: #C8853F;
        }
      }

      /* 提示 */
      &.issue-info {
        background: #f4f4f5;
        border-left-color: #909399;

        .issue-icon {
          color: #909399;
        }

        .issue-title {
          color: #909399;
        }
      }

      .issue-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .issue-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .issue-title {
          font-weight: 600;
          font-size: 14px;
          flex: 1;
        }

        .issue-code {
          font-size: 12px;
          color: #8A8A80;
          padding: 2px 8px;
          background: #F0E3D0;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
      }

      .issue-message {
        font-size: 13px;
        color: #1F2421;
        margin-bottom: 8px;
        line-height: 1.6;
      }

      .issue-affected {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .affected-label {
          font-size: 12px;
          color: #8A8A80;
          font-weight: 500;
        }

        .affected-tag {
          background: #F0E3D0;
          border-color: #C8853F;
          color: #1F2421;
        }
      }
    }
  }
}
</style>