import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, type Observable } from 'rxjs';
import { type AgenciesEnum } from '../../../../shared/enums/agencies.enum';
import { type CgoFileInterface } from '../../../../shared/interfaces/cgo-file.interface';

export interface TriggerResponse {
  message: string;
}

export interface StatusResponse {
  status: 'processing' | 'completed' | 'not_found' | 'failed';
  data?: CgoFileInterface;
  reason?: string;
  progress?: number;
  period?: string;
  agency?: AgenciesEnum;
}

@Injectable({
  providedIn: 'root',
})
export class CgoFileService {
  private apiUrl = `${environment.apiUrl}/cgo-file`;
  private http = inject(HttpClient);

  triggerGeneration(period: string, agency: AgenciesEnum): Observable<TriggerResponse> {
    return this.http.post<TriggerResponse>(`${this.apiUrl}/generate`, { period, agency });
  }

  getJobStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.apiUrl}/my-result`);
  }

  async checkInitialJobStatus(): Promise<StatusResponse> {
    return firstValueFrom(this.getJobStatus());
  }
}
