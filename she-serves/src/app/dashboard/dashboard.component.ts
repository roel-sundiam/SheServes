import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementsService, Announcement } from '../services/announcements.service';
import { ScheduleService, ScheduleEntry } from '../services/schedule.service';
import { CoinsService } from '../services/coins.service';
import { RegistrationsService } from '../services/registrations.service';
import { TournamentRegistrationService, TournamentRegistration } from '../services/tournament-registration.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private announcementsSvc = inject(AnnouncementsService);
  private schedulesSvc     = inject(ScheduleService);
  private registrationsSvc = inject(RegistrationsService);
  private tournamentRegSvc = inject(TournamentRegistrationService);
  coins = inject(CoinsService);

  readonly facebookProfileUrl  = 'https://www.facebook.com/profile.php?id=61572091603666';
  readonly registerFormUrl     = 'https://docs.google.com/forms/d/e/1FAIpQLSdlH_6Uq1BvmnIiWNOjeqMyZRlokT3MHgSTMkfdIu-vzkkPvA/viewform?pli=1';

  latestAnnouncement    = signal<Announcement | null>(null);
  upcomingSchedule      = signal<ScheduleEntry | null>(null);
  showAnnouncementModal = signal(false);
  showScheduleModal     = signal(false);

  announcementsCount = signal(0);
  schedulesCount     = signal(0);
  upcomingTournaments = signal<ScheduleEntry[]>([]);
  memberNames         = signal<string[]>([]);
  loadingMembers      = signal(true);

  featuredTournament = computed(() => this.upcomingTournaments()[0] ?? null);

  selectedTournamentId = signal('');
  selectedPlayerName   = signal('');
  regSubmitting        = signal(false);
  regSuccess           = signal('');
  regError             = signal('');
  showRegModal         = signal(false);

  tourDropOpen  = signal(false);
  nameDropOpen  = signal(false);
  tourSearchQuery = signal('');
  nameSearchQuery = signal('');
  existingRegs  = signal<TournamentRegistration[]>([]);

  registeredMap = computed(() =>
    new Map(this.existingRegs().map(r => [r.playerName, r._id]))
  );

  filteredTournaments = computed(() => {
    const q = this.tourSearchQuery().toLowerCase().trim();
    if (!q) return this.upcomingTournaments();
    return this.upcomingTournaments().filter(t =>
      this.formatTournamentLabel(t).toLowerCase().includes(q) ||
      (t.place || '').toLowerCase().includes(q)
    );
  });

  filteredNames = computed(() => {
    const q = this.nameSearchQuery().toLowerCase().trim();
    if (!q) return this.memberNames();
    return this.memberNames().filter(n => n.toLowerCase().includes(q));
  });

  selectedTournamentLabel = computed(() => {
    const id = this.selectedTournamentId();
    if (!id) return '';
    const t = this.upcomingTournaments().find(x => x._id === id);
    return t ? this.formatTournamentLabel(t) : '';
  });

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('.cselect-tour')) { this.tourDropOpen.set(false); this.tourSearchQuery.set(''); }
    if (!el.closest('.cselect-name')) { this.nameDropOpen.set(false); this.nameSearchQuery.set(''); }
  }

  toggleTourDrop(e: MouseEvent) {
    e.stopPropagation();
    const next = !this.tourDropOpen();
    this.tourDropOpen.set(next);
    this.nameDropOpen.set(false);
  }

  toggleNameDrop(e: MouseEvent) {
    e.stopPropagation();
    const next = !this.nameDropOpen();
    this.nameDropOpen.set(next);
    this.tourDropOpen.set(false);
  }

  selectTournament(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.selectedTournamentId.set(id);
    this.tourDropOpen.set(false);
    this.tourSearchQuery.set('');
    this.existingRegs.set([]);
    if (id) {
      this.tournamentRegSvc.getByTournament(id).subscribe({
        next: regs => this.existingRegs.set(regs),
      });
    }
  }

  removeRegistration(regId: string, e: MouseEvent) {
    e.stopPropagation();
    this.tournamentRegSvc.delete(regId).subscribe({
      next: () => {
        this.existingRegs.update(regs => regs.filter(r => r._id !== regId));
      },
    });
  }

  selectPlayerName(name: string, e: MouseEvent) {
    e.stopPropagation();
    this.selectedPlayerName.set(name);
    this.nameDropOpen.set(false);
    this.nameSearchQuery.set('');
  }

  dayLabel  = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.announcementsSvc.getAll().subscribe({
      next: (items) => {
        this.announcementsCount.set(items.length);
        this.latestAnnouncement.set(items.length ? items[0] : null);
        this.showAnnouncementModal.set(items.length > 0);
        if (!items.length && this.upcomingSchedule()) this.showScheduleModal.set(true);
      },
      error: () => {
        if (this.upcomingSchedule()) this.showScheduleModal.set(true);
      },
    });

    this.schedulesSvc.getAll().subscribe({
      next: (items) => {
        const now = Date.now();
        const future = items
          .filter(i => new Date(i.startsAt).getTime() >= now)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        this.schedulesCount.set(future.length);
        const nonTournament = future.filter(i => i.category !== 'tournament');
        this.upcomingSchedule.set(nonTournament[0] ?? null);
        if (nonTournament[0] && !this.showAnnouncementModal()) this.showScheduleModal.set(true);

        this.upcomingTournaments.set(future.filter(i => i.category === 'tournament'));
      },
      error: () => this.upcomingSchedule.set(null),
    });

    this.registrationsSvc.getRegistrations().subscribe({
      next: (data) => {
        const nameCol = this.findNameColumn(data.columns);
        const names = nameCol
          ? [...new Set(data.rows.map(r => (r[nameCol] || '').trim()).filter(n => n.length > 0))].sort()
          : [];
        this.memberNames.set(names);
        this.loadingMembers.set(false);
      },
      error: () => this.loadingMembers.set(false),
    });
  }

  private findNameColumn(columns: string[]): string | null {
    const lower = columns.map(c => c.toLowerCase());
    for (const t of ['full name', 'fullname', 'name', 'player name', 'playername']) {
      const idx = lower.indexOf(t);
      if (idx !== -1) return columns[idx];
    }
    for (let i = 0; i < lower.length; i++) {
      if (lower[i].includes('name')) return columns[i];
    }
    return columns[0] ?? null;
  }

  openRegModal() {
    this.selectedTournamentId.set('');
    this.selectedPlayerName.set('');
    this.regSuccess.set('');
    this.regError.set('');
    this.showRegModal.set(true);
  }

  closeRegModal() { this.showRegModal.set(false); }

  submitRegistration() {
    const tournamentId = this.selectedTournamentId();
    const playerName   = this.selectedPlayerName();
    if (!tournamentId) { this.regError.set('Please select a tournament.'); return; }
    if (!playerName)   { this.regError.set('Please select your name.'); return; }

    this.regSubmitting.set(true);
    this.regError.set('');
    this.regSuccess.set('');

    this.tournamentRegSvc.register({ tournamentId, playerName }).subscribe({
      next: () => {
        this.regSuccess.set('You are registered! See you at the tournament.');
        this.selectedTournamentId.set('');
        this.selectedPlayerName.set('');
        this.regSubmitting.set(false);
        setTimeout(() => this.regSuccess.set(''), 6000);
      },
      error: (err) => {
        this.regError.set(err?.error?.message || 'Registration failed. Please try again.');
        this.regSubmitting.set(false);
      },
    });
  }

  closeAnnouncementModal() {
    this.showAnnouncementModal.set(false);
    if (this.upcomingSchedule()) this.showScheduleModal.set(true);
  }

  closeScheduleModal() { this.showScheduleModal.set(false); }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  formatShortDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTournamentLabel(t: ScheduleEntry): string {
    const d = this.formatShortDate(t.startsAt);
    return t.tournamentName ? `${t.tournamentName} — ${d}` : `Tournament — ${d}`;
  }

  buildEventSentence(item: Announcement): string {
    const hasDate = !!item.eventDate, hasPlace = !!item.place;
    if (hasDate && hasPlace) return `The event will be held on ${this.formatDateTime(item.eventDate!)} at ${item.place}.`;
    if (hasDate) return `The event will be held on ${this.formatDateTime(item.eventDate!)}.`;
    if (hasPlace) return `The event will be held at ${item.place}.`;
    return '';
  }

  scheduleCategoryLabel(cat: ScheduleEntry['category']) {
    return cat === 'tournament' ? 'Tournament' : cat === 'open-play' ? 'Open Play' : 'Private Event';
  }

  buildScheduleSentence(item: ScheduleEntry) {
    return `${this.scheduleCategoryLabel(item.category)} on ${this.formatDateTime(item.startsAt)} at ${item.place}.`;
  }
}
