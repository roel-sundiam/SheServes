import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API = environment.apiUrl;

  trackVisit(page: string) {
    const username = this.auth.currentUser() || null;
    this.http.post(`${this.API}/visit`, { page, username }).subscribe();
  }

  getAnalytics() {
    return this.http.get<any>(`${this.API}/analytics`);
  }
}
