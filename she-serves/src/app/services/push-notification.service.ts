import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private swPush = inject(SwPush);
  private http   = inject(HttpClient);

  init() {
    if (!this.swPush.isEnabled) return;

    this.swPush
      .requestSubscription({ serverPublicKey: environment.vapidPublicKey })
      .then(sub => {
        this.http
          .post(`${environment.apiUrl}/push/subscribe`, sub)
          .subscribe({ error: () => {} });
      })
      .catch(() => {});

    this.swPush.messages.subscribe(() => {
      this.playChime();
      this.incrementBadge();
    });

    this.restoreBadge();
  }

  clearBadge() {
    localStorage.removeItem('pushBadgeCount');
    (navigator as any).clearAppBadge?.();
  }

  private incrementBadge() {
    const count = (parseInt(localStorage.getItem('pushBadgeCount') || '0', 10)) + 1;
    localStorage.setItem('pushBadgeCount', String(count));
    (navigator as any).setAppBadge?.(count);
  }

  private restoreBadge() {
    const count = parseInt(localStorage.getItem('pushBadgeCount') || '0', 10);
    if (count > 0) (navigator as any).setAppBadge?.(count);
  }

  private playChime() {
    try {
      const ctx   = new AudioContext();
      const notes = [783.99, 987.77, 1174.66];
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type          = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }
}
