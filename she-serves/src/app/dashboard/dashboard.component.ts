import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  cards = [
    { icon: '🏆', label: 'Tournament',    route: '#' },
    { icon: '📅', label: 'Schedule',      route: '#' },
    { icon: '👤', label: 'My Profile',    route: '#' },
    { icon: '📋', label: 'Registration',  route: '/registrations' },
    { icon: '🎾', label: 'My Matches',    route: '#' },
    { icon: '📊', label: 'Standings',     route: '#' },
    { icon: '📣', label: 'Announcements', route: '#' },
    { icon: '📞', label: 'Contact',       route: '#' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
