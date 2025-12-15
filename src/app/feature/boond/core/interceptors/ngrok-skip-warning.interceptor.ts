import { type HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export const ngrokSkipWarningInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.appMode === 'local') {
    const clonedReq = req.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
