import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private analytics = inject(AnalyticsService);

  data        = signal<any>(null);
  loading     = signal(true);
  refreshing  = signal(false);
  error       = signal('');

  newPageIds   = signal<Set<string>>(new Set());
  newLoginIds  = signal<Set<string>>(new Set());
  toast        = signal('');

  activeTab    = signal<'pages' | 'coins'>('pages');
  coinPeriod   = signal<'day' | 'week' | 'month'>('day');
  coinByPeriod = signal<{ _id: string; coins: number; count: number }[]>([]);
  coinByPage   = signal<{ _id: string; coins: number; count: number }[]>([]);
  coinError    = signal('');

  private refreshInterval: any;
  private toastTimer: any;

  ngOnInit() {
    this.loadData();
    this.loadCoinReports();
    this.refreshInterval = setInterval(() => { this.loadData(); this.loadCoinReports(); }, 30000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearTimeout(this.toastTimer);
  }

  refresh() {
    this.loadData();
    this.loadCoinReports();
  }

  private loadData() {
    if (this.data()) {
      this.refreshing.set(true);
    }
    this.analytics.getAnalytics().subscribe({
      next: (res) => {
        const prev = this.data();
        if (prev) {
          this.newPageIds.set(new Set());
          this.newLoginIds.set(new Set());

          const prevPageCounts = new Map<string, number>(
            prev.visitsByPage.map((p: any) => [p._id, p.count])
          );
          const changedPages = new Set<string>(
            res.visitsByPage
              .filter((p: any) => (prevPageCounts.get(p._id) ?? 0) !== p.count)
              .map((p: any) => p._id)
          );
          this.newPageIds.set(changedPages);

          const prevLoginIds = new Set<string>(prev.recentLogins.map((l: any) => l._id));
          const newLogins = new Set<string>(
            res.recentLogins
              .filter((l: any) => !prevLoginIds.has(l._id))
              .map((l: any) => l._id)
          );
          this.newLoginIds.set(newLogins);

          if (changedPages.size || newLogins.size) {
            this.playChime();
            const parts = [];
            if (changedPages.size) parts.push(`${changedPages.size} page${changedPages.size > 1 ? 's' : ''} updated`);
            if (newLogins.size)   parts.push(`${newLogins.size} new login${newLogins.size > 1 ? 's' : ''}`);
            this.showToast(parts.join(' · '));
          }
        }
        this.data.set(res);
        this.loading.set(false);
        this.refreshing.set(false);
      },
      error: () => {
        this.error.set('Failed to load analytics.');
        this.loading.set(false);
        this.refreshing.set(false);
      }
    });
  }

  private playChime() {
    try {
      const ctx = new AudioContext();
      const notes = [783.99, 987.77, 1174.66];
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
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

  private showToast(message: string) {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(''), 4000);
  }

  setPeriod(p: 'day' | 'week' | 'month') {
    this.coinPeriod.set(p);
    this.analytics.getCoinReportPeriod(p).subscribe({
      next: (rows) => this.coinByPeriod.set(rows),
    });
  }

  private loadCoinReports() {
    this.coinError.set('');
    this.analytics.getCoinReportPeriod(this.coinPeriod()).subscribe({
      next:  (rows) => this.coinByPeriod.set(rows),
      error: (err)  => this.coinError.set(`Period report error: ${err?.status ?? 'unknown'} — ${err?.error?.message ?? err?.message ?? 'check console'}`),
    });
    this.analytics.getCoinReportPage().subscribe({
      next:  (rows) => this.coinByPage.set(rows),
      error: (err)  => this.coinError.set(`Page report error: ${err?.status ?? 'unknown'} — ${err?.error?.message ?? err?.message ?? 'check console'}`),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
