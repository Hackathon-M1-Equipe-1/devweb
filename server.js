const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const natural = require('natural');

// Initialiser Express
const app = express();
const port = 3000;

// Utiliser CORS pour autoriser les appels depuis votre frontend Vue.js
app.use(cors());

// Parse les requêtes JSON
app.use(express.json());

// Entrainement du NLP
const classifier = new natural.BayesClassifier();
classifier.addDocument('allume la lampe', 'turn_on_lamp');
classifier.addDocument('allumer la lampe', 'turn_on_lamp');
classifier.addDocument('éteins la lampe', 'turn_off_lamp');
classifier.addDocument('éteindre la lampe', 'turn_off_lamp');
classifier.addDocument('coupe la lampe', 'turn_off_lamp');
classifier.addDocument('couper la lampe', 'turn_off_lamp');
classifier.addDocument('allume le ventilateur', 'turn_on_fan');
classifier.addDocument('allumer le ventilateur', 'turn_on_fan');
classifier.addDocument('éteint le ventilateur', 'turn_off_fan');
classifier.addDocument('éteindre le ventilateur', 'turn_off_fan');
classifier.addDocument('coupe le ventilateur', 'turn_off_fan');
classifier.addDocument('couper le ventilateur', 'turn_off_fan');
classifier.addDocument('allume le radiateur', 'turn_on_radiator');
classifier.addDocument('allumer le radiateur', 'turn_on_radiator');
classifier.addDocument('éteint le radiateur', 'turn_off_radiator');
classifier.addDocument('éteindre le radiateur', 'turn_off_radiator');
classifier.addDocument('coupe le radiateur', 'turn_off_radiator');
classifier.addDocument('couper le radiateur', 'turn_off_radiator');
classifier.train();

// Initialiser Firebase Admin avec les identifiants
const serviceAccount = require('./keys/serviceAccountKey.json'); // Mettez à jour le chemin vers votre fichier de clé
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app" // URL de la base de données Firebase
});

// Accéder à Firestore
const db = admin.firestore();

// Route pour ajouter un nouvel appareil (device)
app.post('/devices', async (req, res) => {
    const {nom, type, status, roomId} = req.body;

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

        res.status(201).json({id: newDeviceRef.id, message: "Appareil ajouté avec succès"});
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'appareil :", error);
        res.status(500).send("Erreur serveur");
    }
});

// Route pour récupérer un appareil par son ID
app.get('/devices/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const deviceDoc = await db.collection('devices').doc(id).get();

        if (!deviceDoc.exists) {
            return res.status(404).send("Appareil non trouvé");
        }

        res.status(200).json({id: deviceDoc.id, ...deviceDoc.data()});
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
    const {id} = req.params; // Récupérer l'ID de la salle

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

        res.status(201).json({id: roomRef.id, message: "Salle créée avec succès"});
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

        res.status(200).json({documents: documents});
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
    const {id} = req.params; // L'ID du document à supprimer

    try {
        // Supprimer le document spécifié par l'ID
        await db.collection('test').doc(id).delete();

        res.status(200).send('Élément supprimé avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'élément :', error);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour mettre à jour un élément de la collection "test"
app.put('/update/:id', async (req, res) => {
  const { id } = req.params; // L'ID du document à mettre à jour
  const updatedData = req.body; // Les nouvelles données pour mettre à jour le document

  try {
    // Mettre à jour le document spécifié par l'ID avec les nouvelles données
    await db.collection('test').doc(id).update(updatedData);

    res.status(200).send('Élément mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élément :', error);
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

// Route pour traiter une commande vocale
app.post('/voice-command', async (req, res) => {
    const {transcription} = req.body;
    console.log('Transcription reçue :', transcription);

    if (!transcription) {
        return res.status(400).json({error: "La transcription est requise"});
    }

    try {
        console.log(transcription);

        const action = classifier.classify(transcription.toLowerCase());
        const device = await extractDevice(transcription.toLowerCase());

        console.log(device);
        console.log(action);

        if (!action || !device) {
            return res.status(400).json({error: "Commande non reconnue"});
        }

        let status;
        if (action.startsWith("turn_on"))
            status = "on";
        else if (action.startsWith("turn_off"))
            status = "off";
        else
            return res.status(400).send("Action invalide");

        const devicesSnapshot = await db.collection('devices').where('nom', '==', device).get();
        if (devicesSnapshot.empty) {
            return res.status(404).json({error: `Aucun appareil nommé "${device}" trouvé`});
        }

        // Mettre à jour l'état de l'appareil dans Firestore
        const deviceRef = devicesSnapshot.docs[0].ref;
        await deviceRef.update({status: status});

        console.log(`Commande exécutée : ${action} sur ${device}`);
        res.status(200).json({message: `Commande exécutée : ${action} sur ${device}`});

    } catch (error) {
        console.error("Erreur lors du traitement de la commande :", error);
        res.status(500).json({error: "Erreur serveur"});
    }
});

async function extractDevice(transcription) {
    const snapshot = await db.collection('devices').get();

    if (snapshot.empty) {
        return null;
    }

    const devices = snapshot.docs.map(doc => doc.data().nom.toLowerCase());
    for (const device of devices) {
        if (transcription.toLowerCase().includes(device)) {
            return device;
        }
    }

    return null;
}