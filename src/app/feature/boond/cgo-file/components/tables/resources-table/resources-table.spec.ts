import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { ResourcesTable } from './resources-table';
import { CgoFileStore } from '../../../stores/cgo-file.store';
import { type ResourcesInterface } from '../../../../../../shared/interfaces/resources.interface';

interface CgoStoreMock {
  ressources: WritableSignal<ResourcesInterface[]>;
  isLoading: WritableSignal<boolean>;
  progress: WritableSignal<number>;
}

describe('ResourcesTable', () => {
  let component: ResourcesTable;
  let fixture: ComponentFixture<ResourcesTable>;
  let storeMock: CgoStoreMock;

  beforeEach(async () => {
    storeMock = {
      ressources: signal([]),
      isLoading: signal(false),
      progress: signal(0),
    };

    await TestBed.configureTestingModule({
      imports: [ResourcesTable],
      providers: [{ provide: CgoFileStore, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcesTable);
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
    const mockData = [
      { consultant: 'John Doe', startDate: '10/01/2024' },
      { consultant: 'Jane Smith', startDate: '2024-02-15' },
    ] as ResourcesInterface[];

    beforeEach(() => {
      storeMock.isLoading.set(false);
      storeMock.ressources.set(mockData);
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
      expect(firstRowCells[1].textContent.trim()).toBe('10/01/2024');
    });
  });

  describe('when no data is available', () => {
    beforeEach(() => {
      storeMock.isLoading.set(false);
      storeMock.ressources.set([]);
      fixture.detectChanges();
    });

    it('should display the no-data message', () => {
      const noDataRow = fixture.nativeElement.querySelector('tr.mat-row');
      expect(noDataRow).toBeTruthy();
      expect(noDataRow.textContent).toContain('Aucune donnée disponible');
    });
  });
});
