import { Component } from '@angular/core';
import { CgoFileForm } from './forms/cgo-file-form/cgo-file-form';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { ResourcesTable } from './tables/resources-table/resources-table';
import { CraTable } from './tables/cra-table/cra-table';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NotesFraisTable } from './tables/notes-frais-table/notes-frais-table';

@Component({
  selector: 'app-cgo-file',
  imports: [
    CgoFileForm,
    MatTabGroup,
    MatTab,
    ResourcesTable,
    CraTable,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatIcon,
    MatTabLabel,
    NotesFraisTable,
  ],
  templateUrl: './cgo-file.html',
  styleUrl: './cgo-file.scss',
})
export class CgoFile {}
