<template>
    <div>
      <h2>Créer un nouveau compte</h2>
      <input type="email" v-model="email" placeholder="Email">
      <input type="password" v-model="password" placeholder="Mot de passe">
      <button @click="login">Se connecter</button>
    </div>
  </template>
  
  <script>
  </script>
  
  <style scoped>
  /* Ajoute un peu de style si nécessaire */
  input {
    margin: 10px 0;
    padding: 8px;
    width: 200px;
  }
  
  button {
    padding: 10px;
    width: 100%;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  