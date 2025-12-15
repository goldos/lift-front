import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidenav } from './sidenav';
import { AuthStore } from '../../feature/boond/core/auth/auth.store';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { provideRouter } from '@angular/router';

describe('SidenavComponent', () => {
  let component: Sidenav;
  let fixture: ComponentFixture<Sidenav>;

  const mockAuthStore = {
    isLoadingAuthenticated: jest.fn().mockReturnValue(() => false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidenav, MatTooltip, MatIcon],
      providers: [{ provide: AuthStore, useValue: mockAuthStore }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidenav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isExpanded signal to false', () => {
    expect(component.isExpanded()).toBe(false);
  });

  it('should toggle isExpanded signal when toggleSidenav is called', () => {
    component.toggleSidenav();
    expect(component.isExpanded()).toBe(true);
    component.toggleSidenav();
    expect(component.isExpanded()).toBe(false);
  });

  it('should update tooltipExtendText when toggleSidenav is called', () => {
    component.toggleSidenav();
    expect(component.tooltipExtendText()).toBe('Réduire le menu');
    component.toggleSidenav();
    expect(component.tooltipExtendText()).toBe('Agrandir le menu');
  });

  it('should have tooltipExtendText as "Agrandir le menu" initially', () => {
    expect(component.tooltipExtendText()).toBe('Agrandir le menu');
  });

  it('should update tooltipExtendText when isExpanded changes', () => {
    component.toggleSidenav();
    fixture.detectChanges();
    expect(component.tooltipExtendText()).toBe('Réduire le menu');

    component.toggleSidenav();
    fixture.detectChanges();
    expect(component.tooltipExtendText()).toBe('Agrandir le menu');
  });
});
