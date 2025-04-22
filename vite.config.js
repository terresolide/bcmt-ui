import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
const PACKAGE = require('./package.json')
console.log(PACKAGE.production.url)

var prodUrl = PACKAGE.production.url + '/' + PACKAGE.name + '@' + PACKAGE.version +  '/dist/' ;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, './src/assets/quicklooks') + '/[!.]*', // 1️⃣
          dest: './assets/quicklooks'
        }
      ]
    })
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
