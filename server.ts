// API Server déployable pour PSN
// Fichier autonome pour déploiement sur Render, Railway, Fly.io, etc.

import express, { Request, Response } from 'express';
import { authenticatePSN } from './auth';
import { PSNClient } from './client';
import { getGrades } from './grades';
import { getHomework } from './homework';
import { getLogbook, getStudentName } from './logbook';
import type { Cookie } from './types';

const app = express();
app.use(express.json());

// In-memory session store (pour démo - utiliser Redis en prod)
const sessions = new Map<string, { cookies: Cookie[]; expiresAt: number }>();

// Cleanup expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of sessions.entries()) {
    if (session.expiresAt < now) sessions.delete(key);
  }
}, 3600000);

// Health check pour les plateformes de déploiement
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'PSN API Standalone',
    version: '1.0.0',
    endpoints: {
      'POST /auth': 'Authentification (body: { username, password })',
      'POST /logbook': 'Récupérer le logbook (body: { sessionId })',
      'POST /grades': 'Récupérer les notes (body: { sessionId })',
      'POST /homework': 'Récupérer les devoirs (body: { sessionId })',
      'GET /health': 'Health check'
    }
  });
});

// Authentification
app.post('/auth', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' });
    }

    const { cookies } = await authenticatePSN({ username, password });
    
    // Générer un sessionId
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Stocker en mémoire (expire dans 4 heures)
    sessions.set(sessionId, {
      cookies,
      expiresAt: Date.now() + 4 * 3600000
    });

    res.json({ 
      success: true, 
      sessionId,
      expiresIn: '4 hours'
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    res.status(401).json({ error: error?.message || 'Authentification échouée' });
  }
});

// Logbook
app.post('/logbook', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    const client = new PSNClient(session.cookies);
    const logbook = await getLogbook(client);
    
    res.json({
      success: true,
      data: {
        studentName: getStudentName(logbook),
        logbook
      }
    });
  } catch (error: any) {
    console.error('Logbook error:', error);
    res.status(500).json({ error: error?.message || 'Erreur serveur' });
  }
});

// Notes
app.post('/grades', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    const client = new PSNClient(session.cookies);
    const grades = await getGrades(client);
    
    res.json({
      success: true,
      data: { grades }
    });
  } catch (error: any) {
    console.error('Grades error:', error);
    res.status(500).json({ error: error?.message || 'Erreur serveur' });
  }
});

// Devoirs
app.post('/homework', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    const client = new PSNClient(session.cookies);
    const homework = await getHomework(client);
    
    res.json({
      success: true,
      data: { homework }
    });
  } catch (error: any) {
    console.error('Homework error:', error);
    res.status(500).json({ error: error?.message || 'Erreur serveur' });
  }
});

const PORT: number | string = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PSN API Server running on port ${PORT}`);
});
