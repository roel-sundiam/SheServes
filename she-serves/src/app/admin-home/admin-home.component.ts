import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isSuperAdmin = this.auth.isSuperAdmin;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
