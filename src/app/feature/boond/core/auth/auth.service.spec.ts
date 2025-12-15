import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('boondModeSession', () => {
    it('should make a POST request to the verify endpoint with the signedRequest', () => {
      const testSignedRequest = 'test.signed.request';
      const mockResponse = { success: true };

      service.boondModeSession(testSignedRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/boond-login`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({ signedRequest: testSignedRequest });

      req.flush(mockResponse);
    });
  });

  describe('localModeSession', () => {
    it('should make a GET request to the local-login endpoint', () => {
      const mockResponse = { jwtClient: 'dev-token' };

      service.localModeSession().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/local-login`);

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });
});
