import { Routes } from '@angular/router';
import { CarouselComponent } from './carousel/carousel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { RegistrationsComponent } from './registrations/registrations.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { authGuard } from './services/auth.guard';
import { superAdminGuard } from './services/superadmin.guard';

export const routes: Routes = [
  { path: '',              component: CarouselComponent },
  { path: 'login',         component: LoginComponent },
  { path: 'dashboard',     component: DashboardComponent },
  { path: 'admin',         component: AdminHomeComponent,     canActivate: [authGuard] },
  { path: 'registrations', component: RegistrationsComponent, canActivate: [authGuard] },
  { path: 'analytics',     component: AnalyticsComponent,     canActivate: [authGuard, superAdminGuard] },
];
