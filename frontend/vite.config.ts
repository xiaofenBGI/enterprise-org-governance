// vite.config.ts
//import { defineConfig } from 'vite'
//import vue from '@vitejs/plugin-vue'
//import { resolve } from 'path'

//export default defineConfig({
//  plugins: [vue()],
//  resolve: {
 //   alias: {
//   '@': resolve(__dirname, 'src')
//    }
//  },
//  server: {
//   port: 3000,
//    open: true
//  }
//})

// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // 新增：设置基础路径为仓库名，适配 GitHub Pages 子目录部署
  base: '/enterprise-org-governance/'
})
