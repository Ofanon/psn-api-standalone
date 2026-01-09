// Gestion de l'emploi du temps
// Fichier autonome, pas d'imports du projet

import { PSNClient } from './client.js';
import * as cheerio from 'cheerio';
import type { Cheerio } from 'cheerio';

export interface PSNScheduleSlot {
  id?: string;
  subject?: string;
  teacher?: string;
  room?: string;
  startTime: string;
  endTime: string;
  date: string;
  dayOfWeek?: string;
  group?: string;
  color?: string;
}

export async function getSchedule(client: PSNClient): Promise<PSNScheduleSlot[]> {
  try {
    // Récupérer la page d'accueil qui contient l'emploi du temps
    const homeHtml = await client.requestRaw('GET', '/');
    return parseScheduleFromHTML(homeHtml);
  } catch (error) {
    console.warn('⚠️ Emploi du temps non disponible:', error instanceof Error ? error.message : 'Erreur inconnue');
    return [];
  }
}

function parseScheduleFromHTML(html: string): PSNScheduleSlot[] {
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const slots: PSNScheduleSlot[] = [];
  
  // Structure: .box.event > ul > li > h3 (date) + .eventCard
  const eventBoxes = $('.box.event');
  
  if (eventBoxes.length === 0) {
    console.warn('⚠️ Aucune section .box.event trouvée');
    return [];
  }

  eventBoxes.each((_, boxEl) => {
    const $box = $(boxEl);
    const listItems = $box.find('ul > li');
    
    listItems.each((_, liEl) => {
      const $li = $(liEl);
      
      // Récupérer la date du h3
      const dateHeader = $li.find('> h3').text().trim();
      if (!dateHeader) return;
      
      // Récupérer tous les eventCard
      const eventCards = $li.find('.eventCard');
      
      eventCards.each((_, cardEl) => {
        const $card = $(cardEl);
        const slot = parseEventCard($card, dateHeader);
        if (slot) slots.push(slot);
      });
    });
  });
  
  return slots;
}

function parseEventCard($card: Cheerio<any>, dateStr: string): PSNScheduleSlot | null {
  try {
    // Structure typique:
    // .eventCard > .eventCardHeader (subject-teacher)
    // .eventCard > .eventCardBody (times, room, etc.)
    
    const subject = $card.find('[class*="subject"]').text().trim() || 
                   $card.find('strong').first().text().trim() ||
                   $card.text().split('-')[0]?.trim() || 'Cours';
    
    // Extraire les heures: "08:30-10:00" format
    const timeText = $card.find('[class*="time"]').text().trim() ||
                    $card.find('[class*="hour"]').text().trim();
    
    // Extraire teacher et room
    const teacher = $card.find('[class*="teacher"], [class*="professor"]').text().trim() ||
                   $card.find('em').text().trim() || '';
    
    const room = $card.find('[class*="room"], [class*="classroom"]').text().trim() ||
                $card.find('span').last().text().trim() || '';
    
    // Parser les heures
    const timeParts = timeText.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    
    if (!timeParts) {
      // Pas de format d'heure standard trouvé
      return {
        subject: subject.split('|')[0].trim(),
        teacher: teacher,
        room: room,
        startTime: '08:00',
        endTime: '09:00',
        date: dateStr,
        dayOfWeek: extractDayOfWeek(dateStr)
      };
    }
    
    const startTime = `${timeParts[1].padStart(2, '0')}:${timeParts[2]}`;
    const endTime = `${timeParts[3].padStart(2, '0')}:${timeParts[4]}`;
    
    return {
      subject: subject.split('|')[0].trim(),
      teacher: teacher,
      room: room,
      startTime,
      endTime,
      date: dateStr,
      dayOfWeek: extractDayOfWeek(dateStr)
    };
  } catch (error) {
    console.warn('Erreur lors du parsing d\'une carte événement');
    return null;
  }
}

function extractDayOfWeek(dateStr: string): string {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const match = dateStr.match(new RegExp(days.join('|'), 'i'));
  return match ? match[0] : '';
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
