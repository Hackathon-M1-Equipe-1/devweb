import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import './index.css'
import './assets/tailwind.css'

// Définir les routes
const routes = [
  // Exemple de route
  {
    path: '/',
    name: 'Home',
    component: () => import('./App.vue') // Remplace par ton composant principal
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/LoginPage.vue') // Remplace par ton composant principal
  },
  {
    path: '/createAccount',
    name: 'CreateAccount',
    component: () => import('./views/CreateAccountPage.vue') // Remplace par ton composant principal
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/DashboardPage.vue') // Remplace par ton composant principal
  }
]

// Créer l'instance du router
const router = createRouter({
  history: createWebHistory(),
  routes // Nous passons ici les routes définies ci-dessus
})

// Créer l'application Vue et y ajouter le router
const app = createApp(App)
app.use(router)
app.mount('#app')
