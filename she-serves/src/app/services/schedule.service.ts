import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ScheduleCategory = 'tournament' | 'open-play' | 'private-event';

export interface ScheduleEntry {
  _id: string;
  category: ScheduleCategory;
  eventDate: string;
  eventTime: string;
  place: string;
  startsAt: string;
  createdBy: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getAll() {
    return this.http.get<ScheduleEntry[]>(`${this.API}/schedules`);
  }

  create(payload: { category: ScheduleCategory; eventDate: string; eventTime: string; place: string; createdBy: string }) {
    return this.http.post<ScheduleEntry>(`${this.API}/schedules`, payload);
  }

  update(id: string, payload: { category: ScheduleCategory; eventDate: string; eventTime: string; place: string; createdBy: string }) {
    return this.http.put<ScheduleEntry>(`${this.API}/schedules/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/schedules/${id}`);
  }
}
