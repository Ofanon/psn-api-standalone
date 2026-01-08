FROM node:20-alpine

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le code source
COPY . .

# Port exposé
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
