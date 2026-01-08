// Gestion des messages/discussions (stub)
// Fichier autonome, pas d'imports du projet
// TODO: Implémenter si l'endpoint PSN existe

import { PSNClient } from './client';

export interface PSNMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  read: boolean;
  content?: string;
}

export async function getMessages(client: PSNClient): Promise<PSNMessage[]> {
  try {
    // Endpoint hypothétique - à adapter selon l'API réelle
    return await client.request<PSNMessage[]>('GET', '/messages');
  } catch (error) {
    console.warn('⚠️ Endpoint /messages non disponible ou non implémenté');
    return [];
  }
}

export function printMessages(messages: PSNMessage[], limit = 10) {
  console.log(`\n💬 ${messages.length} message(s):`);
  messages.slice(0, limit).forEach((msg, i) => {
    const status = msg.read ? '📭' : '📬';
    console.log(`  [${i + 1}] ${status} ${msg.subject} (de ${msg.from}) - ${msg.date}`);
  });
  if (messages.length > limit) {
    console.log(`  ... et ${messages.length - limit} autres`);
  }
}
