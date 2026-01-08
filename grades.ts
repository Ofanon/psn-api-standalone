// Gestion des notes
// Fichier autonome, pas d'imports du projet

import { PSNClient } from './client';
import { getLogbook, getStudent } from './logbook';
import type { PSNGrade } from './types';

export async function getGrades(client: PSNClient): Promise<PSNGrade[]> {
  const logbook = await getLogbook(client);
  const student = getStudent(logbook);
  return student?.notation?.grades || [];
}

export function formatGrade(grade: PSNGrade): string {
  const subject = grade.subject || grade.subjectId || 'Matière inconnue';
  
  // Parse string values ("16,00" and "20")
  const gradeValue = parseFloat(grade.grade.replace(',', '.'));
  const scaleValue = parseFloat(grade.scale);
  
  const percentage = !isNaN(gradeValue) && !isNaN(scaleValue) && scaleValue > 0
    ? Math.round((gradeValue / scaleValue) * 1000) / 10
    : null;
  
  const pct = percentage !== null ? ` (${percentage}%)` : '';
  const gradeDisplay = grade.grade.replace(',', '.'); // Show with dot for readability
  
  return `${subject} → ${gradeDisplay}/${grade.scale}${pct} [${grade.date}]`;
}

export function printGrades(grades: PSNGrade[], limit = 10) {
  console.log(`\n📊 ${grades.length} note(s):`);
  grades.slice(0, limit).forEach((grade, i) => {
    console.log(`  [${i + 1}] ${formatGrade(grade)}`);
  });
  if (grades.length > limit) {
    console.log(`  ... et ${grades.length - limit} autres`);
  }
}
