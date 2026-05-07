import { Routes } from '@angular/router';
import { CarouselComponent } from './carousel/carousel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { RegistrationsComponent } from './registrations/registrations.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AnnouncementsAdminComponent } from './announcements-admin/announcements-admin.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { ScheduleAdminComponent } from './schedule-admin/schedule-admin.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { FinanceAdminComponent } from './finance-admin/finance-admin.component';
import { TournamentAdminComponent } from './tournament-admin/tournament-admin.component';
import { MembersComponent } from './members/members.component';
import { authGuard } from './services/auth.guard';
import { superAdminGuard } from './services/superadmin.guard';
import { coinsGuard } from './coins.guard';

export const routes: Routes = [
  { path: '',                    component: DashboardComponent,           canActivate: [coinsGuard] },
  { path: 'carousel',            component: CarouselComponent,            canActivate: [coinsGuard] },
  { path: 'login',               component: LoginComponent },
  { path: 'dashboard',           redirectTo: '',                          pathMatch: 'full' },
  { path: 'admin',               component: AdminHomeComponent,         canActivate: [authGuard] },
  { path: 'registrations',       component: RegistrationsComponent,     canActivate: [authGuard] },
  { path: 'analytics',           component: AnalyticsComponent,         canActivate: [authGuard, superAdminGuard] },
  { path: 'announcements-admin', component: AnnouncementsAdminComponent, canActivate: [authGuard] },
  { path: 'announcements',       component: AnnouncementsComponent,       canActivate: [coinsGuard] },
  { path: 'schedule-admin',      component: ScheduleAdminComponent,      canActivate: [authGuard] },
  { path: 'schedule',            component: ScheduleComponent,            canActivate: [coinsGuard] },
  { path: 'finance-admin',       component: FinanceAdminComponent,         canActivate: [authGuard] },
  { path: 'tournament-admin',    component: TournamentAdminComponent,      canActivate: [authGuard] },
  { path: 'members',             component: MembersComponent,              canActivate: [coinsGuard] },
];
