import { Component, input } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';

type AlertType = 'error' | 'success' | 'warning';

@Component({
  selector: 'app-alert',
  imports: [MatCard, MatCardContent],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {
  message = input.required<string>();
  alertType = input.required<AlertType>();
}
