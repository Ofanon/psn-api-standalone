# 🎯 Tutoriel Render.com — Déployer PSN API en 5 minutes

Guide complet pour déployer ton API PSN sur Render.com **GRATUITEMENT**.

---

## 📋 Prérequis

- ✅ Code sur GitHub (déjà fait si tu as suivi GITHUB.md)
- ✅ Compte GitHub
- ⏱️ 5-10 minutes

---

## 🚀 Étape 1: Créer un compte Render

1. Va sur [render.com](https://render.com)
2. Clique sur **"Get Started"**
3. **Sign up with GitHub** (recommandé pour l'auto-deploy)
4. Autorise Render à accéder à tes repos GitHub
5. ✅ Tu arrives sur le dashboard Render

---

## 🎨 Étape 2: Créer un nouveau Web Service

### 2.1 Depuis le dashboard

1. Clique sur **"New +"** (en haut à droite)
2. Sélectionne **"Web Service"**

### 2.2 Connecter ton repo GitHub

Tu as 2 cas de figure:

#### Cas A: Repo dédié (psn-api)
- Trouve ton repo dans la liste: `USERNAME/psn-api`
- Clique sur **"Connect"**

#### Cas B: Dans le repo Pawnote.js
- Trouve `LiterateInk/Pawnote.js` (ou ton fork)
- Clique sur **"Connect"**

> 💡 Si tu ne vois pas ton repo: clique sur "Configure account" pour donner l'accès à Render

---

## ⚙️ Étape 3: Configuration du service

Remplis le formulaire avec ces valeurs **exactement**:

### Paramètres de base

| Champ | Valeur |
|-------|--------|
| **Name** | `psn-api` (ou ce que tu veux) |
| **Region** | `Frankfurt (EU Central)` (plus proche de la France) |
| **Branch** | `main` |
| **Root Directory** | **Si Pawnote.js**: `examples/psn-standalone`<br>**Si repo dédié**: laisse vide |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Instance Type

- Sélectionne **"Free"** (0$/mois)
- 512 MB RAM, 0.1 CPU

### Advanced (optionnel pour l'instant)

Laisse vide pour le moment, on ajoutera les variables d'environnement après.

### 3.1 Cliquer sur "Create Web Service"

✅ Le déploiement commence automatiquement !

---

## ⏳ Étape 4: Attendre le déploiement

Tu verras les logs en temps réel:

```
==> Cloning from https://github.com/USERNAME/psn-api...
==> Running build command: npm install
npm WARN deprecated...
added 200 packages in 15s
==> Build successful 🎉
==> Starting service with: npm start
🚀 PSN API Server running on port 10000
==> Your service is live 🎉
```

⏱️ Temps de déploiement: **~2-3 minutes**

---

## 🎉 Étape 5: Tester ton API

### 5.1 Récupérer l'URL

En haut de la page, tu verras:
```
https://psn-api-xxxx.onrender.com
```

Copie cette URL !

### 5.2 Tester le health check

Ouvre dans ton navigateur:
```
https://psn-api-xxxx.onrender.com/health
```

Tu devrais voir:
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T20:45:00.000Z"
}
```

✅ **Ça marche !**

### 5.3 Tester l'authentification

Ouvre un terminal (ou Postman):

```bash
curl -X POST https://psn-api-xxxx.onrender.com/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"oscar.fanon","password":"ton_mot_de_passe"}'
```

Réponse attendue:
```json
{
  "success": true,
  "sessionId": "abc123xyz789",
  "expiresIn": "4 hours"
}
```

### 5.4 Récupérer les notes

```bash
curl -X POST https://psn-api-xxxx.onrender.com/grades \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"abc123xyz789"}'
```

Réponse:
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "subject": "HISTOIRE-GEOGRAPHIE",
        "grade": "16,00",
        "scale": "20",
        "date": "2025-12-12"
      },
      ...
    ]
  }
}
```

🎊 **Ton API est en ligne et fonctionne !**

---

## 🔒 Étape 6: Sécuriser ton API (IMPORTANT)

### 6.1 Ajouter des variables d'environnement

1. Dans Render dashboard, va sur ton service
2. Onglet **"Environment"** (menu de gauche)
3. Clique sur **"Add Environment Variable"**

Ajoute ces variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Mode production |
| `API_KEY` | `ton-secret-ultra-securise` | Pour protéger l'API |

### 6.2 Modifier server.ts pour utiliser l'API Key

Ajoute ce middleware dans `server.ts`:

```typescript
// Protection par API Key
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/') return next();
  
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API Key' });
  }
  next();
});
```

### 6.3 Push les changements

```bash
git add server.ts
git commit -m "Add API key protection"
git push
```

✅ Render va **automatiquement redéployer** (auto-deploy activé)

### 6.4 Tester avec l'API Key

```bash
curl -X POST https://psn-api-xxxx.onrender.com/auth \
  -H "Content-Type: application/json" \
  -H "x-api-key: ton-secret-ultra-securise" \
  -d '{"username":"oscar.fanon","password":"mdp"}'
```

---

## ⚡ Étape 7: Éviter le "sleep" (optionnel)

Render met les services gratuits en "sleep" après **15 minutes d'inactivité**.  
Au réveil, ça prend ~30 secondes.

### Solution 1: Ping externe (recommandé)

Utilise un service comme [UptimeRobot](https://uptimerobot.com) (gratuit):

1. Créer un compte UptimeRobot
2. New Monitor > HTTP(s)
3. URL: `https://ton-api.onrender.com/health`
4. Interval: **5 minutes**

✅ Ton API ne dormira jamais !

### Solution 2: Ping interne (pas recommandé)

Ajoute ça dans `server.ts`:

```typescript
// Éviter le sleep (seulement sur Render)
if (process.env.RENDER) {
  setInterval(async () => {
    try {
      await fetch(`http://localhost:${PORT}/health`);
    } catch {}
  }, 600000); // 10 minutes
}
```

⚠️ Render peut détecter ça et désactiver ton compte.

---

## 📊 Étape 8: Monitoring

### 8.1 Voir les logs

1. Dashboard > Ton service
2. Onglet **"Logs"**
3. Voir les requêtes en temps réel

### 8.2 Voir les métriques

Onglet **"Metrics"**:
- Requêtes par minute
- Temps de réponse
- Utilisation CPU/RAM

### 8.3 Configurer les alertes

1. Onglet **"Settings"**
2. Section **"Deploy Notifications"**
3. Ajouter ton email ou Slack

---

## 🔄 Étape 9: Auto-deploy (déjà activé)

Par défaut, Render auto-deploy à chaque push sur `main`.

### Vérifier:
1. Settings > Auto-Deploy
2. Doit être **"Yes"**

### Désactiver (si besoin):
1. Settings > Auto-Deploy > **"No"**
2. Tu devras cliquer manuellement sur "Deploy latest commit"

---

## 🎨 Étape 10: Custom Domain (optionnel)

### Avec un domaine gratuit

1. Settings > Custom Domains
2. Clique sur **"Add Custom Domain"**
3. Entre: `api.ton-domaine.com`
4. Configure les DNS (instructions affichées)

### Sans domaine

Utilise l'URL Render fournie:
```
https://psn-api-xxxx.onrender.com
```

---

## 🚨 Problèmes courants

### ❌ Build échoue: "Cannot find module 'express'"

**Solution:**
- Vérifie `package.json` (doit contenir `express` dans `dependencies`)
- Ou modifie Build Command: `npm ci` au lieu de `npm install`

### ❌ "Application failed to respond"

**Solution:**
- Vérifie que ton app écoute sur `process.env.PORT`
- Dans `server.ts`: `const PORT = process.env.PORT || 3000;`
- Logs > Cherche les erreurs

### ❌ "502 Bad Gateway"

**Solution:**
- Le service a sleep → attends 30s, il va se réveiller
- Ou utilise UptimeRobot pour éviter le sleep

### ❌ Repo GitHub non visible

**Solution:**
1. Render Dashboard > Account Settings
2. GitHub > **"Configure"**
3. Donne accès au repo manquant

### ❌ Auth échoue avec timeout

**Solution:**
- Keycloak peut être lent (5-10s)
- Dans Render, augmente le timeout:
  - Settings > Health Check Path: `/health`
  - Health Check Timeout: `30 seconds`

---

## 💰 Limites du plan gratuit

| Limite | Valeur |
|--------|--------|
| RAM | 512 MB |
| CPU | 0.1 (partagé) |
| Bande passante | Illimitée |
| Heures | 750h/mois (≈ service actif 24/7) |
| Build minutes | 500/mois |
| Sleep | Après 15 min d'inactivité |

✅ **Largement suffisant pour un usage personnel !**

---

## 🎓 Étapes suivantes

### 1. Ajouter Redis pour persister les sessions
```bash
# Render Dashboard > New Redis (gratuit 25MB)
# Puis dans Environment vars:
REDIS_URL=redis://...
```

### 2. Ajouter rate limiting
```bash
npm install express-rate-limit
```

### 3. Logs structurés
```bash
npm install pino pino-pretty
```

### 4. Tests automatiques (CI/CD)
Ajoute `.github/workflows/test.yml` pour tester avant deploy.

---

## 📚 Ressources

- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Community](https://community.render.com)

---

## ✅ Checklist finale

- [ ] Service déployé et accessible
- [ ] `/health` répond `{"status":"ok"}`
- [ ] `/auth` fonctionne avec tes identifiants
- [ ] `/grades` retourne des données
- [ ] API Key configurée (sécurité)
- [ ] UptimeRobot configuré (éviter sleep)
- [ ] Variables d'environnement ajoutées
- [ ] Auto-deploy activé

🎉 **Félicitations ! Ton API PSN est en ligne sur Render.com !**

---

## 🆘 Besoin d'aide ?

- Render Support: support@render.com
- Community: [community.render.com](https://community.render.com)
- Discord Render: [discord.gg/render](https://discord.gg/render)

Tu peux maintenant partager ton API:
```
https://psn-api-xxxx.onrender.com
```

N'oublie pas de protéger avec l'API Key ! 🔒
