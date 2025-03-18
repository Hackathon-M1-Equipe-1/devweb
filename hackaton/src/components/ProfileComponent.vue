<template>
  <!-- Conteneur principal sur toute la hauteur, avec un dégradé -->
  <div class="flex-grow p-8 overflow-y-auto bg-gradient-to-tr from-blue-100 via-white to-blue-100 h-full w-full">
    
    <header class="flex justify-between items-center bg-white p-6 rounded-md shadow-md mb-8">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold">Mon Profil</h1>
          <p class="text-sm text-gray-500">Consultez et modifiez vos information ici !</p>
        </div>
        <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md" @click="logout">
          Se déconnecter
        </button>
    </header>
    
    <!-- Contenu principal -->
    <main class="flex-grow max-w-5xl mx-auto w-full p-8">
      <!-- Carte blanche -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- En-tête du profil (avatar, nom, etc.) -->
        <div class="flex items-center mb-8">
          
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">{{ firstName }} {{ lastName }}</h2>
            <p class="text-gray-500">Informations personnelles</p>
          </div>
        </div>

        <hr class="mb-6" />

        <!-- Formulaire en grille responsive -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nom -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-600 mb-1">
              Nom
            </label>
            <input
              v-model="firstName"
              id="firstName"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Prénom -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-600 mb-1">
              Prénom
            </label>
            <input
              v-model="lastName"
              id="lastName"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Âge -->
          <div>
            <label for="age" class="block text-sm font-medium text-gray-600 mb-1">
              Âge
            </label>
            <input
              v-model="age"
              id="age"
              type="number"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Adresse -->
          <div>
            <label for="address" class="block text-sm font-medium text-gray-600 mb-1">
              Adresse
            </label>
            <input
              v-model="address"
              id="address"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Téléphone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-600 mb-1">
              Téléphone
            </label>
            <input
              v-model="phone"
              id="phone"
              type="tel"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Nouveau mot de passe (optionnel) -->
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-600 mb-1">
              Nouveau mot de passe
            </label>
            <input
              v-model="newPassword"
              id="newPassword"
              type="password"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Bouton de sauvegarde -->
        <div class="mt-8 text-right">
          <button
            @click="updateProfile"
            class="inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { auth } from "@/firebase"; // Ajuster selon votre config
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { updatePassword, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      age: "",
      address: "",
      phone: "",
      newPassword: "",
    };
  },
  created() {
    this.checkUserStatus();
  },
  methods: {
    async logout() {
      try {
        // Se déconnecter de Firebase
        await auth.signOut();  // Utilisation de auth venant de Firebase
        this.$router.push("/login");  // Redirige l'utilisateur vers la page de connexion
      } catch (error) {
        console.error("Erreur de déconnexion :", error);
        alert("Erreur lors de la déconnexion");
      }
    },
    // Vérification de l'état de l'utilisateur
    checkUserStatus() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.getUserData(user); // Récupérer les données de l'utilisateur
        } else {
          console.log("Aucun utilisateur connecté");
        }
      });
    },
    async getUserData(user) {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.firstName = userData.firstName || "";
        this.lastName = userData.lastName || "";
        this.age = userData.age || "";
        this.address = userData.address || "";
        this.phone = userData.phone || "";
      } else {
        console.log("Aucun utilisateur trouvé dans la base de données");
      }
    },
    async updateProfile() {
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);

        // Mise à jour des données dans Firestore
        await updateDoc(userRef, {
          firstName: this.firstName,
          lastName: this.lastName,
          age: this.age,
          address: this.address,
          phone: this.phone,
        });

        // Mise à jour du mot de passe si nécessaire
        if (this.newPassword) {
          try {
            await updatePassword(user, this.newPassword);
            console.log("Mot de passe mis à jour");
          } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe :", error);
          }
        }
      }
    },
  },
};
</script>

<style scoped>
/* Aucun style custom ici : tout est géré par les classes Tailwind. */
</style>