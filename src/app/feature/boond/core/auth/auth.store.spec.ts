import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { AuthService } from './auth.service';
import { firstValueFrom, Subject } from 'rxjs';
import { waitUntil } from '../../../../testing/helpers/async-helpers';

const authServiceMock = {
  boondModeSession: jest.fn(),
  localModeSession: jest.fn(),
};

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let boondModeSessionResponse$: Subject<{ jwtClient: string }>;
  let localModeSessionResponse$: Subject<{ jwtClient: string }>;

  beforeEach(() => {
    boondModeSessionResponse$ = new Subject<{ jwtClient: string }>();
    localModeSessionResponse$ = new Subject<{ jwtClient: string }>();
    authServiceMock.boondModeSession.mockReturnValue(boondModeSessionResponse$.asObservable());
    authServiceMock.localModeSession.mockReturnValue(localModeSessionResponse$.asObservable());

    TestBed.configureTestingModule({
      providers: [AuthStore, { provide: AuthService, useValue: authServiceMock }],
    });

    store = TestBed.inject(AuthStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.isAuthenticated()).toBe(false);
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('withMethods', () => {
    describe('clearAuth', () => {
      it('should reset the state to initial', async () => {
        store.boondModeSession('');
        await waitUntil(() => store.isLoading() === true);
        boondModeSessionResponse$.next({ jwtClient: 'test-token' });
        await waitUntil(() => store.isLoading() === false);

        expect(store.isAuthenticated()).toBe(true);

        store.clearAuth();

        expect(store.isAuthenticated()).toBe(false);
        expect(store.isLoading()).toBe(false);
      });
    });

    describe('boondModeSession (rxMethod)', () => {
      it('should set loading to true, then update state on success', async () => {
        const mockResponse = { jwtClient: 'new-jwt-token' };
        const signedRequest = 'test.signed.request';

        store.boondModeSession(signedRequest);

        await waitUntil(() => store.isLoading() === true);
        expect(store.isLoading()).toBe(true);

        boondModeSessionResponse$.next(mockResponse);
        boondModeSessionResponse$.complete();

        await waitUntil(() => store.isLoading() === false);

        expect(store.isAuthenticated()).toBe(true);
      });

      it('should handle errors gracefully', async () => {
        const signedRequest = 'test.signed.request';
        const mockError = new Error('API Error');

        store.boondModeSession(signedRequest);

        await waitUntil(() => store.isLoading() === true);
        expect(store.isLoading()).toBe(true);

        boondModeSessionResponse$.error(mockError);

        await waitUntil(() => store.isLoading() === false);

        expect(store.isAuthenticated()).toBe(false);
      });
    });

    describe('localModeSession (rxMethod)', () => {
      it('should set loading to true, then update state on success', async () => {
        const mockResponse = { jwtClient: 'dev-jwt-token' };

        store.localModeSession();

        await waitUntil(() => store.isLoading() === true);
        expect(store.isLoading()).toBe(true);

        localModeSessionResponse$.next(mockResponse);
        localModeSessionResponse$.complete();

        await waitUntil(() => store.isLoading() === false);

        expect(store.isAuthenticated()).toBe(true);
      });

      it('should handle errors gracefully', async () => {
        const mockError = new Error('API Error');

        store.localModeSession();

        await waitUntil(() => store.isLoading() === true);
        expect(store.isLoading()).toBe(true);

        localModeSessionResponse$.error(mockError);

        await waitUntil(() => store.isLoading() === false);

        expect(store.isAuthenticated()).toBe(false);
      });
    });
  });

  describe('withComputed', () => {
    it('isLoadingAuthenticated should reflect the value of isLoading', async () => {
      expect(store.isLoadingAuthenticated()).toBe(false);
      const mockResponse = { jwtClient: 'dev-jwt-token' };

      store.localModeSession();

      await waitUntil(() => store.isLoading() === true);
      expect(store.isLoadingAuthenticated()).toBe(true);

      localModeSessionResponse$.next(mockResponse);
      localModeSessionResponse$.complete();

      await waitUntil(() => store.isLoading() === false);

      expect(store.isLoadingAuthenticated()).toBe(false);
    });
  });

  describe('withProps: authenticationCompleted$', () => {
    it('should emit true and complete when isAuthenticated becomes true', async () => {
      const mockResponse = { jwtClient: 'test-token' };

      const completionPromise = firstValueFrom(store.authenticationCompleted$);

      store.localModeSession();

      await waitUntil(() => store.isLoading() === true);

      localModeSessionResponse$.next(mockResponse);

      await expect(completionPromise).resolves.toBe(true);

      expect(store.isAuthenticated()).toBe(true);
    });

    it('should not emit if isAuthenticated does not become true', async () => {
      const mockError = new Error('API Error');
      const nextSpy = jest.fn();

      store.authenticationCompleted$.subscribe(nextSpy);

      store.localModeSession();
      await waitUntil(() => store.isLoading() === true);
      localModeSessionResponse$.error(mockError);
      await waitUntil(() => store.isLoading() === false);

      expect(nextSpy).not.toHaveBeenCalled();
    });
  });
});
