import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnnouncementsService, Announcement } from '../services/announcements.service';
import { PushNotificationService } from '../services/push-notification.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent implements OnInit {
  private svc   = inject(AnnouncementsService);
  private push  = inject(PushNotificationService);

  annIndex      = signal(0);
  announcements = signal<Announcement[]>([]);
  loading       = signal(true);

  private touchStartX = 0;

  ngOnInit() {
    this.push.clearBadge();
    this.svc.getAll().subscribe({
      next: (data) => { this.announcements.set(data); this.loading.set(false); },
      error: ()    => { this.loading.set(false); },
    });
  }

  prev() {
    const len = this.announcements().length;
    this.annIndex.update(i => (i - 1 + len) % len);
  }

  next() {
    const len = this.announcements().length;
    this.annIndex.update(i => (i + 1) % len);
  }

  goTo(i: number) { this.annIndex.set(i); }

  onTouchStart(e: TouchEvent) { this.touchStartX = e.touches[0].clientX; }

  onTouchEnd(e: TouchEvent) {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
  }

  current() { return this.announcements()[this.annIndex()]; }

  formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

buildEventSentence(item: Announcement): string {
    const hasDate  = !!item.eventDate;
    const hasPlace = !!item.place;
    if (hasDate && hasPlace)
      return `The event will be held on ${this.formatDateTime(item.eventDate!)} at ${item.place}.`;
    if (hasDate)
      return `The event will be held on ${this.formatDateTime(item.eventDate!)}.`;
    return `The event will be held at ${item.place}.`;
  }
}
