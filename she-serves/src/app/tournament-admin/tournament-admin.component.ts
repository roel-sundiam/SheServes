import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ScheduleService, ScheduleEntry, ScheduleCategory } from '../services/schedule.service';
import {
  TournamentRegistrationService,
  TournamentRegistration,
} from '../services/tournament-registration.service';
import { CoinsService } from '../services/coins.service';

interface TournamentVM extends ScheduleEntry {
  expanded: boolean;
  editing: boolean;
  editName: string;
  editDate: string;
  editTime: string;
  editPlace: string;
  editSubmitting: boolean;
  editError: string;
  registrations: TournamentRegistration[];
  regLoading: boolean;
  regError: string;
}

@Component({
  selector: 'app-tournament-admin',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './tournament-admin.component.html',
  styleUrl: './tournament-admin.component.css',
})
export class TournamentAdminComponent implements OnInit {
  private auth        = inject(AuthService);
  private router      = inject(Router);
  private scheduleSvc = inject(ScheduleService);
  private regSvc      = inject(TournamentRegistrationService);
  private coins       = inject(CoinsService);

  tournaments  = signal<TournamentVM[]>([]);
  loading      = signal(true);
  error        = signal('');
  editSuccess  = signal('');

  ngOnInit() {
    this.scheduleSvc.getAll().subscribe({
      next: (items) => {
        const vms: TournamentVM[] = items
          .filter(s => s.category === 'tournament')
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
          .map(s => ({
            ...s,
            expanded: false,
            editing: false,
            editName: s.tournamentName || '',
            editDate: s.eventDate,
            editTime: s.eventTime,
            editPlace: s.place,
            editSubmitting: false,
            editError: '',
            registrations: [],
            regLoading: false,
            regError: '',
          }));
        this.tournaments.set(vms);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load tournaments.');
        this.loading.set(false);
      },
    });
  }

  startEdit(t: TournamentVM) {
    this.tournaments().forEach(item => { item.editing = false; });
    t.editing = true;
    t.editName  = t.tournamentName || '';
    t.editDate  = t.eventDate;
    t.editTime  = t.eventTime;
    t.editPlace = t.place;
    t.editError = '';
    this.editSuccess.set('');
    this.tournaments.set([...this.tournaments()]);
  }

  cancelEdit(t: TournamentVM) {
    t.editing   = false;
    t.editError = '';
    this.tournaments.set([...this.tournaments()]);
  }

  submitEdit(t: TournamentVM) {
    if (!t.editDate || !t.editTime || !t.editPlace.trim()) {
      t.editError = 'Date, time, and place are required.';
      this.tournaments.set([...this.tournaments()]);
      return;
    }

    t.editSubmitting = true;
    t.editError = '';
    this.tournaments.set([...this.tournaments()]);

    const payload = {
      category: 'tournament' as ScheduleCategory,
      eventDate: t.editDate,
      eventTime: t.editTime,
      place: t.editPlace.trim(),
      tournamentName: t.editName.trim(),
      createdBy: t.createdBy,
    };

    this.scheduleSvc.update(t._id, payload).subscribe({
      next: (updated) => {
        Object.assign(t, updated, {
          editing: false,
          editSubmitting: false,
          editName:  updated.tournamentName || '',
          editDate:  updated.eventDate,
          editTime:  updated.eventTime,
          editPlace: updated.place,
        });
        this.editSuccess.set('Tournament updated.');
        this.tournaments.set([...this.tournaments()]);
        this.coins.deductAdmin('edit tournament');
        setTimeout(() => this.editSuccess.set(''), 3000);
      },
      error: (err) => {
        t.editError = err?.error?.message || 'Failed to update tournament.';
        t.editSubmitting = false;
        this.tournaments.set([...this.tournaments()]);
      },
    });
  }

  deleteTournament(t: TournamentVM) {
    if (!confirm(`Delete this tournament${t.tournamentName ? ' "' + t.tournamentName + '"' : ''}? This cannot be undone.`)) return;
    this.scheduleSvc.delete(t._id).subscribe({
      next: () => {
        this.tournaments.update(list => list.filter(item => item._id !== t._id));
        this.coins.deductAdmin('delete tournament');
      },
      error: () => {
        this.error.set('Failed to delete tournament.');
      },
    });
  }

  toggleExpand(t: TournamentVM) {
    t.expanded = !t.expanded;
    if (t.expanded && t.registrations.length === 0 && !t.regLoading) {
      this.loadRegistrations(t);
    }
    this.tournaments.set([...this.tournaments()]);
  }

  loadRegistrations(t: TournamentVM) {
    t.regLoading = true;
    t.regError = '';
    this.tournaments.set([...this.tournaments()]);

    this.regSvc.getByTournament(t._id).subscribe({
      next: (regs) => {
        t.registrations = regs;
        t.regLoading = false;
        this.tournaments.set([...this.tournaments()]);
      },
      error: () => {
        t.regError = 'Failed to load registrations.';
        t.regLoading = false;
        this.tournaments.set([...this.tournaments()]);
      },
    });
  }

  deleteRegistration(t: TournamentVM, regId: string) {
    this.regSvc.delete(regId).subscribe({
      next: () => {
        t.registrations = t.registrations.filter(r => r._id !== regId);
        this.tournaments.set([...this.tournaments()]);
        this.coins.deductAdmin('delete registration');
      },
      error: () => {
        t.regError = 'Failed to remove registration.';
        this.tournaments.set([...this.tournaments()]);
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  formatDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  formatTime(value: string): string {
    const [h, m] = value.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}
