import { Component, computed, inject, input, Input, type Signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CgoFileStore } from '../../../stores/cgo-file.store';
import { type NoteDeFraisInterface } from '../../../../../../shared/interfaces/note-de-frais.interface';
import { type CraInterface } from '../../../../../../shared/interfaces/cra.interface';
import { type ResourcesInterface } from '../../../../../../shared/interfaces/resources.interface';

@Component({
  selector: 'app-cgo-file-table-header',
  imports: [MatButton, MatIcon, MatTooltip, CdkCopyToClipboard],
  templateUrl: './cgo-file-table-header.html',
  styleUrl: './cgo-file-table-header.scss',
})
export class CgoFileTableHeader {
  dataSource = input.required<NoteDeFraisInterface[] | CraInterface[] | ResourcesInterface[]>();
  @Input() displayedColumns!: string[];

  private readonly _snackBar = inject(MatSnackBar);
  private store = inject(CgoFileStore);

  public readonly loading: Signal<boolean> = this.store.isLoading;
  public readonly tableDataAsTsv = computed(() => {
    const data = this.dataSource();
    const columns = this.displayedColumns;

    if (!data || data.length === 0) {
      return '';
    }

    const headerRow = columns.join('\t');

    const dataRows = data.map((row) => {
      return columns
        .map((col) => {
          const value = (row as unknown as Record<string, unknown>)[col];
          return String(value ?? '').replace(/\n/g, ' ');
        })
        .join('\t');
    });

    return [headerRow, ...dataRows].join('\n');
  });

  openSnackBar() {
    this._snackBar.open('Les données ont étés copiées dans le presse-papier', 'X', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
