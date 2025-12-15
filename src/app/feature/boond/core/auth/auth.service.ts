import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { type Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);

  boondModeSession(signedRequest: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/boond-login`, { signedRequest: signedRequest });
  }

  localModeSession(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/local-login`);
  }
}
