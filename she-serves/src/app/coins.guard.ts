import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CoinsService } from './services/coins.service';

export const coinsGuard: CanActivateFn = async () => {
  const auth  = inject(AuthService);
  const coins = inject(CoinsService);

  if (auth.isLoggedIn()) return true;

  await coins.visitPage();
  return true;
};
