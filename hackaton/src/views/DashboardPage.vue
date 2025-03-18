<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-white p-8 text-gray-800 flex flex-col items-center shadow-md">
      <div class="text-2xl font-bold mb-10 flex items-center gap-2">
        <span>🏠</span> Smart Dashboard
      </div>
      <nav class="w-full">
        <ul>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100" @click="$router.push('/dashboard')">
            🏠 Home
          </li>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100" @click="$router.push('/statistique')">📊 Analytics</li>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100" @click="$router.push('/profile')">
            👤 Profile
          </li>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100">
            <a @click="logout">🚪 Se déconnecter</a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow p-8 overflow-y-auto bg-gradient-to-tr from-blue-100 via-white to-blue-100 h-full w-full">
      <!-- Header -->
      <header class="flex justify-between items-center bg-white p-6 rounded-md shadow-md mb-8">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold">Vue globale du Dashboard</h1>
          <p v-if="firstName && lastName" class="text-sm text-gray-500">
            Bon retour, {{ firstName }} {{ lastName }} !
          </p>
        </div>
        <button class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md" @click="promptAddRoom">
          Ajouter une pièce
        </button>
      </header>

      <!-- Widgets Section -->
      <section class="flex flex-wrap -mx-2">
        <div
          v-for="room in sortedRooms"
          :key="room.id"
          :class="[ 
            enlargedRoomId === room.id 
              ? 'fixed top-1/2 left-1/2 w-[75vw] h-[75vh] transform -translate-x-1/2 -translate-y-1/2 z-50' 
              : 'w-1/5 px-2 mb-4', 
            'transform transition-all duration-200'
          ]"
        >
          <div 
            class="bg-white p-4 rounded-lg shadow-lg cursor-pointer relative overflow-hidden"
            :class="enlargedRoomId === room.id ? '' : 'h-64'"
            @click="toggleEnlargeRoom(room.id)"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold truncate">{{ room.nom }}</h3>
              <div class="flex space-x-2 flex-shrink-0">
                <button @click.stop="deleteRoom(room.id)" class="text-red-500 hover:text-red-700">🗑️</button>
                <button @click.stop="promptAddDevice(room.id)" class="text-blue-500 hover:text-blue-700">➕</button>
                <button @click.stop="toggleEnlargeRoom(room.id)" class="text-gray-500 hover:text-gray-700">
                  {{ enlargedRoomId === room.id ? '❌' : '🔍' }}
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">📟 {{ room.devices.length }} Devices</p>
            <div 
              :class="[ 
                'flex flex-wrap', 
                enlargedRoomId === room.id ? 'gap-4 overflow-auto max-h-[60vh]' : 'gap-2 overflow-auto max-h-32' 
              ]"
            >
              <!-- Affichage des devices -->
              <div
                v-for="device in room.devices"
                :key="device.id"
                :class="[
                  enlargedRoomId === room.id ? 'w-1/5 p-2' : 'w-full sm:w-1/2 p-1',
                  'min-w-[150px]'
                ]"
              >
                <div class="bg-gray-50 p-3 rounded-lg shadow hover:scale-105 transition-transform h-full">
                  <!-- Titre + emoji selon type -->
                  <h4 class="text-lg font-medium mb-1 truncate">
                    <span v-if="device.type === 'lamp'">💡</span>
                    <span v-else-if="device.type === 'door'">🚪</span>
                    <span v-else-if="device.type === 'ac'">❄️</span>
                    {{ device.nom }}
                  </h4>
                  <!-- Sous-titre type -->
                  <p class="text-sm text-gray-600 truncate">
                    🛠️ 
                    <span v-if="device.type === 'lamp'">Lampe</span>
                    <span v-else-if="device.type === 'door'">Porte</span>
                    <span v-else-if="device.type === 'ac'">Clim</span>
                  </p>

                  <!-- LAMPE -->
                  <div v-if="device.type === 'lamp'">
                    <p
                      class="text-sm font-semibold"
                      :class="device.status === 'on' ? 'text-green-500' : 'text-red-500'"
                    >
                      🔌 Status: {{ device.status }}
                    </p>
                    <button
                      @click.stop="toggleLamp(device)"
                      class="bg-blue-200 px-2 py-1 rounded mt-2 text-sm"
                    >
                      {{ device.status === 'on' ? 'Éteindre' : 'Allumer' }}
                    </button>
                  </div>

                  <!-- PORTE -->
                  <div v-else-if="device.type === 'door'">
                    <p
                      class="text-sm font-semibold"
                      :class="device.status === 'locked' ? 'text-red-500' : 'text-green-500'"
                    >
                      🔒 Porte : {{ device.status === 'locked' ? 'Verrouillée' : 'Déverrouillée' }}
                    </p>
                    <button
                      @click.stop="toggleDoor(device)"
                      class="bg-blue-200 px-2 py-1 rounded mt-2 text-sm"
                    >
                      {{ device.status === 'locked' ? 'Déverrouiller' : 'Verrouiller' }}
                    </button>
                  </div>

                  <!-- CLIM -->
                  <div v-else-if="device.type === 'ac'">
                    <p class="text-sm font-semibold text-blue-600">
                      🌡️ Température : {{ device.status }} °C
                    </p>
                    <!-- Input pour régler la température -->
                    <div class="mt-2 flex items-center space-x-2">
                      <input
                        type="number"
                        class="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :value="device.status"
                        @click.stop
                        @input="updateAcTemperature(device, $event.target.value)"
                      />
                      <button
                        @click.stop="updateAcTemperature(device, parseInt(device.status) + 1)"
                        class="bg-gray-200 px-2 py-1 rounded"
                      >
                        +
                      </button>
                      <button
                        @click.stop="updateAcTemperature(device, parseInt(device.status) - 1)"
                        class="bg-gray-200 px-2 py-1 rounded"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <!-- BOUTON SUPPRIMER TOUJOURS EN BAS -->
                  <button
                    @click.stop="deleteDevice(device.id)"
                    class="text-red-500 hover:text-red-700 mt-4 block text-sm"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Overlay pour la room agrandie -->
    <div v-if="enlargedRoomId" @click="enlargedRoomId = null" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
    <!-- BLOC NOTIFICATION (transition facultative) -->
    <transition name="fade">
      <div
        v-if="successMessage"
        class="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
      >
        {{ successMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

// Firebase
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "@/firebase";

export default {
  data() {
    return {
      rooms: [],
      enlargedRoomId: null,
      userEmail: "",
      firstName: "",
      lastName: "",
      successMessage: "", // <-- Ajout de la variable pour la notification
    };
  },
  created() {
    this.getUserData();  // Récupérer l'email + user info
  },
  computed: {
    // Trie les rooms par nombre de devices (du plus grand au plus petit)
    sortedRooms() {
      return this.rooms.slice().sort((a, b) => b.devices.length - a.devices.length);
    }
  },
  async mounted() {
    await this.fetchRooms();
  },
  methods: {
    // 🔑 Récupération des infos user (prénom, nom) depuis Firestore
    async getUserData() {
      const db = getFirestore();
      const user = auth.currentUser;
      if (user) {
        this.userEmail = user.email;
        // Requête Firestore pour trouver l'utilisateur par email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", this.userEmail));
        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            this.firstName = userData.firstName;
            this.lastName = userData.lastName;
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur : ", error);
        }
      }
    },

    // 📂 Récupération des salles + devices
    async fetchRooms() {
      try {
        const response = await axios.get("http://localhost:3000/rooms");
        const rooms = response.data;
        for (const room of rooms) {
          room.devices = [];
          for (const deviceId of room.appareil) {
            if (deviceId) {
              const deviceResponse = await axios.get(`http://localhost:3000/devices/${deviceId}`);
              room.devices.push(deviceResponse.data);
            }
          }
        }
        this.rooms = rooms;
      } catch (error) {
        console.error("Erreur lors de la récupération des salles et appareils :", error);
      }
    },

    // 🔌 LAMPE
    async toggleLamp(device) {
      const newStatus = (device.status === "on") ? "off" : "on";
      device.status = newStatus;
      try {
        // MQTT (ex: /devices/:id/mqtt)
        await axios.post(`http://localhost:3000/devices/${device.id}/mqtt`, {
          status: newStatus
        });
        // Mise à jour Firestore
        await axios.put(`http://localhost:3000/devices/${device.id}`, {
          status: newStatus
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la lampe :", error);
      }
    },

    // 🚪 PORTE
    async toggleDoor(device) {
      const newStatus = (device.status === "locked") ? "unlocked" : "locked";
      device.status = newStatus;
      try {
        await axios.post(`http://localhost:3000/devices/${device.id}/mqtt`, {
          status: newStatus
        });
        await axios.put(`http://localhost:3000/devices/${device.id}`, {
          status: newStatus
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la porte :", error);
      }
    },

    // ❄️ CLIM
    async updateAcTemperature(device, newTemp) {
      device.status = newTemp;
      try {
        await axios.post(`http://localhost:3000/devices/${device.id}/mqtt`, {
          status: newTemp
        });
        await axios.put(`http://localhost:3000/devices/${device.id}`, {
          status: newTemp
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la clim :", error);
      }
    },

    // ➕ Ajouter une salle
    async promptAddRoom() {
      const { value: roomName } = await Swal.fire({
        title: "Ajouter une nouvelle salle",
        input: "text",
        inputPlaceholder: "Nom de la salle",
        showCancelButton: true,
        confirmButtonText: "Ajouter",
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage("Le nom de la salle est requis");
          }
          return value;
        }
      });
      if (roomName) {
        this.addRoom(roomName);
      }
    },
    async addRoom(roomName) {
      try {
        const newRoom = {
          nom: roomName,
          appareil: [],
          idUser: this.userEmail
        };
        await axios.post("http://localhost:3000/rooms", newRoom);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de l'ajout de la salle :", error);
      }
    },

    // ➕ Ajouter un device
    async promptAddDevice(roomId) {
      // 1) Nom du device
      const { value: deviceName } = await Swal.fire({
        title: "Ajouter un nouvel appareil",
        input: "text",
        inputPlaceholder: "Nom de l'appareil",
        showCancelButton: true,
        confirmButtonText: "Suivant",
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage("Le nom de l'appareil est requis");
          }
          return value;
        }
      });
      if (!deviceName) return;

      // 2) Type de device
      const { value: deviceType } = await Swal.fire({
        title: "Choisir le type d'appareil",
        input: "select",
        inputOptions: {
          lamp: "Lampe 💡",
          door: "Porte 🚪",
          ac: "Clim ❄️"
        },
        inputPlaceholder: "-- Sélectionnez un type --",
        showCancelButton: true,
        confirmButtonText: "Suivant"
      });
      if (!deviceType) return;

      // 3) Statut selon le type
      let deviceStatus = "";
      if (deviceType === "lamp") {
        const { value: status } = await Swal.fire({
          title: "Choisir l'état de la lampe",
          input: "select",
          inputOptions: {
            on: "Allumée (on)",
            off: "Éteinte (off)"
          },
          showCancelButton: true,
          confirmButtonText: "Ajouter"
        });
        if (!status) return;
        deviceStatus = status;
      } else if (deviceType === "door") {
        const { value: status } = await Swal.fire({
          title: "Choisir l'état de la porte",
          input: "select",
          inputOptions: {
            locked: "Verrouillée (locked)",
            unlocked: "Déverrouillée (unlocked)"
          },
          showCancelButton: true,
          confirmButtonText: "Ajouter"
        });
        if (!status) return;
        deviceStatus = status;
      } else if (deviceType === "ac") {
        const { value: status } = await Swal.fire({
          title: "Régler la température de la clim",
          input: "number",
          inputPlaceholder: "Ex: 22",
          showCancelButton: true,
          confirmButtonText: "Ajouter",
          preConfirm: (value) => {
            if (!value) {
              Swal.showValidationMessage("La température est requise");
            }
            return value;
          }
        });
        if (!status) return;
        deviceStatus = status;
      }

      // 4) Appel final pour ajouter l'appareil
      this.addDevice(roomId, deviceName, deviceType, deviceStatus);
    },

    async addDevice(roomId, nom, type, status) {
      try {
        const newDevice = {
          nom,
          type,
          status,
          roomId
        };
        await axios.post("http://localhost:3000/devices", newDevice);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'appareil :", error);
      }
    },

    // 🗑️ Supprimer une salle
    async deleteRoom(roomId) {
      try {
        await axios.delete(`http://localhost:3000/rooms/${roomId}`);
          // Affiche la notification
        this.successMessage = "Salle supprimée avec succès !";
        // Efface la notification au bout de 3 secondes
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de la suppression de la salle :", error);
      }
    },

    // 🗑️ Supprimer un device
    async deleteDevice(deviceId) {
      try {
        await axios.delete(`http://localhost:3000/devices/${deviceId}`);
        // Affiche la notification
        this.successMessage = "Appareil supprimé avec succès !";
        // Efface la notification au bout de 3 secondes
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'appareil :", error);
      }
    },

    // 📈 Agrandir / Réduire la room
    toggleEnlargeRoom(roomId) {
      this.enlargedRoomId = (this.enlargedRoomId === roomId) ? null : roomId;
    },

    // 🔒 Déconnexion
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

    async addDevice(roomId, deviceName, deviceType, deviceStatus) {
      try {
        const newDevice = {
          nom: deviceName,
          type: deviceType,
          status: deviceStatus,
          roomId: roomId
        };
        await axios.post("http://localhost:3000/devices", newDevice);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de l'ajout du device :", error);
      }
    },
    toggleEnlargeRoom(roomId) {
      if (this.enlargedRoomId === roomId) {
        this.enlargedRoomId = null;
      } else {
        this.enlargedRoomId = roomId;
      }
    }
  }
};
</script>

<style scoped>
/* Animation de fade simple (facultative) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>