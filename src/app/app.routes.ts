import { type Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { CgoFileStore } from './feature/boond/cgo-file/stores/cgo-file.store';
import { boondAuthGuard } from './feature/boond/core/guards/boond-auth.guard';
import { provideNgxSkeletonLoader } from 'ngx-skeleton-loader';
import { cgoJobCheckGuard } from './feature/boond/core/guards/cgo-job-check.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./feature/home/home').then((c) => c.Home),
      },
      {
        path: 'boond',
        canActivate: [boondAuthGuard],
        loadComponent: () => import('./feature/boond/boond').then((c) => c.Boond),
        children: [
          {
            path: '',
            redirectTo: 'fichier-cgo',
            pathMatch: 'full',
          },
          {
            path: 'fichier-cgo',
            canActivate: [cgoJobCheckGuard],
            loadComponent: () =>
              import('./feature/boond/cgo-file/components/cgo-file').then((c) => c.CgoFile),
            providers: [
              CgoFileStore,
              provideNgxSkeletonLoader({
                theme: {
                  extendsFromRoot: true,
                  backgroundColor: '#085d57',
                  margin: 'unset',
                  display: 'flex',
                },
              }),
            ],
          },
        ],
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./shared/components/access-denied/access-denied').then((c) => c.AccessDenied),
      },
    ],
  },
];
