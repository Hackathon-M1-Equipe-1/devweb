<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">Connexion</h2>
      <form @submit.prevent="login">
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
          Se connecter
        </button>
      </form>

      <div class="mt-4 text-center">
        <button 
          @click="createAccount"
          class="text-sm text-blue-500 hover:text-blue-700 focus:outline-none">
          Créer un compte
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
// Importez les éléments nécessaires
import { auth } from '@/firebase'; // Importez l'instance d'authentification Firebase
import { signInWithEmailAndPassword } from "firebase/auth"; // Fonction de connexion

export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    // Fonction de connexion
    async login() {
  try {
    // Connexion avec Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
    const idToken = await userCredential.user.getIdToken();

    // Envoyer le token à ton serveur pour l'authentification
    const response = await axios.post("http://localhost:3000/login", {
      token: idToken,
    });

    console.log("Utilisateur connecté :", response.data);
    
    // Enregistrer l'état d'authentification dans le localStorage
    localStorage.setItem('authToken', idToken); // Stocke le token ou un indicateur d'authentification

    // Redirection vers la page Dashboard après une connexion réussie
    this.$router.push("/dashboard");
  } catch (error) {
    console.error("Erreur de connexion :", error);
    alert("Identifiants incorrects. Veuillez réessayer.");
  }
},

    // Fonction pour la création de compte
    async createAccount() {
      try {
        this.$router.push("/createAccount");
      } catch (error) {
        console.error("Erreur de rédirection :", error);
        alert("Erreur de rédirection. Veuillez réessayer.");
      }
    },
  },
};
</script>

<style scoped>
/* Pas nécessaire de styles supplémentaires, Tailwind s'en charge déjà */
</style>
