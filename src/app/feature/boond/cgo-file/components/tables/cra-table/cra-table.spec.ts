import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { CraTable } from './cra-table';
import { CgoFileStore } from '../../../stores/cgo-file.store';
import { type CraInterface } from '../../../../../../shared/interfaces/cra.interface';

interface CgoStoreMock {
  cra: WritableSignal<CraInterface[]>;
  isLoading: WritableSignal<boolean>;
  progress: WritableSignal<number>;
}

describe('CraTable', () => {
  let component: CraTable;
  let fixture: ComponentFixture<CraTable>;
  let storeMock: CgoStoreMock;

  beforeEach(async () => {
    storeMock = {
      cra: signal([]),
      isLoading: signal(false),
      progress: signal(0),
    };

    await TestBed.configureTestingModule({
      imports: [CraTable],
      providers: [{ provide: CgoFileStore, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CraTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when loading', () => {
    beforeEach(() => {
      storeMock.isLoading.set(true);
      fixture.detectChanges();
    });

    it('should display progress bar loaders', () => {
      const matProgressBar = fixture.nativeElement.querySelectorAll('mat-progress-bar');
      expect(matProgressBar.length).toBe(1);
    });
  });

  describe('when data is loaded', () => {
    const mockData: Partial<CraInterface>[] = [
      { nomPrenom: 'John Doe', mois: '7', annee: 2024, date: '01/07/2024' },
      { nomPrenom: 'Jane Smith', mois: '7', annee: 2024, date: '02/07/2024' },
    ];

    beforeEach(() => {
      storeMock.isLoading.set(false);
      storeMock.cra.set(mockData as CraInterface[]);
      fixture.detectChanges();
    });

    it('should not display progress bar loaders', () => {
      const matProgressBar = fixture.nativeElement.querySelectorAll('mat-progress-bar');
      expect(matProgressBar.length).toBe(0);
    });

    it('should display the data in the table', () => {
      const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
      expect(rows.length).toBe(mockData.length);

      const firstRowCells = rows[0].querySelectorAll('td');
      expect(firstRowCells[0].textContent.trim()).toBe('John Doe');
      expect(firstRowCells[1].textContent.trim()).toBe('7');
      expect(firstRowCells[6].textContent.trim()).toBe('01/07/2024');
    });
  });

  describe('when no data is available', () => {
    beforeEach(() => {
      storeMock.isLoading.set(false);
      storeMock.cra.set([]);
      fixture.detectChanges();
    });

    it('should display the no-data message', () => {
      const noDataRow = fixture.nativeElement.querySelector('tr.mat-row');
      expect(noDataRow).toBeTruthy();
      expect(noDataRow.textContent).toContain('Aucune donnée disponible');
    });
  });
});
