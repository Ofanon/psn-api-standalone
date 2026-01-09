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
    const allHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Cookie': this.cookieHeader,
      ...(headers || {})
    } as Record<string, string>;

    if (body && typeof body !== 'string') {
      allHeaders['Content-Type'] = 'application/json';
    }

    const response = await got(url, {
      method,
      headers: allHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      retry: { limit: 1 }
    });
    
    return JSON.parse(response.body) as T;
  }

  async requestRaw(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<string> {
    const url = `${this.psnUrl}${path}`;
    const allHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Cookie': this.cookieHeader,
      ...(headers || {})
    } as Record<string, string>;

    if (body && typeof body !== 'string') {
      allHeaders['Content-Type'] = 'application/json';
    }

    const response = await got(url, {
      method,
      headers: allHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      retry: { limit: 1 }
    });
    
    return response.body;
  }
}
