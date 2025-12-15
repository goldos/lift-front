import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the logo image', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const imgElement = compiled.querySelector('img');

    expect(imgElement).toBeTruthy();

    expect(imgElement?.getAttribute('alt')).toBe('Logo 5d');
  });

  it('should have a link to the homepage', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const linkElement = compiled.querySelector('a');

    expect(linkElement?.getAttribute('href')).toBe('/');
  });
});
