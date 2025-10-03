import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './index.css'
import App from './App.vue'
import Home from './pages/Home.vue'
import NotFound from './pages/NotFound.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#root')