import { computed, inject } from '@angular/core';
import { catchError, filter, finalize, map, of, pipe, switchMap, take, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, authService: AuthService = inject(AuthService)) => ({
    localModeSession: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.localModeSession().pipe(
            map(() => {
              patchState(store, { isAuthenticated: true, isLoading: false });
            }),
            catchError(() => {
              return of(false);
            }),
            finalize(() => patchState(store, { isLoading: false })),
          ),
        ),
      ),
    ),
    boondModeSession: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((signedRequest) =>
          authService.boondModeSession(signedRequest).pipe(
            map(() => {
              patchState(store, { isAuthenticated: true, isLoading: false });
            }),
            catchError(() => {
              return of(false);
            }),
            finalize(() => patchState(store, { isLoading: false })),
          ),
        ),
      ),
    ),
    clearAuth: () => {
      patchState(store, initialState);
    },
  })),
  withProps(({ isAuthenticated }) => ({
    authenticationCompleted$: toObservable(isAuthenticated).pipe(
      filter((value) => value === true),
      take(1),
    ),
  })),
  withComputed((store) => ({
    isLoadingAuthenticated: computed(() => store.isLoading()),
  })),
);
