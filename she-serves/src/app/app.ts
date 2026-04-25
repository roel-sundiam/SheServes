import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { AnalyticsService } from './services/analytics.service';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router    = inject(Router);
  private analytics = inject(AnalyticsService);
  private swUpdate       = inject(SwUpdate);
  private pushNotifications = inject(PushNotificationService);

  updateAvailable = signal(false);

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.analytics.trackVisit(e.urlAfterRedirects.split('?')[0]);
    });

    this.pushNotifications.init();

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY')
      ).subscribe(() => this.updateAvailable.set(true));
    }
  }

  applyUpdate() {
    this.swUpdate.activateUpdate().then(() => window.location.reload());
  }
}
