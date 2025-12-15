import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { ngrokSkipWarningInterceptor } from './feature/boond/core/interceptors/ngrok-skip-warning.interceptor';
import { credentialsInterceptor } from './feature/boond/core/interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([ngrokSkipWarningInterceptor, credentialsInterceptor])),
    provideMomentDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
};
