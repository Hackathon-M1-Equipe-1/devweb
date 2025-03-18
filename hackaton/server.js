const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

// Retirer l'import de firebase côté serveur
// const firebase = require('firebase');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require('./keys/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackaton-m1-team1-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.firestore();

// Middleware pour authentification
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).send("Non autorisé");
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Token invalide");
  }
};

// Route pour se connecter (utilisation de firebase-admin uniquement)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authentifier l'utilisateur avec Firebase Auth côté serveur
    const userCredential = await admin.auth().getUserByEmail(email);
    if (!userCredential) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Créer un jeton personnalisé
    const token = await admin.auth().createCustomToken(userCredential.uid);

    // Retourner le jeton dans la réponse
    res.status(200).json({ token });
  } catch (error) {
    // Gérer les erreurs spécifiques liées à l'authentification
    console.error(error);
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    } else if (error.code === 'auth/wrong-password') {
      res.status(401).json({ message: 'Mot de passe incorrect' });
    } else {
      // Erreur inconnue
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
});

// Autres routes sécurisées avec middleware d'authentification
app.get('/test', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('test').get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

app.post('/create', authenticate, async (req, res) => {
  try {
    await db.collection('test').add(req.body);
    res.status(201).send("Création réussie");
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

app.delete('/delete/:id', authenticate, async (req, res) => {
  try {
    await db.collection('test').doc(req.params.id).delete();
    res.status(200).send("Suppression réussie");
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

app.put('/update/:id', authenticate, async (req, res) => {
  try {
    await db.collection('test').doc(req.params.id).update(req.body);
    res.status(200).send("Mise à jour réussie");
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

// Démarrer le serveur
app.listen(port, () => console.log(`Serveur sur http://localhost:${port}`));
