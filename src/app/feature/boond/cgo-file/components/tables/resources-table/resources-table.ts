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
import { type ResourcesInterface } from '../../../../../../shared/interfaces/resources.interface';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-ressources-table',
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
  templateUrl: './resources-table.html',
  styleUrl: './resources-table.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ResourcesTable {
  private store = inject(CgoFileStore);

  public readonly displayedColumns: string[] = [
    'consultant',
    'startDate',
    'endDate',
    'intExt',
    'idMission',
    'idConsultant',
    'idManager',
    'price',
    'client',
    'salaireBrut',
    'agence',
    'natureMission',
  ];
  public readonly ressources: Signal<ResourcesInterface[]> = this.store.ressources;
  public readonly loading: Signal<boolean> = this.store.isLoading;
  public readonly progress: Signal<number> = this.store.progress;
}
