<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">Créer un compte</h2>
        
        <!-- Formulaire de création de compte -->
        <form @submit.prevent="createAccount">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-600">Email</label>
            <input 
              type="email" 
              v-model="email" 
              id="email" 
              placeholder="Email" 
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              required />
          </div>
          
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-600">Mot de passe</label>
            <input 
              type="password" 
              v-model="password" 
              id="password" 
              placeholder="Mot de passe" 
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              required />
          </div>
          
          <button 
            type="submit" 
            class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Créer un compte
          </button>
        </form>
  
        <div class="mt-4 text-center">
          <button 
            @click="goToLogin"
            class="text-sm text-blue-500 hover:text-blue-700 focus:outline-none">
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // Importez les éléments nécessaires
  import { auth } from '@/firebase'; // Importez l'instance d'authentification Firebase
  import { createUserWithEmailAndPassword } from "firebase/auth"; // Fonction pour créer un utilisateur
  
  export default {
    data() {
      return {
        email: "",
        password: "",
      };
    },
    methods: {
      // Fonction pour créer un compte
      async createAccount() {
        try {
          // Création du compte avec Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          
          // Vous pouvez récupérer l'utilisateur ou le token, mais normalement vous êtes déjà connecté après l'inscription
          const user = userCredential.user;
          
          console.log("Utilisateur créé :", user);
  
          // Redirection vers la page de connexion ou tableau de bord
          this.$router.push("/login");
        } catch (error) {
          console.error("Erreur lors de la création du compte :", error);
          alert("Une erreur est survenue lors de la création du compte. Veuillez réessayer.");
        }
      },
  
      // Fonction pour rediriger l'utilisateur vers la page de connexion
      goToLogin() {
        this.$router.push("/login");
      }
    },
  };
  </script>
  
  <style scoped>
  /* Style personnalisé si nécessaire */
  </style>
  