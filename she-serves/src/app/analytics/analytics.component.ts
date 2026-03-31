import { Component, OnInit, inject, signal } from '@angular/core';
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
export class AnalyticsComponent implements OnInit {
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private analytics = inject(AnalyticsService);

  data    = signal<any>(null);
  loading = signal(true);
  error   = signal('');

  ngOnInit() {
    this.analytics.getAnalytics().subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: ()   => { this.error.set('Failed to load analytics.'); this.loading.set(false); }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
