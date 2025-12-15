import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { cgoJobCheckGuard } from './cgo-job-check.guard';
import { CgoFileService, type StatusResponse } from '../../cgo-file/services/cgo-file.service';
import { CgoFileStore } from '../../cgo-file/stores/cgo-file.store';
import { signal, type WritableSignal } from '@angular/core';
import { mocked } from 'jest-mock';

const mockCgoFileService = {
  checkInitialJobStatus: jest.fn(),
};
const typedMockCgoFileService = mocked(mockCgoFileService);

type MockCgoFileStore = {
  callState: WritableSignal<'idle' | 'success' | object>;
  updateCgoData: jest.Mock;
  checkAndPollExistingJob: jest.Mock;
};

const mockCgoFileStore: MockCgoFileStore = {
  callState: signal('idle'),
  updateCgoData: jest.fn(),
  checkAndPollExistingJob: jest.fn(),
};

describe('cgoJobCheckGuard', () => {
  const mockRoute: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
  const mockState: RouterStateSnapshot = {
    url: '/test',
    root: mockRoute,
  };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCgoFileStore.callState.set('idle');

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        { provide: CgoFileService, useValue: mockCgoFileService },
        { provide: CgoFileStore, useValue: mockCgoFileStore },
      ],
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should call updateCgoData and checkAndPollExistingJob if a job is processing', async () => {
    const processingResponse: StatusResponse = { status: 'processing' };
    typedMockCgoFileService.checkInitialJobStatus.mockResolvedValue(processingResponse);

    const canActivate = await TestBed.runInInjectionContext(() =>
      cgoJobCheckGuard(mockRoute, mockState),
    );

    expect(typedMockCgoFileService.checkInitialJobStatus).toHaveBeenCalledTimes(1);
    expect(mockCgoFileStore.updateCgoData).toHaveBeenCalledWith(processingResponse);
    expect(mockCgoFileStore.checkAndPollExistingJob).toHaveBeenCalledTimes(1);
    expect(canActivate).toBe(true);
  });

  it('should call updateCgoData but NOT checkAndPollExistingJob if no job is found', async () => {
    const notFoundResponse: StatusResponse = { status: 'not_found' };
    typedMockCgoFileService.checkInitialJobStatus.mockResolvedValue(notFoundResponse);

    const canActivate = await TestBed.runInInjectionContext(() =>
      cgoJobCheckGuard(mockRoute, mockState),
    );

    expect(typedMockCgoFileService.checkInitialJobStatus).toHaveBeenCalledTimes(1);
    expect(mockCgoFileStore.updateCgoData).toHaveBeenCalledWith(notFoundResponse);
    expect(mockCgoFileStore.checkAndPollExistingJob).not.toHaveBeenCalled();
    expect(canActivate).toBe(true);
  });

  it('should return true and not call store methods if the service call fails', async () => {
    const error = new Error('API is down');
    typedMockCgoFileService.checkInitialJobStatus.mockRejectedValue(error);

    const canActivate = await TestBed.runInInjectionContext(() =>
      cgoJobCheckGuard(mockRoute, mockState),
    );

    expect(typedMockCgoFileService.checkInitialJobStatus).toHaveBeenCalledTimes(1);
    expect(mockCgoFileStore.updateCgoData).not.toHaveBeenCalled();
    expect(mockCgoFileStore.checkAndPollExistingJob).not.toHaveBeenCalled();
    expect(canActivate).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la vérification du statut initial du job :',
      error,
    );
  });

  it('should do nothing and return true if the store is not in an "idle" state', async () => {
    mockCgoFileStore.callState.set('success');

    const canActivate = await TestBed.runInInjectionContext(() =>
      cgoJobCheckGuard(mockRoute, mockState),
    );

    expect(typedMockCgoFileService.checkInitialJobStatus).not.toHaveBeenCalled();
    expect(canActivate).toBe(true);
  });
});
