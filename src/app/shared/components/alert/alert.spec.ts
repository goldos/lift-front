import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Alert } from './alert';
import { By } from '@angular/platform-browser';
import { MatCard, MatCardContent } from '@angular/material/card';

describe('Alert', () => {
  let component: Alert;
  let fixture: ComponentFixture<Alert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert, MatCard, MatCardContent],
    }).compileComponents();

    fixture = TestBed.createComponent(Alert);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('message', 'Test Message');
    fixture.componentRef.setInput('alertType', 'success');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the message passed via input', () => {
    const testMessage = 'This is a test alert message.';
    fixture.componentRef.setInput('message', testMessage);
    fixture.componentRef.setInput('alertType', 'warning');
    fixture.detectChanges();

    const cardContentElement = fixture.debugElement.query(By.directive(MatCardContent));
    expect(cardContentElement).toBeTruthy();
    expect(cardContentElement.nativeElement.textContent).toContain(testMessage);
  });

  it('should apply the "error" class when alertType is "error"', () => {
    fixture.componentRef.setInput('message', 'Error occurred!');
    fixture.componentRef.setInput('alertType', 'error');
    fixture.detectChanges();

    const cardElement = fixture.debugElement.query(By.directive(MatCard));
    expect(cardElement).toBeTruthy();
    expect(cardElement.nativeElement.classList).toContain('error');
  });

  it('should apply the "success" class when alertType is "success"', () => {
    fixture.componentRef.setInput('message', 'Operation successful!');
    fixture.componentRef.setInput('alertType', 'success');
    fixture.detectChanges();

    const cardElement = fixture.debugElement.query(By.directive(MatCard));
    expect(cardElement).toBeTruthy();
    expect(cardElement.nativeElement.classList).toContain('success');
  });

  it('should apply the "warning" class when alertType is "warning"', () => {
    fixture.componentRef.setInput('message', 'Warning: Something is not right.');
    fixture.componentRef.setInput('alertType', 'warning');
    fixture.detectChanges();

    const cardElement = fixture.debugElement.query(By.directive(MatCard));
    expect(cardElement).toBeTruthy();
    expect(cardElement.nativeElement.classList).toContain('warning');
  });

  it('should throw an error if message input is not provided', () => {
    fixture.componentRef.setInput('alertType', 'success');
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('should throw an error if alertType input is not provided', () => {
    fixture.componentRef.setInput('message', 'Some message');
    expect(() => fixture.detectChanges()).toThrow();
  });
});
