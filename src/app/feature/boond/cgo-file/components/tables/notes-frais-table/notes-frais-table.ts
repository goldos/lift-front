import { Component, inject, type Signal, ViewEncapsulation } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { CgoFileStore } from '../../../stores/cgo-file.store';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { CgoFileTableHeader } from '../cgo-file-table-header/cgo-file-table-header';
import { type NoteDeFraisInterface } from '../../../../../../shared/interfaces/note-de-frais.interface';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-notes-frais-table',
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    MatNoDataRow,
    NgxSkeletonLoaderComponent,
    CgoFileTableHeader,
    MatProgressBar,
  ],
  templateUrl: './notes-frais-table.html',
  styleUrl: './notes-frais-table.scss',
  encapsulation: ViewEncapsulation.None,
})
export class NotesFraisTable {
  private store = inject(CgoFileStore);

  public readonly displayedColumns: string[] = ['consultant', 'montant'];
  public readonly notesDeFrais: Signal<NoteDeFraisInterface[]> = this.store.notesDeFrais;
  public readonly loading: Signal<boolean> = this.store.isLoading;
  public readonly progress: Signal<number> = this.store.progress;
}
