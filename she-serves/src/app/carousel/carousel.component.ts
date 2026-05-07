import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScheduleService, ScheduleEntry } from '../services/schedule.service';
import { CoinsService } from '../services/coins.service';
import { TournamentRegistrationService } from '../services/tournament-registration.service';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  private schedulesSvc = inject(ScheduleService);
  private regSvc = inject(TournamentRegistrationService);
  coins = inject(CoinsService);

  images = [
    { src: 'images/SheServes1.jfif', alt: 'SheServes 1' },
    { src: 'images/SheServes2.jfif', alt: 'SheServes 2' },
    { src: 'images/SheServes3.jfif', alt: 'SheServes 3' },
    { src: 'images/SheServes4.jfif', alt: 'SheServes 4' },
  ];

  currentIndex = signal(0);
  upcomingSchedule = signal<ScheduleEntry | null>(null);
  showScheduleModal = signal(false);
  upcomingTournaments = signal<ScheduleEntry[]>([]);
  private timer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;

  // Registration modal state
  showRegModal       = signal(false);
  selectedTournament = signal<ScheduleEntry | null>(null);
  regForm = { playerName: '' };
  regSubmitting = signal(false);
  regSuccess    = signal('');
  regError      = signal('');

  ngOnInit() {
    this.startAutoPlay();

    this.schedulesSvc.getAll().subscribe({
      next: (items) => {
        const now = Date.now();
        const future = items
          .filter(item => new Date(item.startsAt).getTime() >= now)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        const upcoming = future[0] ?? null;
        this.upcomingSchedule.set(upcoming);
        this.showScheduleModal.set(!!upcoming);

        this.upcomingTournaments.set(future.filter(item => item.category === 'tournament'));
      },
      error: () => {
        this.upcomingSchedule.set(null);
      },
    });
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  prev() {
    this.currentIndex.update(i => (i - 1 + this.images.length) % this.images.length);
    this.resetAutoPlay();
  }

  next() {
    this.currentIndex.update(i => (i + 1) % this.images.length);
    this.resetAutoPlay();
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent) {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.next() : this.prev();
    }
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.resetAutoPlay();
  }

  private startAutoPlay() {
    this.timer = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % this.images.length);
    }, 10000);
  }

  private stopAutoPlay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  closeScheduleModal() {
    this.showScheduleModal.set(false);
  }

  openRegModal(tournament: ScheduleEntry) {
    this.selectedTournament.set(tournament);
    this.regForm = { playerName: '' };
    this.regSuccess.set('');
    this.regError.set('');
    this.showRegModal.set(true);
  }

  closeRegModal() {
    this.showRegModal.set(false);
    this.selectedTournament.set(null);
  }

  submitRegistration() {
    const t = this.selectedTournament();
    if (!t) return;

    const playerName = this.regForm.playerName.trim();
    if (!playerName) {
      this.regError.set('Your name is required.');
      return;
    }

    this.regSubmitting.set(true);
    this.regError.set('');
    this.regSuccess.set('');

    this.regSvc.register({ tournamentId: t._id, playerName }).subscribe({
      next: () => {
        this.regSuccess.set("You're registered! See you on the court.");
        this.regSubmitting.set(false);
        this.regForm = { playerName: '' };
      },
      error: (err) => {
        this.regError.set(err?.error?.message || 'Registration failed. Please try again.');
        this.regSubmitting.set(false);
      },
    });
  }

  scheduleCategoryLabel(category: ScheduleEntry['category']): string {
    if (category === 'tournament') return 'Tournament';
    if (category === 'open-play') return 'Open Play';
    return 'Private Event';
  }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  buildScheduleSentence(item: ScheduleEntry): string {
    return `${this.scheduleCategoryLabel(item.category)} is scheduled on ${this.formatDateTime(item.startsAt)} at ${item.place}.`;
  }
}
