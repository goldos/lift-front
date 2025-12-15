import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CgoFileService, type StatusResponse } from './cgo-file.service';
import { AgenciesEnum } from '../../../../shared/enums/agencies.enum';
import { environment } from '../../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('CgoFileService', () => {
  let service: CgoFileService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/cgo-file`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CgoFileService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CgoFileService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#triggerGeneration', () => {
    it('should send a POST request with period and agency in the body', () => {
      const testPeriod = '07/2024';
      const testAgency = AgenciesEnum.BORDEAUX;
      const mockResponse = { message: 'Job started' };

      service.triggerGeneration(testPeriod, testAgency).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/generate`);

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        period: testPeriod,
        agency: testAgency,
      });

      req.flush(mockResponse);
    });

    it('should handle API errors', () => {
      const testPeriod = '07/2024';
      const testAgency = AgenciesEnum.BORDEAUX;
      const errorMessage = 'deliberate 404 error';

      service.triggerGeneration(testPeriod, testAgency).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: (error) => {
          expect(error.status).toEqual(404);
          expect(error.statusText).toEqual('Not Found');
        },
      });

      const req = httpTestingController.expectOne(`${apiUrl}/generate`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('#getJobStatus', () => {
    it('should send a GET request to the my-result endpoint', () => {
      const mockResponse: StatusResponse = { status: 'processing', progress: 50 };

      service.getJobStatus().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/my-result`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
    });
  });

  describe('#checkInitialJobStatus', () => {
    it('should call getJobStatus and return its result as a Promise', async () => {
      const mockResponse: StatusResponse = {
        status: 'completed',
        data: {
          ressources: [],
          cra: [],
          notesDeFrais: [],
        },
      };

      const promise = service.checkInitialJobStatus();

      const req = httpTestingController.expectOne(`${apiUrl}/my-result`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });

    it('should reject the promise if the API call fails', async () => {
      const errorMessage = 'deliberate 500 error';

      const promise = service.checkInitialJobStatus();

      const req = httpTestingController.expectOne(`${apiUrl}/my-result`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });

      await expect(promise).rejects.toBeTruthy();
    });
  });
});
