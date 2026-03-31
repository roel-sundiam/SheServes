import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegistrationsService } from '../services/registrations.service';

const POLL_INTERVAL_MS = 60_000; // 60 seconds

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './registrations.component.html',
  styleUrl: './registrations.component.css',
})
export class RegistrationsComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private registrationsService = inject(RegistrationsService);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  columns = signal<string[]>([]);
  rows = signal<Record<string, string>[]>([]);
  loading = signal(true);
  refreshing = signal(false);
  error = signal('');
  pageSize = signal(10);
  currentPage = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize())));

  pagedRows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  startItem = computed(() =>
    this.rows().length ? (this.currentPage() - 1) * this.pageSize() + 1 : 0,
  );
  endItem = computed(() =>
    this.rows().length ? Math.min(this.currentPage() * this.pageSize(), this.rows().length) : 0,
  );

  ngOnInit() {
    this.fetchData(true);
    this.pollTimer = setInterval(() => this.fetchData(false), POLL_INTERVAL_MS);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  fetchData(isInitial: boolean) {
    if (isInitial) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }

    this.registrationsService.getRegistrations().subscribe({
      next: (data) => {
        this.columns.set(data.columns);
        this.rows.set(data.rows);
        if (isInitial) {
          this.currentPage.set(1);
          this.loading.set(false);
        } else {
          this.refreshing.set(false);
        }
      },
      error: () => {
        if (isInitial) {
          this.error.set('Failed to load registrations. Please try again later.');
          this.loading.set(false);
        } else {
          this.refreshing.set(false);
        }
      },
    });
  }

  refresh() {
    this.fetchData(false);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  previousPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }
}
