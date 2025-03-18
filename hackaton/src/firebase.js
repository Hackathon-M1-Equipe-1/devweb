// Importez les fonctions dont vous avez besoin à partir du SDK Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Pour l'authentification
import { getFirestore } from "firebase/firestore"; // Si vous utilisez Firestore

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKZLBCapctoLO5RYvMC1_6nlBy03HeY5w",
  authDomain: "hackaton-m1-team1.firebaseapp.com",
  databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hackaton-m1-team1",
  storageBucket: "hackaton-m1-team1.firebasestorage.app",
  messagingSenderId: "227852747809",
  appId: "1:227852747809:web:229917e51d04042d684f60"
};

// Initialisez Firebase
const app = initializeApp(firebaseConfig);

// Initialisez Firebase Auth et Firestore (si vous en avez besoin)
const auth = getAuth(app); // Authentification Firebase
const db = getFirestore(app); // Firestore (si nécessaire)

// Exportez ce dont vous avez besoin
export { auth, db };  // Vous pouvez exporter `auth` et `db` pour les utiliser ailleurs
