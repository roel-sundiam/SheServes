import { Routes } from '@angular/router';
import { CarouselComponent } from './carousel/carousel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegistrationsComponent } from './registrations/registrations.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '',              component: CarouselComponent },
  { path: 'login',        component: LoginComponent },
  { path: 'dashboard',    component: DashboardComponent },
  { path: 'registrations', component: RegistrationsComponent, canActivate: [authGuard] },
];
