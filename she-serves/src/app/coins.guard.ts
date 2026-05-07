import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CoinsService } from './services/coins.service';

export const coinsGuard: CanActivateFn = async (_route, state) => {
  const auth  = inject(AuthService);
  const coins = inject(CoinsService);

  if (auth.isLoggedIn()) return true;

  const page = state.url.split('?')[0].replace(/^\//, '') || 'home';
  await coins.visitPage(page);
  return true;
};
