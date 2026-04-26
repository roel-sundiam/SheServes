import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = environment.apiUrl;
  private readonly TRACKER = environment.bo2tTrackerUrl;

  trackVisit(page: string) {
    const username = this.auth.currentUser() || null;
    this.http.post(`${this.API}/visit`, { page, username }).subscribe();
    this.beacon({ event: 'page_view', appId: 'sheservestc', page, timestamp: new Date().toISOString() });
  }

  private beacon(payload: object) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
    navigator.sendBeacon(this.TRACKER, blob);
  }

  getAnalytics() {
    return this.http.get<any>(`${this.API}/analytics`);
  }
}
