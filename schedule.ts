// Gestion de l'emploi du temps
// Fichier autonome, pas d'imports du projet

import { PSNClient } from './client.js';
import { getLogbook } from './logbook.js';

export interface PSNScheduleSlot {
  id?: string;
  subject?: string;
  teacher?: string;
  room?: string;
  startTime: string;
  endTime: string;
  date: string;
  dayOfWeek?: string;
}

export async function getSchedule(client: PSNClient): Promise<PSNScheduleSlot[]> {
  try {
    // Essayer d'abord l'endpoint dédié
    const scheduleData = await client.request<any>('GET', '/schedule');
    return parseSchedule(scheduleData);
  } catch (error) {
    // Fallback: essayer de récupérer depuis le logbook
    try {
      const logbook = await getLogbook(client);
      return extractScheduleFromLogbook(logbook);
    } catch (logbookError) {
      console.warn('⚠️ Emploi du temps non disponible');
      return [];
    }
  }
}

function parseSchedule(data: any): PSNScheduleSlot[] {
  // Parser les données de l'emploi du temps selon le format PSN
  if (!data) return [];
  
  // Adapter selon le format réel retourné par PSN
  const slots: PSNScheduleSlot[] = [];
  
  if (Array.isArray(data)) {
    return data.map(slot => ({
      subject: slot.subject || slot.subjectName || 'Cours',
      teacher: slot.teacher || slot.teacherName,
      room: slot.room || slot.roomName,
      startTime: slot.startTime || slot.start,
      endTime: slot.endTime || slot.end,
      date: slot.date,
      dayOfWeek: slot.dayOfWeek || slot.day
    }));
  }
  
  return slots;
}

function extractScheduleFromLogbook(logbook: any): PSNScheduleSlot[] {
  // Tenter d'extraire l'emploi du temps depuis le logbook
  // La structure exacte dépend de l'API PSN
  const scheduleData = logbook?.structures?.[0]?.individuals?.[0]?.schedule;
  
  if (!scheduleData) return [];
  
  return parseSchedule(scheduleData);
}

export function printSchedule(schedule: PSNScheduleSlot[]) {
  console.log(`\n📅 Emploi du temps (${schedule.length} cours):`);
  
  if (schedule.length === 0) {
    console.log('  Aucun cours à afficher');
    return;
  }
  
  const grouped = groupByDate(schedule);
  
  Object.entries(grouped).forEach(([date, slots]) => {
    console.log(`\n  ${date}:`);
    slots.forEach(slot => {
      const room = slot.room ? ` - ${slot.room}` : '';
      const teacher = slot.teacher ? ` (${slot.teacher})` : '';
      console.log(`    ${slot.startTime}-${slot.endTime}: ${slot.subject}${teacher}${room}`);
    });
  });
}

function groupByDate(schedule: PSNScheduleSlot[]): Record<string, PSNScheduleSlot[]> {
  return schedule.reduce((acc, slot) => {
    const date = slot.date || 'Date inconnue';
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, PSNScheduleSlot[]>);
}
