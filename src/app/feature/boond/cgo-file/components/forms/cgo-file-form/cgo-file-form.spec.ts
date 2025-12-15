import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CgoFileForm } from './cgo-file-form';
import { CgoFileStore, type LastRequest } from '../../../stores/cgo-file.store';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import moment, { type Moment } from 'moment';
import { AgenciesEnum, AgenciesLabels } from '../../../../../../shared/enums/agencies.enum';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { type MatDatepicker } from '@angular/material/datepicker';

const mockCgoFileStore = {
  isLoading: signal(false),
  progress: signal(0),
  lastRequest: signal<LastRequest | null>(null),
  generateAndPoll: jest.fn(),
};

describe('CgoFileForm', () => {
  let component: CgoFileForm;
  let fixture: ComponentFixture<CgoFileForm>;

  const configureTestBed = () => {
    TestBed.configureTestingModule({
      imports: [CgoFileForm, ReactiveFormsModule],
      providers: [
        { provide: CgoFileStore, useValue: mockCgoFileStore },
        provideMomentDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CgoFileForm);
    component = fixture.componentInstance;
  };

  describe('with initial empty store', () => {
    beforeEach(() => {
      mockCgoFileStore.isLoading.set(false);
      mockCgoFileStore.progress.set(0);
      mockCgoFileStore.lastRequest.set(null);
      mockCgoFileStore.generateAndPoll.mockClear();

      configureTestBed();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form with default values', () => {
      const dateDiff = moment().diff(component.form.value.date, 'seconds');
      expect(dateDiff).toBeLessThan(5);
      expect(component.form.value.agency).toBeNull();
    });

    it('should have an invalid form initially', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should be valid when all fields are filled', () => {
      component.form.patchValue({
        date: moment(),
        agency: AgenciesEnum.BORDEAUX,
      });
      expect(component.form.valid).toBe(true);
    });

    it('should not call generateAndPoll on submit if form is invalid', () => {
      component.onSubmit();
      expect(mockCgoFileStore.generateAndPoll).not.toHaveBeenCalled();
    });

    it('should call generateAndPoll on submit with correct data if form is valid', () => {
      const testDate = moment('2024-01-15');
      const testAgency = AgenciesEnum.BORDEAUX;

      component.form.patchValue({
        date: testDate,
        agency: testAgency,
      });
      fixture.detectChanges();

      component.onSubmit();

      expect(mockCgoFileStore.generateAndPoll).toHaveBeenCalledTimes(1);
      expect(mockCgoFileStore.generateAndPoll).toHaveBeenCalledWith({
        period: '01/2024',
        agency: testAgency,
      });
    });
  });

  describe('with pre-filled store from lastRequest', () => {
    beforeEach(() => {
      mockCgoFileStore.lastRequest.set({
        period: '12/2023',
        agency: AgenciesEnum.BORDEAUX,
      });
      configureTestBed();
      fixture.detectChanges();
    });

    it('should initialize the form with values from the store', () => {
      expect(component.form.value.date.format('MM/YYYY')).toBe('12/2023');
      expect(component.form.value.agency).toBe(AgenciesEnum.BORDEAUX);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('computed signals and UI state', () => {
    beforeEach(() => {
      configureTestBed();
    });

    it('should update the message when store signals change', () => {
      mockCgoFileStore.lastRequest.set(null);
      mockCgoFileStore.progress.set(0);
      fixture.detectChanges();
      expect(component.message()).toContain('Periode: undefined');
      mockCgoFileStore.lastRequest.set({
        period: '03/2024',
        agency: AgenciesEnum.BORDEAUX,
      });
      mockCgoFileStore.progress.set(50);
      fixture.detectChanges();

      expect(component.message()).toContain('03/2024');
      expect(component.message()).toContain(AgenciesLabels[AgenciesEnum.BORDEAUX]);
      expect(component.message()).toContain('50%');
    });

    it('should disable the submit button when loading', () => {
      mockCgoFileStore.isLoading.set(true);
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(true);
    });

    it('should enable the submit button when not loading', () => {
      mockCgoFileStore.isLoading.set(false);
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(false);
    });
  });

  describe('#setMonthAndYear', () => {
    it('should update the form date value and close the datepicker', () => {
      const mockDatepicker = {
        close: jest.fn(),
      };

      const initialDate = moment('2024-01-15');
      component.form.get('date')?.setValue(initialDate);

      const newDate = moment('2025-08-01');

      component.setMonthAndYear(newDate, mockDatepicker as unknown as MatDatepicker<Moment>);

      const updatedDate = moment(component.form.get('date')?.value);
      expect(updatedDate.year()).toBe(2025);
      expect(updatedDate.month()).toBe(7);

      expect(mockDatepicker.close).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if the form date is null', () => {
      const mockDatepicker = {
        close: jest.fn(),
      };
      component.form.get('date')?.setValue(null);
      const newDate = moment('2025-08-01');

      component.setMonthAndYear(newDate, mockDatepicker as unknown as MatDatepicker<Moment>);

      expect(component.form.get('date')?.value).toBeNull();
      expect(mockDatepicker.close).not.toHaveBeenCalled();
    });
  });
});
