import { Component, computed, inject, type Signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { type Moment } from 'moment';
import moment from 'moment/moment';
import { MAT_DATE_FORMATS, MatOption } from '@angular/material/core';
import { CgoFileStore, type LastRequest } from '../../../stores/cgo-file.store';
import { Alert } from '../../../../../../shared/components/alert/alert';
import { AgenciesLabels } from '../../../../../../shared/enums/agencies.enum';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MMMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-cgo-file-form',
  imports: [
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerModule,
    MatDatepickerToggle,
    MatFormField,
    MatIcon,
    MatInputModule,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    ReactiveFormsModule,
    Alert,
  ],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
  templateUrl: './cgo-file-form.html',
  styleUrl: './cgo-file-form.scss',
})
export class CgoFileForm {
  private store = inject(CgoFileStore);

  public readonly loading: Signal<boolean> = this.store.isLoading;
  public readonly progress: Signal<number> = this.store.progress;
  public readonly lastRequest: Signal<LastRequest | null> = this.store.lastRequest;

  private fb: FormBuilder = inject(FormBuilder);

  public form: FormGroup = this.fb.group({
    date: [
      this.store.lastRequest()?.period
        ? moment(this.store.lastRequest()?.period, 'MM/YYYY')
        : moment(),
      Validators.required,
    ],
    agency: [this.store.lastRequest()?.agency ?? null, Validators.required],
  });
  message = computed(() => {
    return `Une récupération de données est en cours. Periode: ${this.lastRequest()?.period}, Agence: ${AgenciesLabels[this.lastRequest()?.agency ?? 2]} ${this.progress()}%`;
  });

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    if (this.form.value.date) {
      const ctrlValue = this.form.value.date;
      ctrlValue.month(normalizedMonthAndYear.month());
      ctrlValue.year(normalizedMonthAndYear.year());
      this.form.get('date')?.setValue(ctrlValue);
      datepicker.close();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.store.generateAndPoll({
        period: this.form.value.date.format('MM/YYYY'),
        agency: Number(this.form.value.agency),
      });
    }
  }
}
