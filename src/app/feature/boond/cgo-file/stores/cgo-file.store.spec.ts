import { TestBed } from '@angular/core/testing';
import { CgoFileStore } from './cgo-file.store';
import { CgoFileService, type StatusResponse } from '../services/cgo-file.service';
import { of, Subject, throwError } from 'rxjs';
import { type GenerateInterface } from './cgo-file.store';
import { AgenciesEnum } from '../../../../shared/enums/agencies.enum';
import { type CgoFileInterface } from '../../../../shared/interfaces/cgo-file.interface';

const mockCgoFileService = {
  triggerGeneration: jest.fn(),
  getJobStatus: jest.fn(),
};

describe('CgoFileStore', () => {
  let store: InstanceType<typeof CgoFileStore>;
  let generateResponse$: Subject<CgoFileInterface>;

  beforeEach(() => {
    generateResponse$ = new Subject<CgoFileInterface>();
    mockCgoFileService.triggerGeneration.mockReturnValue(generateResponse$.asObservable());

    TestBed.configureTestingModule({
      providers: [CgoFileStore, { provide: CgoFileService, useValue: mockCgoFileService }],
    });

    store = TestBed.inject(CgoFileStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.ressources()).toEqual([]);
      expect(store.cra()).toEqual([]);
      expect(store.notesDeFrais()).toEqual([]);
      expect(store.callState()).toBe('idle');
      expect(store.progress()).toBe(0);
      expect(store.lastRequest()).toBeNull();
      expect(store.cgoData()).toBeNull();
      expect(store.isLoading()).toBe(false);
      expect(store.isSuccess()).toBe(false);
    });
  });

  describe('generateAndPoll', () => {
    let jobStatus$: Subject<StatusResponse>;
    const testData: GenerateInterface = {
      period: '01/2024',
      agency: AgenciesEnum.BORDEAUX,
    };
    const mockCgoData = {
      ressources: [],
      cra: [],
      notesDeFrais: [],
    };

    beforeEach(() => {
      jobStatus$ = new Subject<StatusResponse>();

      mockCgoFileService.triggerGeneration.mockReturnValue(of({ message: 'Job started' }));
      mockCgoFileService.getJobStatus.mockReturnValue(jobStatus$);
    });

    it('should call triggerGeneration and start polling', async () => {
      store.generateAndPoll(testData);
      await Promise.resolve();

      expect(mockCgoFileService.triggerGeneration).toHaveBeenCalledWith(
        testData.period,
        testData.agency,
      );

      expect(store.callState()).toBe('polling');
      expect(store.lastRequest()).toEqual(testData);
    });

    it('should transition to success state after polling', async () => {
      store.generateAndPoll(testData);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(store.callState()).toBe('polling');

      jobStatus$.next({ status: 'completed', data: mockCgoData });
      jobStatus$.complete();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(store.callState()).toBe('success');
      expect(store.isSuccess()).toBe(true);

      expect(store.cgoData()).toEqual(mockCgoData);
    });

    it('should transition to failed state on polling failure', async () => {
      store.generateAndPoll(testData);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(store.callState()).toBe('polling');

      jobStatus$.next({ status: 'failed', reason: 'API Down' });
      jobStatus$.complete();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(store.callState()).toEqual({ error: 'API Down' });
    });

    it('should transition to failed state on polling failure with no reason', async () => {
      store.generateAndPoll(testData);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(store.callState()).toBe('polling');

      jobStatus$.next({ status: 'failed' });
      jobStatus$.complete();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(store.callState()).toEqual({ error: 'Polling failed.' });
    });

    it('should transition to not_found state if job is not found', async () => {
      store.generateAndPoll(testData);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(store.callState()).toBe('polling');

      jobStatus$.next({ status: 'not_found' });
      jobStatus$.complete();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(store.callState()).toEqual({ error: 'Job not found or expired.' });
    });

    it('should transition to processing state after triggering', async () => {
      store.generateAndPoll(testData);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(store.callState()).toBe('polling');

      jobStatus$.next({ status: 'processing', progress: 80 });
      jobStatus$.complete();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(store.callState()).toBe('polling');
      expect(store.progress()).toBe(80);
    });

    it('should transition to error state if polling fails', async () => {
      const error = new Error('Polling failed');

      store.generateAndPoll(testData);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(store.callState()).toBe('polling');

      jobStatus$.error(error);

      await Promise.resolve();

      expect(store.callState()).toEqual({ error: error.message });
    });

    it('should set an error state if triggerGeneration fails', () => {
      const error = new Error('API is down');
      mockCgoFileService.getJobStatus.mockClear();
      mockCgoFileService.triggerGeneration.mockReturnValue(throwError(() => error));

      store.generateAndPoll(testData);

      expect(store.callState()).toEqual({ error: error.message });
      expect(mockCgoFileService.getJobStatus).not.toHaveBeenCalled();
    });
  });

  describe('checkAndPollExistingJob', () => {
    beforeEach(() => {
      mockCgoFileService.triggerGeneration.mockClear();
      mockCgoFileService.getJobStatus.mockClear();
    });
    it('should start polling if an existing job is processing', async () => {
      const initialResponse: StatusResponse = {
        status: 'processing',
        progress: 25,
        period: '12/2023',
        agency: AgenciesEnum.BORDEAUX,
      };
      mockCgoFileService.getJobStatus.mockReturnValueOnce(of(initialResponse));

      const pollingStatus$ = new Subject<StatusResponse>();
      mockCgoFileService.getJobStatus.mockReturnValue(pollingStatus$);

      store.checkAndPollExistingJob();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(store.callState()).toBe('polling');
      expect(mockCgoFileService.getJobStatus).toHaveBeenCalledTimes(2);
    });

    it('should set an error state if triggerGeneration fails', () => {
      const error = new Error('API is down');
      mockCgoFileService.getJobStatus.mockReturnValue(throwError(() => error));

      store.checkAndPollExistingJob();

      expect(store.callState()).toEqual({ error: error.message });
    });
  });

  describe('updateCgoData', () => {
    it('should update the store with the provided data', () => {
      const initialResponse: StatusResponse = {
        status: 'processing',
        progress: 25,
        period: '12/2023',
        agency: AgenciesEnum.BORDEAUX,
      };

      store.updateCgoData(initialResponse);

      expect(store.cgoData()).toEqual(initialResponse.data);
      expect(store.progress()).toEqual(initialResponse.progress);
      expect(store.lastRequest()).toEqual({
        period: initialResponse.period,
        agency: initialResponse.agency,
      });
    });
  });
});
