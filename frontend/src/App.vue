<!-- src/App.vue -->
<template>
  <div id="app" class="app-container">
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <h1 class="app-title">集团组织<em>管理</em>平台</h1>
        </div>
        <div class="header-right">
          <span class="user-info">管理员</span>
        </div>
      </el-header>

      <el-container>
        <el-aside width="200px" class="app-aside">
          <el-menu
            :default-active="currentRoute"
            :router="true"
            class="nav-menu"
          >
            <el-menu-item index="/org-browser">
              <el-icon><Grid /></el-icon>
              <span>组织浏览</span>
            </el-menu-item>
            <el-menu-item index="/org-adjustment">
              <el-icon><Edit /></el-icon>
              <span>组织调整</span>
            </el-menu-item>
            <el-menu-item index="/reconciliation">
              <el-icon><Monitor /></el-icon>
              <span>监控对账</span>
            </el-menu-item>
            <el-menu-item index="/entity-master">
              <el-icon><Document /></el-icon>
              <span>实体主数据</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Grid, Edit, Monitor, Document } from '@element-plus/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped lang="scss">
.app-container {
  height: 100vh;

  .el-container {
    height: 100%;
  }
}

.app-header {
  background: var(--color-surface-white);
  border-bottom: 1px solid var(--color-border-warm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .header-left {
    display: flex;
    align-items: center;
  }

  .app-title {
    font-family: 'DM Serif Display', 'Roboto Slab', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;

    em {
      color: var(--color-accent);
      font-style: italic;
    }
  }

  .user-info {
    color: var(--color-text-muted);
    font-size: 14px;
  }
}

.app-aside {
  background: var(--color-surface-white);
  border-right: 1px solid var(--color-border-warm);

  .nav-menu {
    border-right: none;

    .el-menu-item {
      font-size: 14px;

      &.is-active {
        background: var(--color-accent-tint);
        color: var(--color-accent);
      }
    }
  }
}

.app-main {
  background: var(--color-bg-warm);
  padding: 24px;
}
</style>