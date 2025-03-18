<template>
  <div>
    <h2>Connexion</h2>
    <input type="email" v-model="email" placeholder="Email">
    <input type="password" v-model="password" placeholder="Mot de passe">
    <button @click="login">Se connecter</button>
    <button @click="createAccount">Créer un compte tt</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post("http://localhost:3000/login", {
          email: this.email,
          password: this.password,
        });

        // Vérifier si un token est renvoyé dans la réponse
        if (response.data.token) {
          // Sauvegarder le token dans le localStorage
          localStorage.setItem("token", response.data.token);
          this.$router.push("/"); // Redirection après connexion réussie
        } else {
          alert("Identifiants incorrects");
        }
      } catch (error) {
        console.error("Erreur de connexion :", error);
        alert("Erreur de connexion. Veuillez réessayer.");
      }
    },
    async createAccount() {
      try {
          this.$router.push("/newAccount");
      } catch (error) {
        console.error("Erreur de rédirection :", error);
        alert("Erreur de rédirection. Veuillez réessayer.");
      }
    },
  },
};
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
