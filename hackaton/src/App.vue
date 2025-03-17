<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <span>🏠</span> Smart Dashboard
      </div>
      <nav>
        <ul class="nav-links">
          <li class="nav-item active">🏠 Home</li>
          <li class="nav-item">📊 Analytics</li>
          <li class="nav-item">⚙️ Settings</li>
          <li class="nav-item">👤 Profile</li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="header-title">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, user!</p>
        </div>
        <button class="add-item" @click="promptAddRoom">+ Add Room</button>
      </header>

      <!-- Widgets Section -->
      <section class="widgets">
        <!-- Itération sur sortedRooms pour trier selon le nombre de devices -->
        <div
          class="room-widget"
          v-for="room in sortedRooms"
          :key="room.id"
          :class="{ enlarged: room.id === enlargedRoomId }"
        >
          <div class="room-header">
            <h3>{{ room.nom }}</h3>
            <div class="room-actions">
              <button class="delete-btn" @click="deleteRoom(room.id)">🗑️</button>
              <button class="add-device-btn" @click="promptAddDevice(room.id)">➕</button>
              <!-- Bouton pour agrandir/fermer la room -->
              <button class="enlarge-btn" @click.stop="toggleEnlargeRoom(room.id)">
                {{ enlargedRoomId === room.id ? '❌' : '🔍' }}
              </button>
            </div>
          </div>
          <p class="device-count">📟 {{ room.devices.length }} Devices</p>
          <!-- Devices Table -->
          <div class="device-table">
            <div class="device-card" v-for="device in room.devices" :key="device.id">
              <h4>{{ device.nom }}</h4>
              <p class="device-type">🛠️ {{ device.type }}</p>
              <p
                class="device-status"
                :class="{
                  'status-on': device.status === 'on',
                  'status-off': device.status === 'off'
                }"
              >
                🔌 Status: {{ device.status }}
              </p>
              <button class="delete-btn" @click="deleteDevice(device.id)">🗑️</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
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

<style scoped>
/* Global Styles */
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  background: #e9ecef;
  color: #333;
}

/* Dashboard Container */
.dashboard {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #ffffff;
  padding: 30px 20px;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 2px 0px 10px rgba(0, 0, 0, 0.1);
}

.sidebar .logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-links {
  list-style: none;
  padding: 0;
  width: 100%;
}

.nav-links .nav-item {
  padding: 12px 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.nav-links .nav-item:hover,
.nav-links .nav-item.active {
  background: rgba(0, 0, 0, 0.05);
}

/* Main Content */
.main-content {
  flex-grow: 1;
  padding: 30px;
  overflow-y: auto;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-title h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-title p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #777;
}

.add-item {
  background: #28a745;
  border: none;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.add-item:hover {
  background: #218838;
}

/* Widgets Section */
.widgets {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

/* Room Widget */
.room-widget {
  width: 300px;
  height: 300px;
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, width 0.2s ease, height 0.2s ease;
  cursor: pointer;
  position: relative;
}

.room-widget:hover {
  transform: translateY(-5px);
}

/* Mode agrandi appliqué via la classe "enlarged" */
.room-widget.enlarged {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 75vw;
  height: 75vh;
  transform: translate(-50%, -50%);
  z-index: 999;
}

/* Room Header */
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.room-header h3 {
  margin: 0;
  font-size: 1.4rem;
}

.room-actions {
  display: flex;
  gap: 10px;
}

.room-actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.room-actions button:hover {
  transform: scale(1.1);
}

.device-count {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 15px;
}

/* Device Table */
.device-table {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.device-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  width: 140px;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.device-card:hover {
  transform: scale(1.05);
}

.device-card h4 {
  margin: 0;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.device-type {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.device-status {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.status-on {
  color: #28a745;
}

.status-off {
  color: #dc3545;
}

.delete-btn {
  background: #dc3545;
  border: none;
  color: #fff;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #c82333;
}
</style>