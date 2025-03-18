<template>
    <div class="profile-container">
      <div class="profile-header">
        <h1>Mon Profil</h1>
        <p class="subtitle">Bienvenue sur votre page de profil</p>
      </div>
      
      <div class="profile-info">
        <div class="profile-card">
          <img :src="user.avatar" alt="Avatar" class="avatar" />
          <div class="profile-details">
            <h2>{{ user.name }}</h2>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Bio:</strong> {{ user.bio }}</p>
          </div>
        </div>
      </div>
  
      <div class="edit-section">
        <button @click="editProfile">Modifier Profil</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProfilePage',
    data() {
      return {
        // Exemple de données utilisateur, tu peux les récupérer d'une API
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          bio: 'Développeur Full Stack passionné par Vue.js et Node.js.',
          avatar: 'https://via.placeholder.com/150' // Placeholder pour l'avatar
        }
      };
    },
    methods: {
      editProfile() {
        alert('Redirection vers la page de modification du profil');
        // Ici, tu pourrais rediriger l'utilisateur vers une autre page ou afficher un formulaire de modification
        this.$router.push('/edit-profile');
      }
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }
  
  .profile-header {
    margin-bottom: 20px;
  }
  
  .profile-header h1 {
    font-size: 2rem;
    color: #4CAF50;
  }
  
  .profile-header .subtitle {
    font-size: 1.2rem;
    color: #777;
  }
  
  .profile-info {
    margin-top: 30px;
  }
  
  .profile-card {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
    margin: 20px 0;
  }
  
  .profile-card .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-right: 20px;
  }
  
  .profile-details h2 {
    font-size: 1.5rem;
    color: #333;
  }
  
  .profile-details p {
    font-size: 1rem;
    color: #555;
  }
  
  .edit-section {
    margin-top: 20px;
  }
  
  .edit-section button {
    background-color: #4CAF50;
    color: white;
    font-size: 1rem;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .edit-section button:hover {
    background-color: #45a049;
  }
  </style>
  