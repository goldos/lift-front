import { Component, inject, type Signal } from '@angular/core';
import { CgoFileStore } from '../../../stores/cgo-file.store';
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
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { CgoFileTableHeader } from '../cgo-file-table-header/cgo-file-table-header';
import { type CraInterface } from '../../../../../../shared/interfaces/cra.interface';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-cra-table',
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
    NgxSkeletonLoaderComponent,
    MatHeaderCellDef,
    MatNoDataRow,
    CgoFileTableHeader,
    MatProgressBar,
  ],
  templateUrl: './cra-table.html',
  styleUrl: './cra-table.scss',
})
export class CraTable {
  private store = inject(CgoFileStore);

  public readonly displayedColumns: string[] = [
    'nomPrenom',
    'mois',
    'annee',
    'nom',
    'prenom',
    'type',
    'date',
    'nonTemps',
    'duree',
    'societe',
  ];
  public readonly cra: Signal<CraInterface[]> = this.store.cra;
  public readonly loading: Signal<boolean> = this.store.isLoading;
  public readonly progress: Signal<number> = this.store.progress;
}
