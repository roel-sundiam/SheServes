import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FinanceService, FinanceEntry, ServicePayment } from '../services/finance.service';
import { CoinsService } from '../services/coins.service';

@Component({
  selector: 'app-finance-admin',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './finance-admin.component.html',
  styleUrl: './finance-admin.component.css',
})
export class FinanceAdminComponent implements OnInit {
  private auth  = inject(AuthService);
  private router = inject(Router);
  private svc   = inject(FinanceService);
  private coins = inject(CoinsService);

  activeTab  = signal<'finance' | 'app-service'>('finance');
  entries    = signal<FinanceEntry[]>([]);
  payments   = signal<ServicePayment[]>([]);
  loading    = signal(true);
  submitting = signal(false);
  paying     = signal(false);
  error      = signal('');
  success    = signal('');

  form = { entryType: 'cash-in', amount: null as number | null, description: '', date: '' };

  readonly dueDate = (() => {
    const d = new Date();
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return last.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  })();

  totalIn     = computed(() => this.entries().filter(e => e.entryType === 'cash-in').reduce((s, e) => s + e.amount, 0));
  totalOut    = computed(() => this.entries().filter(e => e.entryType === 'cash-out').reduce((s, e) => s + e.amount, 0));
  netIncome   = computed(() => this.totalIn() - this.totalOut());
  fee         = computed(() => this.netIncome() > 0 ? this.netIncome() * 0.20 : 0);
  balance     = computed(() => this.netIncome() - this.fee());
  totalPaid   = computed(() => this.payments().reduce((s, p) => s + p.amount, 0));
  outstanding = computed(() => Math.max(0, this.fee() - this.totalPaid()));

  ngOnInit() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.entries.set(data); this.loading.set(false); },
      error: ()    => { this.error.set('Failed to load entries.'); this.loading.set(false); },
    });
    this.svc.getPayments().subscribe({
      next: (data) => this.payments.set(data),
      error: ()    => {},
    });
  }

  switchTab(tab: 'finance' | 'app-service') {
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
  }

  submit() {
    if (this.form.amount == null || this.form.amount <= 0 || !this.form.description.trim() || !this.form.date) {
      this.error.set('Amount, description, and date are required.');
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.success.set('');
    this.svc.create({
      entryType: this.form.entryType,
      amount: this.form.amount,
      description: this.form.description.trim(),
      date: this.form.date,
      createdBy: this.auth.currentUser(),
    }).subscribe({
      next: (item) => {
        this.entries.update(list => [item, ...list]);
        this.form = { entryType: 'cash-in', amount: null, description: '', date: '' };
        this.success.set('Entry added!');
        this.submitting.set(false);
        this.coins.deductAdmin('add finance entry');
      },
      error: () => {
        this.error.set('Failed to save. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  remove(id: string) {
    this.svc.delete(id).subscribe({
      next: () => this.entries.update(list => list.filter(e => e._id !== id)),
      error: () => this.error.set('Failed to delete.'),
    });
  }

  pay() {
    const amount = this.outstanding();
    if (amount <= 0) return;
    this.paying.set(true);
    this.error.set('');
    this.success.set('');
    const today = new Date().toISOString().slice(0, 10);
    this.svc.createPayment({ amount, date: today, paidBy: this.auth.currentUser(), note: '' }).subscribe({
      next: (payment) => {
        this.payments.update(list => [payment, ...list]);
        this.success.set(`Payment of ₱ ${this.fmt(amount)} recorded!`);
        this.paying.set(false);
        this.coins.deductAdmin('record service payment');
      },
      error: () => {
        this.error.set('Failed to record payment. Please try again.');
        this.paying.set(false);
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  fmt(n: number) {
    return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(str: string) {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
