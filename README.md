# PSN Standalone — Module autonome pour monlycee.net

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Ce module est un **client API complètement autonome** pour interagir avec PSN (Pronote Services Numériques) via l'ENT monlycee.net.

**🚀 Déployable sur Render, Fly.io, Railway, Vercel** — Voir [DEPLOYMENT.md](DEPLOYMENT.md)

**⚠️ Ce module est indépendant** — Tu peux l'extraire et l'utiliser seul sans dépendre de Pawnote.js

## 📁 Structure

```
psn-standalone/
├── types.ts       # Types TypeScript pour les données PSN
├── auth.ts        # Authentification HTTP-only (sans navigateur)
├── client.ts      # Client HTTP de base pour les requêtes
├── logbook.ts     # Récupération du logbook (cahier de texte)
├── grades.ts      # Extraction et affichage des notes
├── homework.ts    # Extraction et affichage des devoirs
├── messages.ts    # Gestion des messages (stub)
├── index.ts       # Point d'entrée CLI interactif
└── README.md      # Ce fichier
```

## 🚀 Utilisation

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
