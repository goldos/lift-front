import { type ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subject } from 'rxjs';
import { Layout } from './layout';
import { LayoutStore } from './stores/layout.store';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../feature/boond/core/auth/auth.service';
import { signal } from '@angular/core';
import { AuthStore } from '../../feature/boond/core/auth/auth.store';

const routerEventsSubject = new Subject<
  NavigationStart | NavigationEnd | NavigationCancel | NavigationError
>();

const authServiceMock = {
  boondModeSession: jest.fn(),
};

const layoutStoreMock = {
  setRouterLoading: jest.fn(),
  isRouterLoading: signal(false),
  isLoading: jest.fn(),
};

const routerMock = {
  events: routerEventsSubject.asObservable(),
  createUrlTree: jest.fn(),
  navigate: jest.fn(),
  serializeUrl: jest.fn(),
};

const authStoreMock = {
  isLoading: signal(false),
  isAuthenticated: signal(false),
  isLoadingAuthenticated: jest.fn(),
};

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    layoutStoreMock.setRouterLoading.mockClear();
    layoutStoreMock.isLoading.mockReturnValue(signal(false));
    authStoreMock.isLoadingAuthenticated.mockClear();
    authStoreMock.isLoadingAuthenticated.mockReturnValue(signal(false));

    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: LayoutStore, useValue: layoutStoreMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthStore, useValue: authStoreMock },
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setRouterLoading(true) on NavigationStart', () => {
    routerEventsSubject.next(new NavigationStart(1, '/some-url'));

    expect(layoutStoreMock.setRouterLoading).toHaveBeenCalledWith(true);
  });

  it('should call setRouterLoading(false) on NavigationEnd', () => {
    routerEventsSubject.next(new NavigationStart(1, '/some-url'));
    expect(layoutStoreMock.setRouterLoading).toHaveBeenCalledWith(true);

    routerEventsSubject.next(new NavigationEnd(1, '/some-url', '/some-url'));

    expect(layoutStoreMock.setRouterLoading).toHaveBeenCalledWith(false);
  });

  it('should call setRouterLoading(false) on NavigationCancel', () => {
    routerEventsSubject.next(new NavigationStart(1, '/some-url'));

    routerEventsSubject.next(new NavigationCancel(1, '/some-url', ''));

    expect(layoutStoreMock.setRouterLoading).toHaveBeenCalledWith(false);
  });

  it('should call setRouterLoading(false) on NavigationError', () => {
    routerEventsSubject.next(new NavigationStart(1, '/some-url'));

    routerEventsSubject.next(new NavigationError(1, '/some-url', new Error('test error')));

    expect(layoutStoreMock.setRouterLoading).toHaveBeenCalledWith(false);
  });
});
