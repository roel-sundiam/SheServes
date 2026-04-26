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

  announcements = signal<Announcement[]>([]);
  loading   = signal(true);
  submitting = signal(false);
  error     = signal('');
  success   = signal('');

  form = { title: '', message: '', type: 'announcement', eventDate: '', place: '' };

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.announcements.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Failed to load announcements.'); this.loading.set(false); },
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
    this.svc.create({ ...this.form, createdBy: this.auth.currentUser() }).subscribe({
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

  remove(id: string) {
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
}
