import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal('');
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.username || !this.password) {
      this.error.set('Please enter username and password.');
      return;
    }
    const { ok, message } = await this.auth.login(this.username, this.password);
    if (ok) {
      this.router.navigate(['/admin']);
    } else {
      this.error.set(message);
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
