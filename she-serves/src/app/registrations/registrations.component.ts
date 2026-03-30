import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './registrations.component.html',
  styleUrl: './registrations.component.css'
})
export class RegistrationsComponent {
  registrations: Registration[] = [
    { id: 1, name: 'Maria Santos',   email: 'maria@email.com',   phone: '09171234567', category: 'Singles', date: '2025-03-20', status: 'Confirmed' },
    { id: 2, name: 'Ana Reyes',      email: 'ana@email.com',     phone: '09181234567', category: 'Doubles', date: '2025-03-21', status: 'Confirmed' },
    { id: 3, name: 'Cathy Lim',      email: 'cathy@email.com',   phone: '09191234567', category: 'Singles', date: '2025-03-22', status: 'Pending'   },
    { id: 4, name: 'Rose dela Cruz', email: 'rose@email.com',    phone: '09201234567', category: 'Doubles', date: '2025-03-23', status: 'Confirmed' },
    { id: 5, name: 'Joy Mendoza',    email: 'joy@email.com',     phone: '09211234567', category: 'Singles', date: '2025-03-24', status: 'Pending'   },
  ];

  get confirmed() { return this.registrations.filter(r => r.status === 'Confirmed').length; }
  get pending()   { return this.registrations.filter(r => r.status === 'Pending').length; }

  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
