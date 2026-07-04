// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/org-browser'
    },
    {
      path: '/org-browser',
      name: 'OrgBrowser',
      component: () => import('@/views/OrgBrowser.vue'),
      meta: { title: '组织浏览' }
    },
    {
      path: '/org-adjustment',
      name: 'OrgAdjustment',
      component: () => import('@/views/OrgAdjustment.vue'),
      meta: { title: '组织调整' }
    },
    {
      path: '/reconciliation',
      name: 'Reconciliation',
      component: () => import('@/views/Reconciliation.vue'),
      meta: { title: '监控对账' }
    },
    {
      path: '/entity-master',
      name: 'EntityMaster',
      component: () => import('@/views/EntityMaster.vue'),
      meta: { title: '实体主数据' }
    }
  ]
})

export default router