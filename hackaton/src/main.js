import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import './index.css'
import './assets/tailwind.css'

// Fonction simulée pour vérifier si l'utilisateur est connecté
// Remplace cette logique par une vraie méthode de vérification d'authentification (par exemple, un token dans le localStorage)
const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null; // Exemple d'authentification simple
}

// Définir les routes
const routes = [
  {
    path: '/',
    redirect: () => {
      if (isAuthenticated()) {
        // Si l'utilisateur est authentifié, rediriger vers /dashboard
        return '/dashboard';
      } else {
        // Si l'utilisateur n'est pas authentifié, rediriger vers /login
        return '/login';
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/LoginPage.vue')
  },
  {
    path: '/createAccount',
    name: 'CreateAccount',
    component: () => import('./views/CreateAccountPage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/DashboardPage.vue'),
    // Garde de navigation pour protéger l'accès
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
        next(); // L'utilisateur est authentifié, on autorise l'accès
      } else {
        next('/login'); // Sinon, on redirige vers la page de connexion
      }
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./views/ProfilePage.vue'),
    // Garde de navigation pour protéger l'accès
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
        next(); // L'utilisateur est authentifié, on autorise l'accès
      } else {
        next('/login'); // Sinon, on redirige vers la page de connexion
      }
    }
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
