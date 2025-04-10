import { createRouter, createWebHashHistory } from 'vue-router'
const StationView = () => import('../views/StationView.vue')
const FileView = () => import('../views/FileView.vue')

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'map',
      component: ''
    },
    {
      path: '/files',
      name: 'files',
      component: FileView
    },
    {
      path: '/stations/:id',
      name: 'station',
      component: StationView,
      meta: { transition: 'slide-right' }
    }
  ]
})

export default router
