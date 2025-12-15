import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export const boondAuthGuard: CanActivateFn = async (): Promise<boolean> => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  if (environment.appMode === 'local') {
    console.warn('--- LOCAL MODE: Using local-login endpoint ---');

    if (authStore.isAuthenticated()) {
      return true;
    }

    try {
      authStore.localModeSession();
      await firstValueFrom(authStore.authenticationCompleted$);

      if (authStore.isAuthenticated()) {
        return true;
      } else {
        await router.navigate(['/access-denied']);
        return false;
      }
    } catch (error) {
      console.error('Development login failed:', error);
      await router.navigate(['/access-denied']);
      return false;
    }
  }

  const params = new URLSearchParams(window.location.search);
  const signedRequest = params.get('signedRequest');

  if (signedRequest) {
    authStore.boondModeSession(signedRequest);

    await firstValueFrom(authStore.authenticationCompleted$);

    if (authStore.isAuthenticated()) {
      return true;
    } else {
      router.navigate(['/access-denied']);
      return false;
    }
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
