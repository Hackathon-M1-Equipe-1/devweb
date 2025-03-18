<template>
      <div>
        <router-view></router-view>
      </div>
      <nav>
        <ul class="w-full">
          <li class="py-3 px-4 rounded-md cursor-pointer bg-gray-200">🏠 Home</li>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100">📊 Analytics</li>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100">⚙️ Settings</li>
          <li class="py-3 px-4 rounded-md cursor-pointer hover:bg-gray-100">👤 Profile</li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-grow p-8 overflow-y-auto">
      <!-- Header -->
      <header class="flex justify-between items-center bg-white p-6 rounded-md shadow-md mb-8">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold">Dashboard Overview</h1>
          <p class="text-sm text-gray-500">Welcome back, user!</p>
        </div>
        <button class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md" @click="promptAddRoom">
          + Add Room
        </button>
      </header>

      <!-- Widgets Section - Responsive grid with 20% width rooms and 2.5% gap -->
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
              <div
                v-for="device in room.devices"
                :key="device.id"
                :class="[
                  enlargedRoomId === room.id ? 'w-1/5 p-2' : 'w-full sm:w-1/2 p-1',
                  'min-w-[150px]'
                ]"
              >
                <div class="bg-gray-50 p-3 rounded-lg shadow hover:scale-105 transition-transform h-full">
                  <h4 class="text-lg font-medium mb-1 truncate">{{ device.nom }}</h4>
                  <p class="text-sm text-gray-600 truncate">🛠️ {{ device.type }}</p>
                  <p
                    class="text-sm font-semibold"
                    :class="device.status === 'on' ? 'text-green-500' : 'text-red-500'"
                  >
                    🔌 Status: {{ device.status }}
                  </p>

                  <!-- Bouton pour supprimer l'appareil -->
                  <button @click.stop="deleteDevice(device.id)" class="text-red-500 hover:text-red-700 mt-2">
                    🗑️
                  </button>

                  <!-- Bouton pour basculer l'état on/off -->
                  <button
                  @click.stop="toggleDevice(device)"
                  class="pl-2"
                >
                  <span v-if="device.status === 'on'">🔴</span>
                  <span v-else>🟢</span>
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <!-- Modal Overlay for Enlarged Room -->
  <div v-if="enlargedRoomId" @click="enlargedRoomId = null" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      rooms: [],
      enlargedRoomId: null
    };
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
    async toggleDevice(device) {
      // Déterminer le nouvel état de l'appareil
      const newStatus = device.status === 'on' ? 'off' : 'on';
      device.status = newStatus;
      try {
        // Envoyer la commande MQTT via l'API backend
        await axios.post(`http://localhost:3000/devices/${device.id}/mqtt`, {
          status: newStatus
        });

        // Mettre à jour le statut dans Firestore via l'API backend
        await axios.put(`http://localhost:3000/devices/${device.id}`, {
          status: newStatus
        });

        // Mise à jour locale immédiate pour un rendu plus rapide
        
      } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du statut de l'appareil :", error);
      }
    },
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
          idUser: ""
        };
        await axios.post("http://localhost:3000/rooms", newRoom);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de l'ajout de la salle :", error);
      }
    },
    async deleteRoom(roomId) {
      try {
        await axios.delete(`http://localhost:3000/rooms/${roomId}`);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de la suppression de la salle :", error);
      }
    },
    async deleteDevice(deviceId) {
      try {
        await axios.delete(`http://localhost:3000/devices/${deviceId}`);
        this.fetchRooms();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'appareil :", error);
      }
    },
    async promptAddDevice(roomId) {
      const { value: formValues } = await Swal.fire({
        title: "Ajouter un nouvel appareil",
        html:
          '<input id="swal-device-name" class="swal2-input" placeholder="Nom du device">' +
          '<input id="swal-device-type" class="swal2-input" placeholder="Type du device">' +
          '<input id="swal-device-status" class="swal2-input" placeholder="Status (on/off)">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Ajouter",
        preConfirm: () => {
          return {
            nom: document.getElementById("swal-device-name").value,
            type: document.getElementById("swal-device-type").value,
            status: document.getElementById("swal-device-status").value
          };
        }
      });
      if (formValues && formValues.nom && formValues.type && formValues.status) {
        this.addDevice(roomId, formValues.nom, formValues.type, formValues.status);
      } else {
        Swal.fire("Erreur", "Tous les champs doivent être remplis.", "error");
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