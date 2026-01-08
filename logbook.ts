// Récupération du logbook PSN
// Fichier autonome, pas d'imports du projet

import { PSNClient } from './client';
import type { PSNLogbookResponse } from './types';

export async function getLogbook(client: PSNClient): Promise<PSNLogbookResponse> {
  return client.request<PSNLogbookResponse>('GET', '/logbook');
}

export function getStudent(logbook: PSNLogbookResponse) {
  return logbook?.structures?.[0]?.individuals?.[0];
}

export function getStudentName(logbook: PSNLogbookResponse): string {
  const student = getStudent(logbook);
  const firstName = student?.profile?.firstName || '';
  const lastName = student?.profile?.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Inconnu';
}
