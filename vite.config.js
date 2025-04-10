import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const PACKAGE = require('./package.json')
console.log(PACKAGE.production.url)

var prodUrl = PACKAGE.production.url + '/' + PACKAGE.name + '@' + PACKAGE.version +  '/dist/' ;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  filenameHashing: false,
 experimental: {
     renderBuiltUrl(filename, hostType) {
       
         return prodUrl + filename
     }
 },
 build: {
   outDir: './dist',
   rollupOptions: {
     output: {
       entryFileNames: `assets/[name].js`,
       chunkFileNames: `assets/[name].js`,
       assetFileNames: `assets/[name].[ext]`,
     },
   },
 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
