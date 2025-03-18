const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialiser Express
const app = express();
const port = 3000;

// Utiliser CORS pour autoriser les appels depuis votre frontend Vue.js
app.use(cors());
app.use(bodyParser.json());

// Parse les requêtes JSON
app.use(express.json());

// Initialiser Firebase Admin avec les identifiants
var serviceAccount = require('./keys/serviceAccountKey.json'); // Mettez à jour le chemin vers votre fichier de clé
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app" // URL de la base de données Firebase
});

// Middleware pour vérifier le token
const authenticate = async (req, res, next) => {
  const token = req.body.token;  // On prend le token depuis le body
  if (!token) return res.status(403).send("Non autorisé");

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;  // Ajouter l'utilisateur authentifié dans la requête
    next();
  } catch (error) {
    console.error("Erreur d'authentification : ", error);
    res.status(401).send("Token invalide");
  }
};


// Accéder à Firestore
const db = admin.firestore();

// Route pour ajouter un nouvel appareil (device)
app.post('/devices', async (req, res) => {
  const { nom, type, status, roomId } = req.body;

  try {
    if (!nom || !type || !status || !roomId) {
      return res.status(400).send("Tous les champs sont requis (nom, type, status, roomId)");
    }

    // Ajouter le device à Firestore
    const newDeviceRef = await db.collection('devices').add({
      nom,
      type,
      status,
      roomId
    });

    // Ajouter l'ID du nouvel appareil à la liste des appareils de la salle (rooms)
    const roomRef = db.collection('rooms').doc(roomId);
    await roomRef.update({
      appareil: admin.firestore.FieldValue.arrayUnion(newDeviceRef.id)
    });

    res.status(201).json({ id: newDeviceRef.id, message: "Appareil ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'appareil :", error);
    res.status(500).send("Erreur serveur");
  }
});

// Route pour récupérer un appareil par son ID
app.get('/devices/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deviceDoc = await db.collection('devices').doc(id).get();

    if (!deviceDoc.exists) {
      return res.status(404).send("Appareil non trouvé");
    }

    res.status(200).json({ id: deviceDoc.id, ...deviceDoc.data() });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'appareil :", error);
    res.status(500).send("Erreur serveur");
  }
});

// Récupérer et afficher toutes les salles (rooms) dans la console
async function checkRooms() {
  try {
    const snapshot = await db.collection("rooms").get();
    
    if (snapshot.empty) {
      console.log("⚠️ Aucune salle trouvée dans Firestore !");
      return;
    }

    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("📌 Liste des salles récupérées depuis Firestore :");
    console.log(JSON.stringify(rooms, null, 2));
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des salles :", error);
  }
}

// Exécuter la vérification après le démarrage du serveur
checkRooms();



app.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de la salle

  try {
    // Vérifier si la salle existe
    const roomRef = db.collection('rooms').doc(id);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).send("Salle non trouvée");
    }

    // Supprimer la salle
    await roomRef.delete();

    res.status(200).send("Salle supprimée avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression de la salle :", error);
    res.status(500).send("Erreur serveur");
  }
});
// Route pour récupérer toutes les salles (rooms)
app.get('/rooms', async (req, res) => {
  try {
    const snapshot = await db.collection('rooms').get();
    if (snapshot.empty) {
      return res.status(200).json([]); // Retourner un tableau vide au lieu d'une erreur 404
    }

    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Erreur lors de la récupération des salles:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour ajouter une nouvelle salle (room)
app.post('/rooms', async (req, res) => {
  const newRoom = req.body;

  try {
    const roomRef = await db.collection('rooms').add({
      nom: newRoom.nom || "Nouvelle Salle",
      appareil: newRoom.appareil || [],
      idUser: newRoom.idUser || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ id: roomRef.id, message: "Salle créée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la création de la salle:", error);
    res.status(500).send("Erreur serveur");
  }
});


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

app.post('/login', authenticate, (req, res) => {
  const user = req.user;  // Utilisateur validé par Firebase
  console.log("Utilisateur authentifié : ", user);
  res.status(200).json({ message: "Utilisateur authentifié", user });
});

// Lancer le serveur sur le port 3000
app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});

