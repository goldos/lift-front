import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CgoFileTableHeader } from './cgo-file-table-header';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CgoFileStore } from '../../../stores/cgo-file.store';
import { signal } from '@angular/core';

interface TestData {
  id: number;
  name: string;
  value: number | null;
  description: string;
}

class MockMatSnackBar {
  open = jest.fn();
}

class MockCgoStore {
  isLoading = signal(false);
}

describe('CgoFileTableHeader', () => {
  let component: CgoFileTableHeader;
  let fixture: ComponentFixture<CgoFileTableHeader>;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CgoFileTableHeader],
      providers: [
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: CgoFileStore, useClass: MockCgoStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CgoFileTableHeader);
    component = fixture.componentInstance;
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should create', () => {
    fixture.componentRef.setInput('dataSource', []);
    fixture.componentRef.setInput('displayedColumns', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('tableDataAsTsv computed signal', () => {
    it('should return an empty string for empty data', () => {
      fixture.componentRef.setInput('dataSource', []);
      fixture.componentRef.setInput('displayedColumns', ['id', 'name']);
      fixture.detectChanges();

      expect(component.tableDataAsTsv()).toBe('');
    });

    it('should generate a correct TSV string with headers and data', () => {
      const testData: TestData[] = [
        { id: 1, name: 'Item 1', value: 100, description: 'Desc 1' },
        { id: 2, name: 'Item 2', value: 200, description: 'Desc 2' },
      ];
      const columns = ['id', 'name', 'value'];

      fixture.componentRef.setInput('dataSource', testData);
      fixture.componentRef.setInput('displayedColumns', columns);
      fixture.detectChanges();

      const tsv = component.tableDataAsTsv();

      const expectedTsv = 'id\tname\tvalue\n' + '1\tItem 1\t100\n' + '2\tItem 2\t200';

      expect(tsv).toBe(expectedTsv);
    });

    it('should respect the order of displayedColumns', () => {
      const testData: TestData[] = [{ id: 1, name: 'Item 1', value: 100, description: 'Desc 1' }];
      const columns = ['name', 'value', 'id'];

      fixture.componentRef.setInput('dataSource', testData);
      fixture.componentRef.setInput('displayedColumns', columns);
      fixture.detectChanges();

      const tsv = component.tableDataAsTsv();

      const expectedTsv = 'name\tvalue\tid\n' + 'Item 1\t100\t1';

      expect(tsv).toBe(expectedTsv);
    });

    it('should handle null or undefined values correctly', () => {
      const testData: TestData[] = [{ id: 1, name: 'Item 1', value: null, description: 'Desc 1' }];
      const columns = ['id', 'name', 'value'];

      fixture.componentRef.setInput('dataSource', testData);
      fixture.componentRef.setInput('displayedColumns', columns);
      fixture.detectChanges();

      const tsv = component.tableDataAsTsv();

      const expectedTsv = 'id\tname\tvalue\n' + '1\tItem 1\t';

      expect(tsv).toBe(expectedTsv);
    });

    it('should handle values with line breaks', () => {
      const testData: TestData[] = [
        { id: 1, name: 'Item\nwith\nbreak', value: 100, description: 'Desc 1' },
      ];
      const columns = ['id', 'name'];

      fixture.componentRef.setInput('dataSource', testData);
      fixture.componentRef.setInput('displayedColumns', columns);
      fixture.detectChanges();

      const tsv = component.tableDataAsTsv();

      const expectedTsv = 'id\tname\n' + '1\tItem with break';

      expect(tsv).toBe(expectedTsv);
    });
  });

  describe('#openSnackBar', () => {
    it('should call MatSnackBar.open with correct parameters', () => {
      component.openSnackBar();

      expect(snackBar.open).toHaveBeenCalledWith(
        'Les données ont étés copiées dans le presse-papier',
        'X',
        {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        },
      );
      expect(snackBar.open).toHaveBeenCalledTimes(1);
    });
  });
});
