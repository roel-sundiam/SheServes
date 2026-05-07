import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AnnouncementsService, Announcement } from '../services/announcements.service';
import { CoinsService } from '../services/coins.service';

@Component({
  selector: 'app-announcements-admin',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './announcements-admin.component.html',
  styleUrl: './announcements-admin.component.css',
})
export class AnnouncementsAdminComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private svc    = inject(AnnouncementsService);
  private coins  = inject(CoinsService);

  announcements  = signal<Announcement[]>([]);
  loading        = signal(true);
  submitting     = signal(false);
  error          = signal('');
  success        = signal('');

  form = { title: '', message: '', type: 'announcement', eventDate: '', place: '' };

  editingId      = signal<string | null>(null);
  editSubmitting = signal(false);
  editError      = signal('');
  editForm       = { title: '', message: '', type: 'announcement', eventDate: '', place: '' };

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.announcements.set(data); this.loading.set(false); },
      error: ()    => { this.error.set('Failed to load announcements.'); this.loading.set(false); },
    });
  }

  submit() {
    if (!this.form.title.trim() || !this.form.message.trim()) {
      this.error.set('Title and message are required.');
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.success.set('');

    const payload = {
      ...this.form,
      eventDate: this.toISOForServer(this.form.eventDate),
      createdBy: this.auth.currentUser(),
    };

    this.svc.create(payload).subscribe({
      next: (item) => {
        this.announcements.update(list => [item, ...list]);
        this.form = { title: '', message: '', type: 'announcement', eventDate: '', place: '' };
        this.success.set('Posted successfully!');
        this.submitting.set(false);
        this.coins.deductAdmin('create announcement');
      },
      error: () => {
        this.error.set('Failed to post. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  startEdit(item: Announcement) {
    this.editingId.set(item._id);
    this.editError.set('');
    this.editForm = {
      title:     item.title,
      message:   item.message,
      type:      item.type,
      eventDate: item.eventDate ? this.toLocalDateTimeInput(item.eventDate) : '',
      place:     item.place ?? '',
    };
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editError.set('');
  }

  submitEdit() {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.title.trim() || !this.editForm.message.trim()) {
      this.editError.set('Title and message are required.');
      return;
    }
    this.editSubmitting.set(true);
    this.editError.set('');

    const payload = {
      ...this.editForm,
      eventDate: this.toISOForServer(this.editForm.eventDate),
    };

    this.svc.update(id, payload).subscribe({
      next: (updated) => {
        this.announcements.update(list => list.map(a => a._id === id ? updated : a));
        this.editingId.set(null);
        this.editSubmitting.set(false);
        this.success.set('Updated successfully!');
        setTimeout(() => this.success.set(''), 3000);
      },
      error: () => {
        this.editError.set('Failed to update. Please try again.');
        this.editSubmitting.set(false);
      },
    });
  }

  remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.announcements.update(list => list.filter(a => a._id !== id)),
      error: () => this.error.set('Failed to delete.'),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  // Converts datetime-local string (treated as local by browser) to UTC ISO for server
  private toISOForServer(localStr: string): string {
    if (!localStr) return '';
    return new Date(localStr).toISOString();
  }

  // Converts UTC ISO from server back to local datetime-local string for the input
  private toLocalDateTimeInput(iso: string): string {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  }
}
