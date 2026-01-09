# PSN Standalone — API autonome pour monlycee.net

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Ce module est un **serveur API REST complètement autonome** pour interagir avec PSN (Pronote Services Numériques) via l'ENT monlycee.net.

**🚀 Déployé sur Render** : [https://psn-api-standalone.onrender.com](https://psn-api-standalone.onrender.com)

**⚠️ Ce module est indépendant** — Tu peux l'extraire et l'utiliser seul sans dépendre de Pawnote.js

## 📁 Structure

```
psn-standalone/
├── types.ts         # Types TypeScript pour les données PSN
├── auth.ts          # Authentification HTTP-only (sans navigateur)
├── client.ts        # Client HTTP de base pour les requêtes
├── logbook.ts       # Récupération du logbook (cahier de texte)
├── grades.ts        # Extraction et affichage des notes
├── homework.ts      # Extraction et affichage des devoirs
├── messages.ts      # Gestion des messages Pronote
├── schedule.ts      # Récupération de l'emploi du temps
├── server.ts        # Serveur API REST Express
├── index.ts         # Point d'entrée CLI interactif
├── psn-dashboard.html   # Interface web complète
└── test-api.html    # Testeur API
```

## 🌐 Utilisation de l'API

### URL de base
```
https://psn-api-standalone.onrender.com
```

### Endpoints disponibles

#### 1. Health Check
```bash
GET /health
```
Vérifie que l'API est opérationnelle.

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T00:00:00.000Z"
}
```

#### 2. Authentification
```bash
POST /auth
Content-Type: application/json

{
  "username": "ton.email@example.com",
  "password": "ton_mot_de_passe"
}
```

**Réponse :**
```json
{
  "success": true,
  "sessionId": "abc123...",
  "expiresIn": "4 hours"
}
```

#### 3. Récupérer le logbook
```bash
POST /logbook
Content-Type: application/json

{
  "sessionId": "abc123..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "studentName": "Oscar FANON",
    "logbook": { ... }
  }
}
```

#### 4. Récupérer les notes
```bash
POST /grades
Content-Type: application/json

{
  "sessionId": "abc123..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "id": "...",
        "grade": "16,00",
        "scale": "20",
        "date": "2026-01-08",
        "subject": "Mathématiques"
      }
    ]
  }
}
```

#### 5. Récupérer les devoirs
```bash
POST /homework
Content-Type: application/json

{
  "sessionId": "abc123..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "homework": [
      {
        "date": "2026-01-15",
        "subject": "Français",
        "description": "Lire le chapitre 3",
        "done": false
      }
    ]
  }
}
```

#### 6. Récupérer les messages
```bash
POST /messages
Content-Type: application/json

{
  "sessionId": "abc123..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "...",
        "subject": "Réunion parents",
        "from": "M. Dupont",
        "date": "2026-01-08",
        "read": false
      }
    ]
  }
}
```

#### 7. Récupérer l'emploi du temps
```bash
POST /schedule
Content-Type: application/json

{
  "sessionId": "abc123..."
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "subject": "Mathématiques",
        "teacher": "M. Dupont",
        "room": "A204",
        "startTime": "08:00",
        "endTime": "09:00",
        "date": "2026-01-09"
      }
    ]
  }
}
```

## �️ Interface Web

Deux interfaces web sont disponibles :

### 1. Dashboard complet (`psn-dashboard.html`)
Interface utilisateur complète avec :
- 📊 Notes avec affichage en cartes
- ✏️ Devoirs à faire
- 💬 Messages Pronote
- 📅 Emploi du temps
- 📖 Données brutes du logbook

Ouvre simplement le fichier dans ton navigateur !

### 2. Testeur API (`test-api.html`)
Interface de test pour développeurs :
- Test de tous les endpoints
- Affichage des réponses JSON brutes
- Utile pour déboguer

## �🚀 Utilisation

### Installation des dépendances

Le module nécessite uniquement ces packages npm :

```bash
npm install got tough-cookie cheerio @inquirer/prompts
```

### Lancer le CLI interactif

```bash
npx tsx examples/psn-standalone/index.ts
```

Tu verras un menu avec :
- 🔐 **Authentification** : Se connecter avec username/password (HTTP-only, sans navigateur)
- 📋 **Vue d'ensemble** : Récap rapide (nom, nb de notes, nb de devoirs)
- 📊 **Voir les notes** : Liste complète des notes
- 📝 **Voir les devoirs** : Liste complète des devoirs
- 💬 **Voir les messages** : (à implémenter selon l'API)

### Utilisation programmatique

```typescript
import { authenticatePSN } from './auth';
import { PSNClient } from './client';
import { getGrades } from './grades';
import { getHomework } from './homework';

// 1) Authentification
const { cookies } = await authenticatePSN({
  username: 'oscar.fanon',
  password: 'mon_mot_de_passe'
});

// 2) Créer un client
const client = new PSNClient(cookies);

// 3) Récupérer les données
const grades = await getGrades(client);
const homework = await getHomework(client);

console.log(`Notes: ${grades.length}`);
console.log(`Devoirs: ${homework.length}`);
```

## 🔒 Cookies

Les cookies sont sauvegardés dans `.psn-cookies.json` à la racine du projet.  
**Ne partage jamais ce fichier**, il contient tes identifiants de session.

## 🛠️ Extension

Pour ajouter de nouvelles fonctionnalités :

1. Crée un nouveau fichier (ex: `timetable.ts`)
2. Importe uniquement depuis `./client`, `./types`, etc. (jamais depuis `../../src/`)
3. Exporte tes fonctions
4. Ajoute-les dans `index.ts` pour le CLI

## ⚠️ Limitations

- **Authentification HTTP uniquement** : Si ton compte nécessite 2FA ou un consentement supplémentaire, l'auth échouera
- **Endpoint messages** : À implémenter selon les endpoints disponibles dans l'API PSN
- **Session cookies** : Les cookies expirent après quelques jours/heures selon PSN

## 📝 License

Même license que le projet Pawnote.js parent (GPL-3.0-or-later).
