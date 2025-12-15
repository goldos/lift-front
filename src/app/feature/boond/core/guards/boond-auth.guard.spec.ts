import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, type RouterStateSnapshot } from '@angular/router';
import { boondAuthGuard } from './boond-auth.guard';
import { AuthStore } from '../auth/auth.store';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { mocked } from 'jest-mock';

jest.mock('../../../../../environments/environment', () => ({
  environment: {
    appMode: 'prod',
  },
}));

const mockEnvironment = mocked(environment);

const mockAuthStore = {
  isAuthenticated: jest.fn(),
  localModeSession: jest.fn(),
  boondModeSession: jest.fn(),
  authenticationCompleted$: new Subject<boolean>(),
};
const typedMockAuthStore = mocked(mockAuthStore);

const mockRouter = {
  navigate: jest.fn().mockResolvedValue(true),
};
const typedMockRouter = mocked(mockRouter);

describe('boondAuthGuard', () => {
  const mockRoute = new ActivatedRouteSnapshot();
  const mockState: RouterStateSnapshot = { url: '/test', root: mockRoute };
  const originalLocation = window.location;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const executeGuard = () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: Router, useValue: mockRouter },
      ],
    });
    return TestBed.runInInjectionContext(() => boondAuthGuard(mockRoute, mockState));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnvironment.appMode = 'prod';
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: originalLocation,
    });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('in Local Mode', () => {
    beforeEach(() => {
      mockEnvironment.appMode = 'local';
    });

    it('should return true if already authenticated', async () => {
      typedMockAuthStore.isAuthenticated.mockReturnValue(true);
      const canActivate = await executeGuard();
      expect(canActivate).toBe(true);
      expect(typedMockAuthStore.localModeSession).not.toHaveBeenCalled();
    });

    it('should call localModeSession and return true on successful auth', async () => {
      typedMockAuthStore.isAuthenticated.mockReturnValueOnce(false).mockReturnValueOnce(true);
      const guardPromise = executeGuard();
      typedMockAuthStore.authenticationCompleted$.next(true);
      const canActivate = await guardPromise;

      expect(typedMockAuthStore.localModeSession).toHaveBeenCalledTimes(1);
      expect(canActivate).toBe(true);
    });

    it('should navigate to access-denied on failed auth', async () => {
      typedMockAuthStore.isAuthenticated.mockReturnValue(false);
      const guardPromise = executeGuard();
      typedMockAuthStore.authenticationCompleted$.next(false);
      const canActivate = await guardPromise;

      expect(typedMockRouter.navigate).toHaveBeenCalledWith(['/access-denied']);
      expect(canActivate).toBe(false);
    });

    it('should navigate to access-denied if localModeSession throws', async () => {
      const error = new Error('Local login failed');
      typedMockAuthStore.isAuthenticated.mockReturnValue(false);
      typedMockAuthStore.localModeSession.mockImplementation(() => {
        throw error;
      });
      const canActivate = await executeGuard();

      expect(typedMockRouter.navigate).toHaveBeenCalledWith(['/access-denied']);
      expect(canActivate).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Development login failed:', error);
    });
  });

  describe('in Boond Mode (Prod)', () => {
    const mockWindowSearch = (search: string) => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        enumerable: true,
        value: {
          ...originalLocation,
          search: search,
        },
      });
    };

    it('should call boondModeSession and return true with a valid signedRequest', async () => {
      mockWindowSearch('?signedRequest=test-token');
      typedMockAuthStore.isAuthenticated.mockReturnValue(true);
      const guardPromise = executeGuard();
      typedMockAuthStore.authenticationCompleted$.next(true);
      const canActivate = await guardPromise;

      expect(typedMockAuthStore.boondModeSession).toHaveBeenCalledWith('test-token');
      expect(canActivate).toBe(true);
    });

    it('should navigate to access-denied with a signedRequest but failed auth', async () => {
      mockWindowSearch('?signedRequest=test-token');
      typedMockAuthStore.isAuthenticated.mockReturnValue(false);
      const guardPromise = executeGuard();
      typedMockAuthStore.authenticationCompleted$.next(false);
      const canActivate = await guardPromise;

      expect(typedMockRouter.navigate).toHaveBeenCalledWith(['/access-denied']);
      expect(canActivate).toBe(false);
    });

    it('should return true if no signedRequest but already authenticated', async () => {
      mockWindowSearch('');
      typedMockAuthStore.isAuthenticated.mockReturnValue(true);
      const canActivate = await executeGuard();

      expect(typedMockAuthStore.boondModeSession).not.toHaveBeenCalled();
      expect(canActivate).toBe(true);
    });

    it('should navigate to access-denied if no signedRequest and not authenticated', async () => {
      mockWindowSearch('');
      typedMockAuthStore.isAuthenticated.mockReturnValue(false);
      const canActivate = await executeGuard();

      expect(typedMockRouter.navigate).toHaveBeenCalledWith(['/access-denied']);
      expect(canActivate).toBe(false);
    });
  });
});
