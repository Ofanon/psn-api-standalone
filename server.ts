// API Server déployable pour PSN
// Fichier autonome pour déploiement sur Render, Railway, Fly.io, etc.

import express, { Request, Response } from 'express';
import { authenticatePSN } from './auth.js';
import { PSNClient } from './client.js';
import { getGrades } from './grades.js';
import { getHomework } from './homework.js';
import { getLogbook, getStudentName } from './logbook.js';
import { getMessages } from './messages.js';
import { getSchedule } from './schedule.js';
import type { Cookie } from './types.js';

const app = express();

// CORS middleware - Allow all origins
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.static('.'));

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
    console.log('[AUTH] Request received:', { username: req.body.username });
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' });
    }

    console.log('[AUTH] Authenticating with PSN...');
    const { cookies } = await authenticatePSN({ username, password });
    console.log('[AUTH] Authentication successful, got cookies:', cookies.length);
    
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
    console.log('[LOGBOOK] Request received');
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    console.log('[LOGBOOK] Session found, creating client...');
    const client = new PSNClient(session.cookies);
    console.log('[LOGBOOK] Calling getLogbook...');
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

// Messages
app.post('/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    const client = new PSNClient(session.cookies);
    const messages = await getMessages(client);
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error: any) {
    console.error('Messages error:', error);
    res.status(500).json({ error: error?.message || 'Erreur serveur' });
  }
});

// Emploi du temps
app.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    const client = new PSNClient(session.cookies);
    const schedule = await getSchedule(client);
    
    res.json({
      success: true,
      data: { schedule }
    });
  } catch (error: any) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: error?.message || 'Erreur serveur' });
  }
});

const PORT: number | string = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PSN API Server running on port ${PORT}`);
});
