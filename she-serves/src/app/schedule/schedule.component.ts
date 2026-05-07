import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScheduleService, ScheduleCategory, ScheduleEntry } from '../services/schedule.service';
import { PushNotificationService } from '../services/push-notification.service';
import { CoinsService } from '../services/coins.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent implements OnInit {
  private svc  = inject(ScheduleService);
  private push = inject(PushNotificationService);
  coins = inject(CoinsService);

  schedules = signal<ScheduleEntry[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.push.clearBadge();
    this.svc.getAll().subscribe({
      next: (data) => {
        const now = Date.now();
        const upcoming = data.filter(item => {
          const d = item.startsAt
            ? new Date(item.startsAt)
            : new Date(`${item.eventDate}T${item.eventTime || '00:00'}`);
          return d.getTime() >= now;
        });
        this.schedules.set(upcoming);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  formatCategory(category: ScheduleCategory): string {
    switch (category) {
      case 'tournament':
        return 'Tournament';
      case 'open-play':
        return 'Open Play';
      default:
        return 'Private Event';
    }
  }

  formatDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(value: string): string {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
