import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'announcement' | 'invitation';
  eventDate: string | null;
  place: string | null;
  createdBy: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getAll() {
    return this.http.get<Announcement[]>(`${this.API}/announcements`);
  }

  create(payload: { title: string; message: string; type: string; eventDate: string; place: string; createdBy: string }) {
    return this.http.post<Announcement>(`${this.API}/announcements`, payload);
  }

  update(id: string, payload: { title: string; message: string; type: string; eventDate: string; place: string }) {
    return this.http.put<Announcement>(`${this.API}/announcements/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/announcements/${id}`);
  }
}
