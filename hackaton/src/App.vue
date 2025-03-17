<template>
  <div id="app">
    <h1>Données depuis Firebase :</h1>
    <ul>
      <!-- Afficher chaque élément avec le champ 'Name' -->
      <li v-for="(item, index) in data" :key="index">
        {{ item.Name }} <!-- Affichage du champ 'Name' -->
        <button @click="updateItem(item.id)">Update</button> <!-- Update button -->
        <button @click="deleteItem(item.id)">Delete</button> <!-- Delete button -->
      </li>
    </ul>

    <!-- Input pour récupérer la valeur du nom -->
    <input type="text" name="name" id="nameField" v-model="newItemName" placeholder="Entrez un nom">
    <button @click="createNewItem">Click me to create a new item</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      data: [], // Contiendra les données récupérées de Firebase
      newItemName: "", // Contiendra la valeur de l'input
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

    // Fonction pour créer un nouvel élément dans Firebase
    async createNewItem() {
      if (!this.newItemName) {
        alert("Veuillez entrer un nom avant de soumettre.");
        return;
      }

      try {
        const newItem = {
          Name: this.newItemName, // Utilise la valeur de l'input
        };

        // Envoyer une requête POST pour ajouter un nouvel élément
        await axios.post('http://localhost:3000/create', newItem);
        
        // Recharger les données après avoir créé un nouvel élément
        this.fetchData();

        // Réinitialiser le champ de l'input
        this.newItemName = "";
      } catch (error) {
        console.error('Erreur lors de la création de l\'élément :', error);
      }
    },

    // Fonction pour supprimer un élément
    async deleteItem(id) {
      try {
        await axios.delete(`http://localhost:3000/delete/${id}`);
        this.fetchData(); // Recharge les données après suppression
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'élément :', error);
      }
    },

    // Fonction pour mettre à jour un élément
    async updateItem(id) {
      if (!this.newItemName) {
        alert("Veuillez entrer un nom avant de soumettre.");
        return;
      }

      try {
        const updatedItem = {
          Name: this.newItemName, // Utilise la valeur de l'input
        };

        // Utiliser PUT pour mettre à jour un élément existant
        await axios.put(`http://localhost:3000/update/${id}`, updatedItem);

        // Recharger les données après mise à jour
        this.fetchData();

        // Réinitialiser le champ de l'input
        this.newItemName = "";
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'élément :', error);
      }
    },
  },
};
</script>

<style scoped>
/* Ajoutez du style ici si nécessaire */
</style>
