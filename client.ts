// Client HTTP simple pour PSN
// Fichier autonome, pas d'imports du projet

import got from 'got';
import type { Cookie } from './types.js';

export class PSNClient {
  private cookieHeader: string;
  
  constructor(
    private cookies: Cookie[],
    private psnUrl: string = 'https://psn.monlycee.net'
  ) {
    this.cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.psnUrl}${path}`;
    const response = await got(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Cookie': this.cookieHeader,
        ...(headers || {})
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      ...(body && typeof body !== 'string' ? { 
        headers: { 'Content-Type': 'application/json' } 
      } : {})
    });
    
    return JSON.parse(response.body) as T;
  }
}
