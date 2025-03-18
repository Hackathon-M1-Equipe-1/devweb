<template>
    <div class="profile-container p-6 bg-white rounded-lg shadow-lg w-full mx-5 mt-10">
      <h2 class="text-3xl font-semibold text-center text-gray-800 mb-8">Modifier mon Profil</h2>
  
      <div class="profile-info space-y-6">
        <!-- Nom -->
        <div class="flex justify-between items-center">
          <label for="firstName" class="font-medium text-gray-600">Nom:</label>
          <input v-model="firstName" id="firstName" class="input-field" type="text"/>
        </div>
  
        <!-- Prénom -->
        <div class="flex justify-between items-center">
          <label for="lastName" class="font-medium text-gray-600">Prénom:</label>
          <input v-model="lastName" id="lastName" class="input-field" type="text"/>
        </div>
  
        <!-- Âge -->
        <div class="flex justify-between items-center">
          <label for="age" class="font-medium text-gray-600">Âge:</label>
          <input v-model="age" id="age" class="input-field" type="number"/>
        </div>
  
        <!-- Adresse -->
        <div class="flex justify-between items-center">
          <label for="address" class="font-medium text-gray-600">Adresse:</label>
          <input v-model="address" id="address" class="input-field" type="text"/>
        </div>
  
        <!-- Téléphone -->
        <div class="flex justify-between items-center">
          <label for="phone" class="font-medium text-gray-600">Téléphone:</label>
          <input v-model="phone" id="phone" class="input-field" type="tel"/>
        </div>
      </div>
  
      <!-- Bouton de sauvegarde -->
      <div class="mt-8">
        <button @click="updateProfile" class="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Sauvegarder</button>
      </div>
    </div>
  </template>
  
  <script>
  // Assurez-vous d'importer correctement auth
  import { auth } from "@/firebase"; // Assurez-vous d'avoir un fichier firebase.js avec l'initialisation
  
  import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
  import {updatePassword, onAuthStateChanged } from "firebase/auth"; 
  
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
          // Mettez à jour les champs avec les données récupérées
          this.firstName = userData.firstName || '';
          this.lastName = userData.lastName || '';
          this.age = userData.age || '';
          this.address = userData.address || '';
          this.phone = userData.phone || '';
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
  .input-field {
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    border: 1px solid #ddd;
    width: 100%;
    font-size: 1rem;
    color: #333;
  }
  
  .profile-container {
    background-color: #f9fafb;
    border-radius: 12px;
  }
  
  button {
    transition: transform 0.3s ease, background-color 0.3s ease;
  }
  
  button:hover {
    transform: scale(1.05);
  }
  </style>
  