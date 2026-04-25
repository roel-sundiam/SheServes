import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ServicePayment {
  _id: string;
  amount: number;
  date: string;
  paidBy: string;
  note: string;
  createdAt: string;
}

export interface FinanceEntry {
  _id: string;
  entryType: 'cash-in' | 'cash-out';
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getAll() {
    return this.http.get<FinanceEntry[]>(`${this.API}/finances`);
  }

  create(payload: { entryType: string; amount: number; description: string; date: string; createdBy: string }) {
    return this.http.post<FinanceEntry>(`${this.API}/finances`, payload);
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/finances/${id}`);
  }

  getPayments() {
    return this.http.get<ServicePayment[]>(`${this.API}/service-payments`);
  }

  createPayment(payload: { amount: number; date: string; paidBy: string; note: string }) {
    return this.http.post<ServicePayment>(`${this.API}/service-payments`, payload);
  }
}
