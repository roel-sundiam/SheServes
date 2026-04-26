import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  private readonly TRACKER = environment.bo2tTrackerUrl;

  isLoggedIn  = signal(this.checkSession());
  currentUser = signal(sessionStorage.getItem('ss_user') ?? '');
  isSuperAdmin = signal(sessionStorage.getItem('ss_user') === 'admin');

  constructor(private http: HttpClient) {}

  async login(username: string, password: string): Promise<{ ok: boolean; message: string }> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API}/login`, { username, password })
      );
      sessionStorage.setItem('ss_admin', '1');
      sessionStorage.setItem('ss_user', username);
      this.isLoggedIn.set(true);
      this.currentUser.set(username);
      this.isSuperAdmin.set(username === 'admin');
      const blob = new Blob([JSON.stringify({ event: 'login', appId: 'sheservestc', userId: username, timestamp: new Date().toISOString() })], { type: 'text/plain' });
      navigator.sendBeacon(this.TRACKER, blob);
      return { ok: true, message: '' };
    } catch (err: any) {
      const message = err?.error?.message || 'Invalid username or password.';
      return { ok: false, message };
    }
  }

  logout() {
    sessionStorage.removeItem('ss_admin');
    sessionStorage.removeItem('ss_user');
    this.isLoggedIn.set(false);
    this.currentUser.set('');
    this.isSuperAdmin.set(false);
  }

  private checkSession(): boolean {
    return sessionStorage.getItem('ss_admin') === '1';
  }
}
