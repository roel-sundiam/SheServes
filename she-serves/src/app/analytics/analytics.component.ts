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

  private refreshInterval: any;

  ngOnInit() {
    this.loadData();
    this.refreshInterval = setInterval(() => this.loadData(), 30000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
  }

  refresh() {
    this.loadData();
  }

  private loadData() {
    if (this.data()) {
      this.refreshing.set(true);
    }
    this.analytics.getAnalytics().subscribe({
      next: (res) => {
        const prev = this.data();
        if (prev) {
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
            setTimeout(() => {
              this.newPageIds.set(new Set());
              this.newLoginIds.set(new Set());
            }, 4000);
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

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
