import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface TournamentRegistration {
  _id: string;
  tournamentId: string;
  playerName: string;
  createdAt: string;
}

export interface RegistrationPayload {
  tournamentId: string;
  playerName: string;
}

@Injectable({ providedIn: 'root' })
export class TournamentRegistrationService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getByTournament(tournamentId: string) {
    return this.http.get<TournamentRegistration[]>(
      `${this.API}/tournament-registrations?tournamentId=${tournamentId}`
    );
  }

  register(payload: RegistrationPayload) {
    return this.http.post<TournamentRegistration>(
      `${this.API}/tournament-registrations`,
      payload
    );
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(
      `${this.API}/tournament-registrations/${id}`
    );
  }
}
