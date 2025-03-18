<template>
    <div class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 bg-white p-8 text-gray-800 flex flex-col items-center shadow-md">
        <div class="text-2xl font-bold mb-10 flex items-center gap-2">
          <span>🏠</span> Smart Dashboard
        </div>
        <nav class="w-full">
          <ul>
            <li
              class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100"
              @click="$router.push('/dashboard')"
            >
              🏠 Home
            </li>
            <li
              class="py-3 px-4 rounded-md cursor-pointer bg-gray-100 font-semibold"
            >
              📊 Analytics
            </li>
            <li
              class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100"
              @click="$router.push('/profile')"
            >
              👤 Profile
            </li>
            <li
              class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100"
            >
              <a @click="logout">🚪 Se déconnecter</a>
            </li>
          </ul>
        </nav>
      </aside>
  
      <!-- Main Content -->
      <div
        class="flex-grow p-8 overflow-y-auto bg-gradient-to-tr from-blue-100 via-white to-blue-100 h-full w-full"
      >
        <!-- Header -->
        <header
          class="flex justify-between items-center bg-white p-6 rounded-md shadow-md mb-8"
        >
          <div class="space-y-1">
            <h1 class="text-2xl font-bold">Statistiques</h1>
            <p v-if="firstName && lastName" class="text-sm text-gray-500">
              Statistique divers de {{ firstName }} {{ lastName }}.
            </p>
          </div>
        </header>
  
        <!-- Contenu principal de la page de stats -->
        <div class="space-y-8">
          <!-- Cards de statistiques -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Nombre de rooms -->
            <div class="bg-white p-6 rounded-lg shadow text-center">
              <h2 class="text-lg font-semibold text-gray-600 mb-2">Nombre de Rooms</h2>
              <p class="text-3xl font-bold text-blue-600">{{ roomsCount }}</p>
            </div>
  
            <!-- Nombre d'appareils -->
            <div class="bg-white p-6 rounded-lg shadow text-center">
              <h2 class="text-lg font-semibold text-gray-600 mb-2">Nombre d'Appareils</h2>
              <p class="text-3xl font-bold text-blue-600">{{ devicesCount }}</p>
            </div>
  
            <!-- Nombre de lampes allumées, par ex -->
            <div class="bg-white p-6 rounded-lg shadow text-center">
              <h2 class="text-lg font-semibold text-gray-600 mb-2">Lampes ON</h2>
              <p class="text-3xl font-bold text-blue-600">{{ lampOnCount }}</p>
            </div>
  
            <!-- Nombre de portes verrouillées, par ex -->
            <div class="bg-white p-6 rounded-lg shadow text-center">
              <h2 class="text-lg font-semibold text-gray-600 mb-2">Portes verrouillées</h2>
              <p class="text-3xl font-bold text-blue-600">{{ doorLockedCount }}</p>
            </div>
          </div>
  
          <!-- Graphiques -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Distribution des devices par type (Pie chart) -->
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-4">Répartition des appareils par type</h3>
              <apexchart
                v-if="chartOptionsPie && seriesPie.length"
                type="donut"
                height="350"
                :options="chartOptionsPie"
                :series="seriesPie"
              ></apexchart>
            </div>
  
            <!-- Exemple de courbe d'évolution (Line chart) -->
            <div class="bg-white p-6 rounded-lg shadow text-center">
            <h2 class="text-lg font-semibold text-gray-600 mb-2">Appareils en fonctionnement</h2>
            <p class="text-3xl font-bold text-green-600">{{ devicesActive }}</p>
            <p class="text-sm text-gray-500">💡 {{ lampOnCount }} Lampes | 🌡️ {{ acOnCount }} Clims | 🚪 {{ doorLockedCount }} Portes verrouillées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  /* 
    1. Import ApexCharts
    2. Import vue3-apexcharts
  */
  import VueApexCharts from "vue3-apexcharts";
  
  import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
  import { auth } from "@/firebase";
  import axios from "axios";
  
  export default {
    name: "StatistiquePage",
    components: {
      apexchart: VueApexCharts,
    },
    data() {
      return {
        firstName: "",
        lastName: "",
        // Stats
        roomsCount: 0,
        devicesCount: 0,
        lampOnCount: 0,
        doorLockedCount: 0,
        devicesActive: 0, // Nombre d’appareils actifs (toutes catégories confondues)

  
        // Données pour le pie chart
        seriesPie: [],
        chartOptionsPie: {
          labels: [],
          legend: {
            position: 'bottom'
          }
        },
  
        // Données pour le line chart
        seriesLine: [],
        chartOptionsLine: {
          chart: {
            id: 'randomLine',
            animations: {
              enabled: true
            }
          },
          xaxis: {
            categories: []
          },
          stroke: {
            curve: 'smooth'
          },
          legend: {
            position: 'bottom'
          }
        }
      };
    },
    async mounted() {
      this.getUserData();
      this.fetchStats();
    },
    methods: {
      async getUserData() {
        const db = getFirestore();
        const user = auth.currentUser;
        if (user) {
          // Récupérer l'utilisateur par email
          const userEmail = user.email;
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", userEmail));
          try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              this.firstName = userData.firstName;
              this.lastName = userData.lastName;
            });
          } catch (error) {
            console.error("Erreur userData:", error);
          }
        }
      },
  
      // Récupération des stats depuis le backend
      async fetchStats() {
        try {
          // 1) Récupérer toutes les rooms
          const roomsResponse = await axios.get("http://localhost:3000/rooms");
          const rooms = roomsResponse.data || [];
          this.roomsCount = rooms.length;
  
          // 2) Compter le total de devices
          let totalDevices = 0;
          let lampOn = 0;
          let doorLocked = 0;
          // Pour le pie chart, on veut la distribution par type
          let lampCount = 0;
          let doorCount = 0;
          let acCount = 0;
  
          // Parcours des rooms
          for (const room of rooms) {
            if (room.appareil && Array.isArray(room.appareil)) {
              totalDevices += room.appareil.length;
              // Récupération des devices
              for (const deviceId of room.appareil) {
                // Appel API pour avoir le détail de chaque device
                const deviceRes = await axios.get(`http://localhost:3000/devices/${deviceId}`);
                const deviceData = deviceRes.data;
                // Comptage par type
                if (deviceData.type === 'lamp') {
                  lampCount++;
                  // Vérif on/off
                  if (deviceData.status === 'on') {
                    lampOn++;
                  }
                } else if (deviceData.type === 'door') {
                  doorCount++;
                  // Vérif locked/unlocked
                  if (deviceData.status === 'locked') {
                    doorLocked++;
                  }
                } else if (deviceData.type === 'ac') {
                  acCount++;
                }
              }
            }
          }
          this.devicesCount = totalDevices;
          this.lampOnCount = lampOn;
          this.doorLockedCount = doorLocked;
  
          // Mise à jour du pie chart
          this.seriesPie = [lampCount, doorCount, acCount];
          this.chartOptionsPie.labels = ["Lampes", "Portes", "Clims"];
          this.devicesActive = lampOn + doorLocked, acCount;
  
        } catch (error) {
          console.error("Erreur lors de la récupération des stats :", error);
        }
      },
  
      // Exemple de génération de données aléatoires pour un line chart
      
  
      logout() {
        // Ex. signOut firebase
        auth.signOut().then(() => {
          this.$router.push("/login");
        }).catch((err) => {
          console.error("Erreur déconnexion :", err);
        });
      }
    }
  };
  </script>
  
  <style scoped>
  /* Tout le style se base sur Tailwind, 
     aucun style custom nécessaire ici */
  </style>