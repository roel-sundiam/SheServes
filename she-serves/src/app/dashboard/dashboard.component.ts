import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnnouncementsService, Announcement } from '../services/announcements.service';
import { ScheduleService, ScheduleEntry } from '../services/schedule.service';
import { CoinsService } from '../services/coins.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private announcementsSvc = inject(AnnouncementsService);
  private schedulesSvc = inject(ScheduleService);
  coins = inject(CoinsService);
  readonly facebookProfileUrl = 'https://www.facebook.com/profile.php?id=61572091603666';

  latestAnnouncement = signal<Announcement | null>(null);
  upcomingSchedule = signal<ScheduleEntry | null>(null);
  showAnnouncementModal = signal(false);
  showScheduleModal = signal(false);
  loadingAnnouncement = signal(true);

  todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  cards = [
    {
      icon: '🏆',
      label: 'Tournament',
      description: 'Track brackets and latest winners',
      route: '#',
      accent: '#f09a36',
      status: 'soon',
    },
    {
      icon: '📅',
      label: 'Schedule',
      description: 'See upcoming fixtures and venue slots',
      route: '/schedule',
      accent: '#6e9287',
      status: 'live',
    },
    {
      icon: '📊',
      label: 'Standings',
      description: 'Watch rankings shift after each game',
      route: '#',
      accent: '#8869d3',
      status: 'soon',
    },
    {
      icon: '📣',
      label: 'Announcements',
      description: 'Read official updates from organizers',
      route: '/announcements',
      accent: '#1f7a66',
      status: 'live',
    },
    {
      icon: '📞',
      label: 'Contact',
      description: 'Reach support and event coordinators',
      route: '#',
      accent: '#836f54',
      status: 'soon',
    },
  ];

  ngOnInit() {
    this.announcementsSvc.getAll().subscribe({
      next: (items) => {
        this.latestAnnouncement.set(items.length ? items[0] : null);
        this.showAnnouncementModal.set(items.length > 0);
        this.loadingAnnouncement.set(false);

        if (!items.length && this.upcomingSchedule()) {
          this.showScheduleModal.set(true);
        }
      },
      error: () => {
        this.loadingAnnouncement.set(false);

        if (this.upcomingSchedule()) {
          this.showScheduleModal.set(true);
        }
      },
    });

    this.schedulesSvc.getAll().subscribe({
      next: (items) => {
        const now = Date.now();
        const upcoming = items
          .filter(item => new Date(item.startsAt).getTime() >= now)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] ?? null;

        this.upcomingSchedule.set(upcoming);

        if (upcoming && !this.showAnnouncementModal()) {
          this.showScheduleModal.set(true);
        }
      },
      error: () => {
        this.upcomingSchedule.set(null);
      },
    });
  }

  closeAnnouncementModal() {
    this.showAnnouncementModal.set(false);

    if (this.upcomingSchedule()) {
      this.showScheduleModal.set(true);
    }
  }

  closeScheduleModal() {
    this.showScheduleModal.set(false);
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

  buildEventSentence(item: Announcement): string {
    const hasDate = !!item.eventDate;
    const hasPlace = !!item.place;

    if (hasDate && hasPlace) {
      return `The event will be held on ${this.formatDateTime(item.eventDate!)} at ${item.place}.`;
    }

    if (hasDate) {
      return `The event will be held on ${this.formatDateTime(item.eventDate!)}.`;
    }

    if (hasPlace) {
      return `The event will be held at ${item.place}.`;
    }

    return '';
  }

  scheduleCategoryLabel(category: ScheduleEntry['category']): string {
    if (category === 'tournament') return 'Tournament';
    if (category === 'open-play') return 'Open Play';
    return 'Private Event';
  }

  buildScheduleSentence(item: ScheduleEntry): string {
    return `${this.scheduleCategoryLabel(item.category)} is scheduled on ${this.formatDateTime(item.startsAt)} at ${item.place}.`;
  }
}
