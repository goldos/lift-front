import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { NotesFraisTable } from './notes-frais-table';
import { CgoFileStore } from '../../../stores/cgo-file.store';
import { type NoteDeFraisInterface } from '../../../../../../shared/interfaces/note-de-frais.interface';

interface CgoStoreMock {
  notesDeFrais: WritableSignal<NoteDeFraisInterface[]>;
  isLoading: WritableSignal<boolean>;
  progress: WritableSignal<number>;
}

describe('NotesFraisTable', () => {
  let component: NotesFraisTable;
  let fixture: ComponentFixture<NotesFraisTable>;
  let storeMock: CgoStoreMock;

  beforeEach(async () => {
    storeMock = {
      notesDeFrais: signal([]),
      isLoading: signal(false),
      progress: signal(0),
    };

    await TestBed.configureTestingModule({
      imports: [NotesFraisTable],
      providers: [{ provide: CgoFileStore, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesFraisTable);
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
      { consultant: 'John Doe', montant: 150.75 },
      { consultant: 'Jane Smith', montant: 88.2 },
    ];

    beforeEach(() => {
      storeMock.isLoading.set(false);
      storeMock.notesDeFrais.set(mockData);
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
      expect(firstRowCells[1].textContent.trim()).toBe('150.75');
    });
  });

  describe('when no data is available', () => {
    beforeEach(() => {
      storeMock.isLoading.set(false);
      storeMock.notesDeFrais.set([]);
      fixture.detectChanges();
    });

    it('should display the no-data message', () => {
      const noDataRow = fixture.nativeElement.querySelector('tr.mat-row');
      expect(noDataRow).toBeTruthy();
      expect(noDataRow.textContent).toContain('Aucune donnée disponible');
    });
  });
});
