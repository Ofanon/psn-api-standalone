// Point d'entrée CLI pour le module PSN standalone
// Fichier autonome, pas d'imports du projet

import { select, input, password as askPassword, confirm } from '@inquirer/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { authenticatePSN } from './auth.js';
import { PSNClient } from './client.js';
import { getLogbook, getStudentName } from './logbook.js';
import { getGrades, printGrades } from './grades.js';
import { getHomework, printHomework } from './homework.js';
import { getMessages, printMessages } from './messages.js';
import type { Cookie } from './types.js';

const COOKIES_PATH = path.join(process.cwd(), '.psn-cookies.json');

function saveCookies(cookies: Cookie[]) {
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log(`✅ Cookies sauvegardés → ${COOKIES_PATH}`);
}

function loadCookies(): Cookie[] {
  if (!fs.existsSync(COOKIES_PATH)) {
    throw new Error('Fichier .psn-cookies.json introuvable. Authentifie-toi d\'abord.');
  }
  return JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8')) as Cookie[];
}

async function runAuth() {
  console.log('\n🔐 Authentification HTTP-only\n');
  const username = await input({ message: 'Utilisateur' });
  const pwd = await askPassword({ message: 'Mot de passe' });
  
  console.log('⏳ Connexion en cours...');
  const { cookies } = await authenticatePSN({ username, password: pwd });
  console.log(`✅ Authentifié (${cookies.length} cookies)`);
  
  if (await confirm({ message: 'Sauvegarder les cookies ?', default: true })) {
    saveCookies(cookies);
  }
  
  const client = new PSNClient(cookies);
  const logbook = await getLogbook(client);
  console.log(`👤 ${getStudentName(logbook)}`);
}

async function runOverview() {
  console.log('\n📋 Vue d\'ensemble\n');
  const cookies = loadCookies();
  const client = new PSNClient(cookies);
  const logbook = await getLogbook(client);
  
  console.log(`👤 ${getStudentName(logbook)}`);
  const student = logbook?.structures?.[0]?.individuals?.[0];
  const grades = student?.notation?.grades || [];
  const homework = student?.work?.homework || [];
  
  console.log(`📊 ${grades.length} note(s)`);
  console.log(`📝 ${homework.length} devoir(s)`);
}

async function runGrades() {
  const cookies = loadCookies();
  const client = new PSNClient(cookies);
  const grades = await getGrades(client);
  printGrades(grades);
}

async function runHomework() {
  const cookies = loadCookies();
  const client = new PSNClient(cookies);
  const homework = await getHomework(client);
  printHomework(homework);
}

async function runMessages() {
  const cookies = loadCookies();
  const client = new PSNClient(cookies);
  const messages = await getMessages(client);
  printMessages(messages);
}

async function main() {
  console.log('======================================================================');
  console.log('🧩 PSN STANDALONE — Module autonome pour monlycee.net');
  console.log('======================================================================');
  
  let looping = true;
  while (looping) {
    const choice = await select({
      message: 'Que veux-tu faire ?',
      choices: [
        { value: 'auth', name: '🔐 Authentification (HTTP-only)' },
        { value: 'overview', name: '📋 Vue d\'ensemble' },
        { value: 'grades', name: '📊 Voir les notes' },
        { value: 'homework', name: '📝 Voir les devoirs' },
        { value: 'messages', name: '💬 Voir les messages' },
        { value: 'quit', name: '❌ Quitter' }
      ]
    });
    
    try {
      if (choice === 'auth') await runAuth();
      else if (choice === 'overview') await runOverview();
      else if (choice === 'grades') await runGrades();
      else if (choice === 'homework') await runHomework();
      else if (choice === 'messages') await runMessages();
      else if (choice === 'quit') looping = false;
    } catch (e: any) {
      console.error(`\n❌ Erreur: ${e?.message || e}\n`);
    }
    
    if (looping) console.log('\n' + '—'.repeat(70) + '\n');
  }
}

main();
