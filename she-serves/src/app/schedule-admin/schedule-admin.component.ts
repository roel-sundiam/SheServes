import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ScheduleService, ScheduleCategory, ScheduleEntry } from '../services/schedule.service';
import { CoinsService } from '../services/coins.service';

@Component({
  selector: 'app-schedule-admin',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './schedule-admin.component.html',
  styleUrl: './schedule-admin.component.css',
})
export class ScheduleAdminComponent implements OnInit {
  private auth  = inject(AuthService);
  private router = inject(Router);
  private svc   = inject(ScheduleService);
  private coins = inject(CoinsService);

  schedules  = signal<ScheduleEntry[]>([]);
  loading    = signal(true);
  submitting = signal(false);
  error      = signal('');
  success    = signal('');
  editingId  = signal<string | null>(null);

  categories: { value: ScheduleCategory; label: string }[] = [
    { value: 'tournament', label: 'Tournament' },
    { value: 'open-play', label: 'Open Play' },
    { value: 'private-event', label: 'Private Event' },
  ];

  form: { category: ScheduleCategory; eventDate: string; eventTime: string; place: string; tournamentName: string } = {
    category: 'tournament',
    eventDate: '',
    eventTime: '',
    place: '',
    tournamentName: '',
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load schedules.');
        this.loading.set(false);
      },
    });
  }

  startEdit(item: ScheduleEntry) {
    this.editingId.set(item._id);
    this.form = {
      category: item.category,
      eventDate: item.eventDate,
      eventTime: item.eventTime,
      place: item.place,
      tournamentName: item.tournamentName || '',
    };
    this.error.set('');
    this.success.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.form = { category: 'tournament', eventDate: '', eventTime: '', place: '', tournamentName: '' };
    this.error.set('');
    this.success.set('');
  }

  submit() {
    if (!this.form.eventDate || !this.form.eventTime || !this.form.place.trim()) {
      this.error.set('Category, date, time, and place are required.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    this.success.set('');

    const payload = {
      category: this.form.category,
      eventDate: this.form.eventDate,
      eventTime: this.form.eventTime,
      place: this.form.place.trim(),
      tournamentName: this.form.category === 'tournament' ? this.form.tournamentName.trim() : '',
      createdBy: this.auth.currentUser() || 'admin',
    };

    const id = this.editingId();

    if (id) {
      this.svc.update(id, payload).subscribe({
        next: (updated) => {
          this.schedules.update(list =>
            list.map(s => s._id === id ? updated : s)
                .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
          );
          this.cancelEdit();
          this.success.set('Schedule updated successfully!');
          this.submitting.set(false);
          this.coins.deductAdmin('edit schedule');
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Failed to update schedule. Please try again.');
          this.submitting.set(false);
        },
      });
    } else {
      this.svc.create(payload).subscribe({
        next: (item) => {
          this.schedules.update(list =>
            [item, ...list].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
          );
          this.form = { category: 'tournament', eventDate: '', eventTime: '', place: '', tournamentName: '' };
          this.success.set('Schedule saved successfully!');
          this.submitting.set(false);
          this.coins.deductAdmin('create schedule');
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Failed to save schedule. Please try again.');
          this.submitting.set(false);
        },
      });
    }
  }

  remove(id: string) {
    this.svc.delete(id).subscribe({
      next: () => this.schedules.update((list) => list.filter((s) => s._id !== id)),
      error: () => this.error.set('Failed to delete schedule.'),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
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
