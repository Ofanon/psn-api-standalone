// Authentification HTTP-only pour PSN (monlycee.net)
// Fichier autonome, pas d'imports du projet

import got from 'got';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';
import type { Cookie } from './types';

export interface AuthParams {
  username: string;
  password: string;
  psnUrl?: string;
}

export async function authenticatePSN(params: AuthParams): Promise<{ cookies: Cookie[] }> {
  const psnUrl = params.psnUrl || 'https://psn.monlycee.net';
  const cookieJar = new CookieJar();
  const client = got.extend({
    cookieJar,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    followRedirect: true,
    throwHttpErrors: false
  });

  // 1) Touch PSN to get redirected to Keycloak
  const entry = await client.get(`${psnUrl}/logbook`);
  const html = entry.body || '';

  // Already authenticated?
  if (entry.headers['content-type']?.includes('application/json')) {
    const cookies = await cookieJar.getCookies(psnUrl);
    return { cookies: cookies.map(c => ({ name: c.key, value: c.value, domain: c.domain || '.monlycee.net' })) };
  }

  // 2) Parse login form
  const $ = cheerio.load(html);
  const form = $('form').first();
  const action = form.attr('action');
  if (!action) throw new Error('Formulaire de connexion introuvable');
  
  const loginUrl = new URL(action, entry.url || `${psnUrl}/`).toString();
  const formData = new URLSearchParams();
  
  form.find('input').each((_i, el) => {
    const name = $(el).attr('name');
    if (name) formData.append(name, $(el).attr('value') || '');
  });

  formData.set('username', params.username);
  formData.set('password', params.password);
  if (!formData.has('credentialId')) formData.set('credentialId', '');

  // 3) Submit credentials
  await client.post(loginUrl, {
    body: formData.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  // 4) Validate session
  const cookiesAfter = await cookieJar.getCookies(psnUrl);
  const cookieHeader = cookiesAfter.map(c => `${c.key}=${c.value}`).join('; ');
  
  const jsonResp = await got.get(`${psnUrl}/logbook`, {
    headers: { 
      'Accept': 'application/json', 
      'User-Agent': 'Mozilla/5.0',
      'Cookie': cookieHeader 
    },
    throwHttpErrors: false
  });

  if (!jsonResp.headers['content-type']?.includes('application/json')) {
    throw new Error('Authentification échouée (2FA ou consentement requis?)');
  }

  const finalCookies = await cookieJar.getCookies(psnUrl);
  return { cookies: finalCookies.map(c => ({ name: c.key, value: c.value, domain: c.domain || '.monlycee.net' })) };
}
