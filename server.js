const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config();

// -----------------------------
// 1. CONFIGURATION DE L'APP
// -----------------------------
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// -----------------------------
// 2. CONFIG FIREBASE
// -----------------------------
const serviceAccount = require('./keys/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app"
});
const db = admin.firestore();

// -----------------------------
// 3. CONNEXION AU BROKER MQTT
// -----------------------------
const MQTT_BROKER = "mqtt://localhost:1883"; // Modifie si ton broker est ailleurs
const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
  console.log("✅ Connecté au broker MQTT");

  // S'abonner au topic devices/# pour écouter les messages de tous les appareils
  client.subscribe("devices/#", (err) => {
    if (err) {
      console.error("❌ Erreur lors de l'abonnement MQTT :", err);
    } else {
      console.log("📡 Abonné à 'devices/#' pour recevoir les données.");
    }
  });
});

// -----------------------------
// 4. RECEPTION DES MESSAGES MQTT
// -----------------------------
client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📥 Reçu du topic "${topic}" :`, data);

    // topic = "devices/rXD096HfJH6xAI7LMwbj"
    const topicParts = topic.split("/");
    // topicParts[0] = "devices", topicParts[1] = "rXD096HfJH6xAI7LMwbj"
    const deviceId = topicParts[1];

    // Vérifier si le device existe dans Firestore
    const deviceRef = db.collection("devices").doc(deviceId);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      console.warn(`⚠️ L'appareil ${deviceId} n'existe pas dans Firestore.`);
      return;
    }

    // Mettre à jour le champ "status" de l'appareil
    await deviceRef.update({
      status: data.status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Statut mis à jour pour l'appareil ${deviceId} : ${data.status}`);
  } catch (error) {
    console.error("❌ Erreur de traitement du message MQTT :", error);
  }
});

// -----------------------------
// 5. ROUTE POUR ENVOYER UNE COMMANDE MQTT
// -----------------------------
app.post('/devices/:id/mqtt', async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { status } = req.body; // on / off

    // Exemple de publication : topic = "devices/rXD096HfJH6xAI7LMwbj"
    const topic = `devices/${deviceId}`;
    const message = JSON.stringify({ status });

    // Publier sur le broker MQTT
    client.publish(topic, message, {}, (err) => {
      if (err) {
        console.error("❌ Erreur lors de la publication MQTT :", err);
        return res.status(500).send("Erreur lors de l'envoi MQTT");
      }
      console.log(`📤 Message MQTT envoyé : ${message} sur le topic ${topic}`);
      return res.status(200).send("Commande envoyée via MQTT");
    });
  } catch (error) {
    console.error("❌ Erreur route MQTT:", error);
    res.status(500).send("Erreur serveur");
  }
});


// -----------------------------
// 5. ROUTES BACKEND
// -----------------------------

// (A) Ajouter un nouvel appareil (device)
app.post('/devices', async (req, res) => {
  const { nom, type, status, roomId } = req.body;
  try {
    if (!nom || !type || !status || !roomId) {
      return res.status(400).send("Tous les champs sont requis (nom, type, status, roomId)");
    }

    const newDeviceRef = await db.collection('devices').add({ nom, type, status, roomId });
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

// (B) Récupérer un appareil par son ID
app.get('/devices/:id', async (req, res) => {
  try {
    const deviceDoc = await db.collection('devices').doc(req.params.id).get();
    if (!deviceDoc.exists) {
      return res.status(404).send("Appareil non trouvé");
    }
    res.status(200).json({ id: deviceDoc.id, ...deviceDoc.data() });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'appareil :", error);
    res.status(500).send("Erreur serveur");
  }
});

// (Mise à jour du statut d'un appareil dans Firestore)
app.put('/devices/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const deviceRef = db.collection("devices").doc(id);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ error: "Appareil non trouvé" });
    }

    // Mise à jour du statut dans Firestore
    await deviceRef.update({
      status: status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: `Statut mis à jour en '${status}' pour l'appareil ${id}` });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// (C) Supprimer un appareil et le retirer de la salle associée
app.delete('/devices/:id', async (req, res) => {
  try {
    const deviceId = req.params.id;

    // Récupérer l'appareil avant de le supprimer pour avoir son roomId
    const deviceRef = db.collection('devices').doc(deviceId);
    const deviceDoc = await deviceRef.get();

    if (!deviceDoc.exists) {
      return res.status(404).send("Appareil non trouvé");
    }

    const { roomId } = deviceDoc.data(); // Récupérer l'ID de la salle associée

    // Supprimer l'appareil de la collection "devices"
    await deviceRef.delete();

    // Vérifier si la salle associée existe et retirer l'appareil de la liste
    if (roomId) {
      const roomRef = db.collection('rooms').doc(roomId);
      await roomRef.update({
        appareil: admin.firestore.FieldValue.arrayRemove(deviceId) // Supprime l'ID du device
      });
    }

    res.status(200).send("Appareil supprimé avec succès et retiré de la salle.");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'appareil :", error);
    res.status(500).send("Erreur serveur");
  }
});

// (D) Récupérer toutes les salles
app.get('/rooms', async (req, res) => {
  try {
    const snapshot = await db.collection('rooms').get();
    if (snapshot.empty) {
      return res.status(200).json([]); 
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

// (E) Ajouter une nouvelle salle
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

// (F) Supprimer une salle
app.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const roomRef = db.collection('rooms').doc(id);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      return res.status(404).send("Salle non trouvée");
    }
    await roomRef.delete();
    res.status(200).send("Salle supprimée avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression de la salle :", error);
    res.status(500).send("Erreur serveur");
  }
});

// (G) Routes de test
app.get('/test', async (req, res) => {
  try {
    const snapshot = await db.collection('test').get();
    if (snapshot.empty) {
      return res.status(404).send('Aucun document trouvé dans la collection "test"');
    }
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de la collection "test":', error);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/create', async (req, res) => {
  const newItem = req.body;
  try {
    await db.collection('test').add(newItem);
    res.status(201).send('Nouvel élément créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de l\'élément :', error);
    res.status(500).send('Erreur serveur');
  }
});

app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('test').doc(id).delete();
    res.status(200).send('Élément supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élément :', error);
    res.status(500).send('Erreur serveur');
  }
});

// -----------------------------
// Route racine
// -----------------------------
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur Firestore + MQTT !');
});

// -----------------------------
// LANCER LE SERVEUR
// -----------------------------
app.listen(port, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${port}`);
  checkRooms(); // Affiche la liste des salles dans la console
});

// -----------------------------
// Vérification des salles au démarrage
// -----------------------------
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