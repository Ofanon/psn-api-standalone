// Gestion des devoirs
// Fichier autonome, pas d'imports du projet

import { PSNClient } from './client.js';
import { getLogbook, getStudent } from './logbook.js';
import type { PSNHomework } from './types.js';

export async function getHomework(client: PSNClient): Promise<PSNHomework[]> {
  const logbook = await getLogbook(client);
  const student = getStudent(logbook);
  return student?.work?.homework || [];
}

export function formatHomework(hw: PSNHomework): string {
  const subject = typeof hw.subject === 'string' ? hw.subject : hw.subject?.name || hw.subjectId || 'Matière inconnue';
  const status = hw.done ? '✅' : '⏳';
  const desc = hw.description ? ` - ${hw.description.substring(0, 50)}` : '';
  return `${status} ${subject} → ${hw.date}${desc}`;
}

export function printHomework(homework: PSNHomework[], limit = 10) {
  console.log(`\n📝 ${homework.length} devoir(s):`);
  homework.slice(0, limit).forEach((hw, i) => {
    console.log(`  [${i + 1}] ${formatHomework(hw)}`);
  });
  if (homework.length > limit) {
    console.log(`  ... et ${homework.length - limit} autres`);
  }
}
