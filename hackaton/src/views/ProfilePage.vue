<template>
    <div class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 bg-white p-8 text-gray-800 flex flex-col items-center shadow-md">
        <div class="text-2xl font-bold mb-10 flex items-center gap-2">
          <span>🏠</span> Smart Dashboard
        </div>
        <nav>
          <ul class="w-full">
            <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100" @click="$router.push('/dashboard')">🏠 Home</li>
            <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100" @click="$router.push('/statistique')">📊 Analytics</li>
            <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100" @click="$router.push('/profile')">👤 Profile</li>
            <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100"><a @click="logout">🚪 Se déconnecter</a></li>
          </ul>
        </nav>
      </aside>
  
      <!-- Main Content -->
      <div class="flex-grow p-8 overflow-y-auto bg-gradient-to-tr from-blue-100 via-white to-blue-100 h-full w-full">
        <header class="flex justify-between items-center bg-white p-6 rounded-md shadow-md mb-8">
          <div class="space-y-1">
            <h1 class="text-2xl font-bold">Mon Profil</h1>
            <p class="text-sm text-gray-500">Consultez et modifiez vos informations ici !</p>
          </div>
          <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md" @click="logout">
            Se déconnecter
          </button>
        </header>
  
        <!-- Contenu principal -->
        <main class="flex-grow max-w-5xl mx-auto w-full p-8">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="flex items-center mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">{{ firstName }} {{ lastName }}</h2>
                <p class="text-gray-500">Informations personnelles</p>
              </div>
            </div>
  
            <hr class="mb-6" />
  
            <!-- Formulaire -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                <input v-model="firstName" id="firstName" type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
  
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
                <input v-model="lastName" id="lastName" type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
  
              <div>
                <label for="age" class="block text-sm font-medium text-gray-600 mb-1">Âge</label>
                <input v-model="age" id="age" type="number" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
  
              <div>
                <label for="address" class="block text-sm font-medium text-gray-600 mb-1">Adresse</label>
                <input v-model="address" id="address" type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
  
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                <input v-model="phone" id="phone" type="tel" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
  
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-600 mb-1">Nouveau mot de passe</label>
                <input v-model="newPassword" id="newPassword" type="password" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
  
            <div class="mt-8 text-right">
              <button @click="updateProfile" class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 transform hover:scale-105">
                Sauvegarder
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
  import { auth, updatePassword } from "@/firebase"; // Assurez-vous que Firebase est bien importé
  
  export default {
    data() {
      return {
        userEmail: "",
        firstName: "",
        lastName: "",
        age: "",
        address: "",
        phone: "",
        newPassword: "",
      };
    },
    created() {
      this.getUserData();
    },
    methods: {
      async getUserData() {
        const db = getFirestore();
        const user = auth.currentUser;
        if (user) {
          this.userEmail = user.email;
  
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", this.userEmail));
  
          try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              this.firstName = userData.firstName || "";
              this.lastName = userData.lastName || "";
              this.age = userData.age || "";
              this.address = userData.address || "";
              this.phone = userData.phone || "";
            });
          } catch (error) {
            console.error("Erreur lors de la récupération des données utilisateur :", error);
          }
        }
      },
      async logout() {
      try {
        // Se déconnecter de Firebase
        await auth.signOut();  // Utilisation de auth venant de Firebase
        
        // Supprimer le token du localStorage pour mettre à jour l'état d'authentification
        localStorage.removeItem('authToken'); // Supprime le token d'authentification
      
        // Redirige l'utilisateur vers la page de connexion
        this.$router.push("/login");
      } catch (error) {
        console.error("Erreur de déconnexion :", error);
        alert("Erreur lors de la déconnexion");
      }
    },
      async updateProfile() {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
  
          await updateDoc(userRef, {
            firstName: this.firstName,
            lastName: this.lastName,
            age: this.age,
            address: this.address,
            phone: this.phone,
          });
  
          if (this.newPassword) {
            try {
              await updatePassword(user, this.newPassword);
            } catch (error) {
              console.error("Erreur lors de la mise à jour du mot de passe :", error);
            }
          }
        }
      },
    },
  };
  </script>
  