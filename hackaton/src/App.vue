<template>
  <div id="app">
    <h1>Données depuis Firebase :</h1>
    <ul>
      <!-- Afficher chaque élément avec le champ 'Name' -->
      <li v-for="(item, index) in data" :key="index">
        {{ item.Name }} <!-- Affichage du champ 'Name' -->
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      data: [], // Contiendra les données récupérées de Firebase
    };
  },
  mounted() {
    this.fetchData(); // Appel de la fonction fetchData au montage du composant
  },
  methods: {
    // Fonction pour récupérer les données depuis l'API Node.js
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:3000/test'); // Faire une requête GET vers le serveur Node.js
        this.data = response.data.documents; // Stocker les documents dans 'data'
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    },
  },
};
</script>

<style scoped>
/* Ajoutez du style ici si nécessaire */
</style>
