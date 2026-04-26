import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoinsService {
  private readonly API = environment.apiUrl;

  balance = signal<number>(0);
  locked  = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  async loadBalance(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ balance: number }>(`${this.API}/coins/balance`)
      );
      this.balance.set(res.balance);
    } catch {}
  }

  async visitPage(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ balance: number; locked: boolean }>(`${this.API}/coins/visit`, {})
      );
      this.balance.set(res.balance);
      this.locked.set(res.locked);
    } catch {}
  }

  async deductAdmin(reason: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ balance: number }>(`${this.API}/coins/deduct`, { amount: 5 })
      );
      this.balance.set(res.balance);
    } catch (err: any) {
      if (err?.status === 402) {
        console.warn(`Coin deduction failed (${reason}): insufficient coins.`);
      }
    }
  }

  async topUp(amount: number): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ balance: number }>(`${this.API}/coins/topup`, { amount })
      );
      this.balance.set(res.balance);
      this.locked.set(false);
    } catch {}
  }

  async submitRequest(amount: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API}/coins/request`, { amount })
      );
      return true;
    } catch {
      return false;
    }
  }

  async getRequests(): Promise<CoinRequest[]> {
    try {
      return await firstValueFrom(
        this.http.get<CoinRequest[]>(`${this.API}/coins/requests`)
      );
    } catch {
      return [];
    }
  }

  async approveRequest(id: string): Promise<number | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ balance: number }>(`${this.API}/coins/requests/${id}/approve`, {})
      );
      this.balance.set(res.balance);
      return res.balance;
    } catch {
      return null;
    }
  }

  async rejectRequest(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API}/coins/requests/${id}/reject`, {})
      );
      return true;
    } catch {
      return false;
    }
  }
}

export interface CoinRequest {
  _id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  createdAt: string;
}
