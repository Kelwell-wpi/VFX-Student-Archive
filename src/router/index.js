import { createRouter, createWebHistory } from 'vue-router'
import vfxGallery from '../components/vfxGallery.vue'
import ProjectDetail from '../components/ProjectDetail.vue'

const routes = [
  { 
    path: '/', 
    name: 'gallery',
    component: vfxGallery 
  },
  { 
    path: '/project/:id', 
    name: 'project-detail',
    component: ProjectDetail,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export const router = createRouter({
  // Use WebHistory for clean URLs
  history: createWebHistory('/IMGD-Student-Archive/'), 
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})