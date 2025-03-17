const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialiser Express
const app = express();
const port = 3000;

// Utiliser CORS pour autoriser les appels depuis votre frontend Vue.js
app.use(cors());

// Parse les requêtes JSON
app.use(express.json());

// Initialiser Firebase Admin avec les identifiants
var serviceAccount = require('./keys/serviceAccountKey.json'); // Mettez à jour le chemin vers votre fichier de clé
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app" // URL de la base de données Firebase
});

// Accéder à Firestore
const db = admin.firestore();

// Route pour récupérer tous les éléments de la collection "test"
app.get('/test', async (req, res) => {
  try {
    // Récupérer tous les documents de la collection "test"
    const snapshot = await db.collection('test').get();

    if (snapshot.empty) {
      return res.status(404).send('Aucun document trouvé dans la collection "test"');
    }

    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ documents: documents });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de la collection "test":', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour créer un nouvel élément dans la collection "test"
app.post('/create', async (req, res) => {
  const newItem = req.body;

  try {
    // Ajouter un nouvel élément dans la collection "test"
    await db.collection('test').add(newItem);
    
    res.status(201).send('Nouvel élément créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de l\'élément :', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour supprimer un élément de la collection "test"
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params; // L'ID du document à supprimer

  try {
    // Supprimer le document spécifié par l'ID
    await db.collection('test').doc(id).delete();
    
    res.status(200).send('Élément supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élément :', error);
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
