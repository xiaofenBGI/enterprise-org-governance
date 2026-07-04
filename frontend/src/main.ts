// src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import './styles/global.scss'

// 路由配置
import OrgBrowser from './views/OrgBrowser.vue'
import OrgAdjustment from './views/OrgAdjustment.vue'
import Reconciliation from './views/Reconciliation.vue'
import EntityMaster from './views/EntityMaster.vue'

const routes = [
  { path: '/', redirect: '/org-browser' },
  { path: '/org-browser', component: OrgBrowser },
  { path: '/org-adjustment', component: OrgAdjustment },
  { path: '/reconciliation', component: Reconciliation },
  { path: '/entity-master', component: EntityMaster }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')