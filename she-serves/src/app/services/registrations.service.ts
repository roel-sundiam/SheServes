import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface SheetData {
  columns: string[];
  rows: Record<string, string>[];
}

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getRegistrations() {
    return this.http.get<SheetData>(`${this.API}/registrations`);
  }
}
