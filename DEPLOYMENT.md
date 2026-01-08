# 🚀 Déploiement PSN API

Guide pour déployer l'API PSN sur différentes plateformes gratuites.

## ⚡ Plateformes recommandées

### 1. **Render.com** (Le plus simple)
- ✅ 750h gratuites/mois
- ✅ Déploiement automatique depuis Git
- ✅ HTTPS gratuit
- ⚠️ Sleep après 15min d'inactivité (réveil ~30s)

**Instructions:**
```bash
# 1. Créer un compte sur render.com
# 2. New > Web Service
# 3. Connecter ton repo GitHub
# 4. Sélectionner le dossier examples/psn-standalone
# 5. Build: npm install
# 6. Start: npm start
# 7. Deploy!
```

URL: `https://ton-app.onrender.com`

---

### 2. **Fly.io** (Bon pour l'Europe)
- ✅ 3 VMs gratuites (256MB RAM)
- ✅ Pas de sleep automatique
- ✅ Région Paris (CDG) disponible
- ⚠️ Nécessite carte bancaire (pas de charge si quotas respectés)

**Instructions:**
```bash
# 1. Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Créer l'app
cd examples/psn-standalone
fly launch --no-deploy

# 4. Éditer fly.toml (déjà configuré)
# 5. Déployer
fly deploy

# 6. Ouvrir
fly open
```

URL: `https://psn-api.fly.dev`

---

### 3. **Railway.app** (Crédit gratuit)
- ✅ 5$ de crédit gratuit/mois
- ✅ Pas de sleep
- ✅ Build rapide
- ⚠️ Crédit limité

**Instructions:**
```bash
# 1. Créer compte sur railway.app
# 2. New Project > Deploy from GitHub
# 3. Sélectionner le repo
# 4. Root directory: examples/psn-standalone
# 5. Deploy!
```

URL: `https://psn-api.up.railway.app`

---

### 4. **Vercel** (Serverless)
- ✅ Illimité gratuit pour hobby
- ✅ Edge network ultra rapide
- ⚠️ Timeout 10s max par requête
- ⚠️ Cold starts

**Instructions:**
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd examples/psn-standalone
vercel --prod
```

URL: `https://psn-api.vercel.app`

---

## 🔒 Sécurité importante

### ⚠️ NE JAMAIS hardcoder les identifiants dans le code

**Option 1: Variables d'environnement (recommandé pour un service personnel)**
```typescript
// Dans server.ts
const ADMIN_USER = process.env.PSN_USERNAME;
const ADMIN_PASS = process.env.PSN_PASSWORD;

// Endpoint simplifié
app.post('/my-data', async (req, res) => {
  const { cookies } = await authenticatePSN({ 
    username: ADMIN_USER, 
    password: ADMIN_PASS 
  });
  const client = new PSNClient(cookies);
  const grades = await getGrades(client);
  res.json({ grades });
});
```

**Option 2: Auth par token (pour usage public)**
```typescript
const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
});
```

---

## 📦 Persistence des cookies (Production)

Le server actuel utilise la mémoire (les sessions sont perdues au redémarrage).

**Pour la production, utilise Redis:**

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Sauvegarder session
await redis.setEx(`session:${sessionId}`, 14400, JSON.stringify(cookies));

// Récupérer session
const data = await redis.get(`session:${sessionId}`);
const cookies = JSON.parse(data);
```

**Redis gratuit:**
- Upstash: 10k requêtes/jour gratuit
- Redis Cloud: 30MB gratuit
- Railway Redis addon

---

## 🧪 Tester l'API déployée

```bash
# Health check
curl https://ton-app.onrender.com/health

# Authentification
curl -X POST https://ton-app.onrender.com/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"oscar.fanon","password":"ton_mdp"}'

# Récupérer les notes (avec le sessionId reçu)
curl -X POST https://ton-app.onrender.com/grades \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"xyz123abc"}'
```

**Ou depuis JavaScript:**
```javascript
// 1. Auth
const auth = await fetch('https://ton-app.onrender.com/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'oscar.fanon', password: 'mdp' })
});
const { sessionId } = await auth.json();

// 2. Get grades
const grades = await fetch('https://ton-app.onrender.com/grades', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId })
});
const data = await grades.json();
console.log(data.data.grades);
```

---

## 💰 Comparaison des plans gratuits

| Plateforme | RAM | CPU | Durée | Sleep | Région EU |
|------------|-----|-----|-------|-------|-----------|
| Render     | 512MB | Shared | 750h/mois | Oui (15min) | ❌ US |
| Fly.io     | 256MB | Shared | Illimité | Non | ✅ Paris |
| Railway    | 512MB | Shared | 5$/mois | Non | ✅ EU |
| Vercel     | 1GB | Serverless | Illimité | Cold start | ✅ Edge |

**Recommandation:** 
- Usage perso: **Fly.io** (pas de sleep, région Paris)
- Prototype public: **Render** (simple, HTTPS auto)
- Site web intégré: **Vercel** (ultra rapide)

---

## 🔥 Optimisations

### Réduire les redémarrages (Render/Railway)
```typescript
// Ping toutes les 10 minutes pour éviter le sleep
if (process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
  setInterval(() => {
    fetch(`http://localhost:${PORT}/health`).catch(() => {});
  }, 600000);
}
```

### Rate limiting
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requêtes max
});
app.use(limiter);
```

---

## 📱 Frontend intégré (optionnel)

Tu peux aussi servir un frontend depuis la même app:

```typescript
import path from 'path';
app.use(express.static('public'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

Crée `public/index.html` avec un petit dashboard Vue/React/vanilla JS.

---

## ⚠️ Limitations à connaître

1. **Timeout**: Keycloak peut prendre 5-10s → utiliser des plateformes avec timeout >30s
2. **Cold starts**: Sur Vercel/serverless, première requête lente
3. **IP bloquées**: Si trop de requêtes depuis une IP, monlycee peut bloquer temporairement
4. **2FA**: Si le compte a 2FA activé, l'auth HTTP-only échouera

---

## 🆘 Support

Si tu rencontres des problèmes:
1. Check les logs: `fly logs`, `railway logs`, Render dashboard
2. Vérifier les variables d'environnement
3. Tester en local d'abord: `npm run dev`
