# 📤 Mettre PSN Standalone sur GitHub

## Option 1: Créer un nouveau repo dédié (Recommandé)

### Étape 1: Créer le repo sur GitHub

1. Va sur [github.com/new](https://github.com/new)
2. Nom du repo: `psn-api` (ou ce que tu veux)
3. Description: "API autonome pour PSN (monlycee.net) - déployable"
4. Public ou Private (ton choix)
5. **NE PAS** cocher "Add README" (tu en as déjà un)
6. Créer le repository

### Étape 2: Copier le dossier standalone

```bash
# Depuis la racine de Pawnote
cd ..
cp -r Pawnote/examples/psn-standalone psn-api
cd psn-api
```

### Étape 3: Initialiser Git et pousser

```bash
# Initialiser le repo
git init
git add .
git commit -m "Initial commit: PSN API standalone"

# Connecter à GitHub (remplace USERNAME et REPO)
git remote add origin https://github.com/USERNAME/psn-api.git
git branch -M main
git push -u origin main
```

### Étape 4: Déployer depuis GitHub

Maintenant tu peux déployer directement sur:
- **Render**: Connecte le repo GitHub dans Render dashboard
- **Railway**: Deploy from GitHub repo
- **Vercel**: `vercel --prod` depuis le dossier

---

## Option 2: Garder dans le repo Pawnote existant

Si tu veux juste commiter le dossier standalone dans Pawnote:

```bash
cd Pawnote
git add examples/psn-standalone
git commit -m "Add PSN standalone module with deployment configs"
git push
```

Puis sur les plateformes de déploiement:
- **Root directory**: `examples/psn-standalone`
- **Build command**: `npm install`
- **Start command**: `npm start`

---

## 🔒 Sécurité: Variables d'environnement

**IMPORTANT**: Ne jamais commiter de credentials dans le code !

### Sur GitHub (pour les workflows)
1. Repo > Settings > Secrets and variables > Actions
2. Ajouter `PSN_USERNAME` et `PSN_PASSWORD` si nécessaire

### Sur Render/Railway/Fly.io
1. Dans le dashboard de la plateforme
2. Ajouter les variables d'environnement:
   - `PSN_USERNAME` (si tu veux un endpoint simplifié)
   - `PSN_PASSWORD`
   - `API_KEY` (pour sécuriser l'API)

---

## 📦 Structure du repo GitHub

```
psn-api/
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── package.json
├── server.ts
├── auth.ts
├── client.ts
├── types.ts
├── grades.ts
├── homework.ts
├── logbook.ts
├── messages.ts
├── index.ts
├── Dockerfile
├── fly.toml
├── render.yaml
└── vercel.json
```

---

## 🚀 Déploiement automatique

Une fois sur GitHub, configure le déploiement automatique:

### Render
1. Dashboard > New Web Service
2. Connect repository: Sélectionne ton repo GitHub
3. Branch: `main`
4. ✅ Auto-deploy activé (deploy à chaque push)

### Railway
1. New Project > Deploy from GitHub repo
2. Sélectionne le repo
3. ✅ Auto-deploy activé

### Fly.io
```bash
# Connecter le repo
fly launch --dockerfile

# Pour auto-deploy via GitHub Actions
fly tokens create deploy
# Ajouter le token dans GitHub Secrets (FLY_API_TOKEN)
```

---

## 🌐 Rendre le repo public

Si tu veux partager ton API:

1. GitHub > Repo Settings > Danger Zone > Change visibility
2. Ajoute un LICENSE (ex: MIT)
3. Améliore le README avec:
   - Badge de statut (Render/Railway)
   - Exemples d'utilisation
   - API documentation

**Badge exemple:**
```markdown
![Deploy Status](https://img.shields.io/badge/deploy-passing-brightgreen)
```

---

## 🛡️ .gitignore important

Vérifie que ton `.gitignore` contient:
```
node_modules/
.psn-cookies.json
*.log
.env
.DS_Store
dist/
```

**Vérifie qu'aucun cookie/credential n'est commité:**
```bash
git log --all --full-history -- "*.json" | grep -i cookie
```

---

## 📱 Bonus: Badge "Deploy to Render"

Dans ton README, ajoute:
```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/USERNAME/psn-api)
```

Les visiteurs pourront déployer ton API en 1 clic !

---

## ✅ Checklist avant de pousser

- [ ] `.gitignore` configuré
- [ ] Aucun credential dans le code
- [ ] README.md à jour
- [ ] package.json propre (pas de dep inutiles)
- [ ] Testé en local (`npm run dev`)
- [ ] Variables d'env documentées

---

## 🆘 Problèmes courants

**Git refuse de push (too large):**
```bash
# Supprimer node_modules si accidentellement ajouté
git rm -r --cached node_modules
git commit -m "Remove node_modules"
```

**Repo déjà existant:**
```bash
git remote set-url origin https://github.com/USERNAME/nouveau-repo.git
git push -u origin main
```

**Credentials dans l'historique:**
```bash
# Nettoyer l'historique (dangereux, faire un backup avant)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .psn-cookies.json' \
  --prune-empty --tag-name-filter cat -- --all
```
