import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CoinsService, CoinRequest } from '../services/coins.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {
  private auth  = inject(AuthService);
  private router = inject(Router);
  coins = inject(CoinsService);

  isSuperAdmin = this.auth.isSuperAdmin;
  currentUser  = this.auth.currentUser;
  topUpAmount  = 0;
  topUpSuccess = signal('');
  topUpError   = signal('');
  toppingUp        = signal(false);
  showTopUpModal   = signal(false);
  requestAmount    = 0;
  submittingReq    = signal(false);
  requestSuccess   = signal('');
  requestError     = signal('');
  coinRequests     = signal<CoinRequest[]>([]);
  processingId     = signal<string | null>(null);

  ngOnInit() {
    this.coins.loadBalance();
    if (this.isSuperAdmin()) this.loadRequests();
  }

  async loadRequests() {
    const reqs = await this.coins.getRequests();
    this.coinRequests.set(reqs);
  }

  async submitRequest() {
    if (!this.requestAmount || this.requestAmount <= 0) {
      this.requestError.set('Enter a valid coin amount.');
      return;
    }
    this.submittingReq.set(true);
    this.requestError.set('');
    this.requestSuccess.set('');
    const ok = await this.coins.submitRequest(this.requestAmount);
    if (ok) {
      this.requestSuccess.set(`Request for ${this.requestAmount} coins submitted! The developer will top up after payment.`);
      this.requestAmount = 0;
    } else {
      this.requestError.set('Failed to submit request. Please try again.');
    }
    this.submittingReq.set(false);
  }

  async approve(id: string) {
    this.processingId.set(id);
    await this.coins.approveRequest(id);
    await this.loadRequests();
    this.processingId.set(null);
  }

  async reject(id: string) {
    this.processingId.set(id);
    await this.coins.rejectRequest(id);
    await this.loadRequests();
    this.processingId.set(null);
  }

  async doTopUp() {
    const amount = this.topUpAmount;
    if (!amount || amount <= 0) {
      this.topUpError.set('Enter a positive amount.');
      return;
    }
    this.toppingUp.set(true);
    this.topUpError.set('');
    this.topUpSuccess.set('');
    await this.coins.topUp(amount);
    this.topUpAmount = 0;
    this.topUpSuccess.set(`Added ${amount} coins. New balance: ${this.coins.balance()}`);
    this.toppingUp.set(false);
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
