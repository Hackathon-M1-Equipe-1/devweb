const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialiser Express
const app = express();
const port = 3000;

// Utiliser CORS pour autoriser les appels depuis votre frontend Vue.js
app.use(cors());

// Initialiser Firebase Admin avec les identifiants
var serviceAccount = require('./keys/serviceAccountKey.json'); // Mettez à jour le chemin vers votre fichier de clé
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app" // URL de la base de données Firebase
});

// Accéder à Firestore
const db = admin.firestore();

// Route pour récupérer toutes les collections Firestore
app.get('/collections', async (req, res) => {
  console.log('Route /collections appelée'); // Cette ligne vous aide à voir si la route est bien appelée
  try {
    // Récupérer toutes les collections
    const collections = await db.listCollections();

    // Créer un tableau pour stocker le nom de toutes les collections
    const collectionNames = collections.map(collection => collection.id);

    // Retourner les noms des collections sous forme de JSON
    res.status(200).json({ collections: collectionNames });
  } catch (error) {
    console.error('Erreur lors de la récupération des collections :', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour récupérer tous les éléments de la collection "test"
app.get('/test', async (req, res) => {
  console.log('Route /test appelée'); // Cette ligne vous aide à voir si la route est bien appelée
  try {
    // Récupérer tous les documents de la collection "test"
    const snapshot = await db.collection('test').get();

    // Vérifier si la collection est vide
    if (snapshot.empty) {
      return res.status(404).send('Aucun document trouvé dans la collection "test"');
    }

    // Créer un tableau pour stocker les documents
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Retourner les documents sous forme de JSON
    res.status(200).json({ documents: documents });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de la collection "test":', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route par défaut (racine)
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur Firestore !');
});

// Lancer le serveur sur le port 3000
app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
