import { computed, inject } from '@angular/core';
import { pipe, switchMap, catchError, tap, EMPTY, takeWhile, timer, of, delay } from 'rxjs';
import {
  patchState,
  signalStore,
  withState,
  withMethods,
  withComputed,
  withProps,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CgoFileService, type StatusResponse } from '../services/cgo-file.service';
import { type AgenciesEnum } from '../../../../shared/enums/agencies.enum';
import { type CgoFileInterface } from '../../../../shared/interfaces/cgo-file.interface';

export type CallState = 'idle' | 'triggering' | 'polling' | 'success' | { error: string };

export interface CgoState {
  cgoData: CgoFileInterface | null;
  callState: CallState;
  progress: number;
  lastRequest: LastRequest | null;
}

const initialState: CgoState = {
  cgoData: null,
  callState: 'idle',
  progress: 0,
  lastRequest: null,
};

export interface GenerateInterface {
  period: string;
  agency: AgenciesEnum;
}

export interface LastRequest {
  period: string | undefined;
  agency: AgenciesEnum | undefined;
}

export const CgoFileStore = signalStore(
  withState(initialState),
  withProps((store, cgoFileService = inject(CgoFileService)) => ({
    createPollingObservable: () =>
      timer(500, 2000).pipe(
        switchMap(() => cgoFileService.getJobStatus()),
        tap((response: StatusResponse) => {
          if (response.status === 'completed') {
            patchState(store, { progress: 100 });
          } else if (response.status === 'failed') {
            patchState(store, { callState: { error: response.reason ?? 'Polling failed.' } });
          } else if (response.status === 'not_found') {
            patchState(store, { callState: { error: 'Job not found or expired.' } });
          } else if (['starting', 'processing'].includes(response.status)) {
            patchState(store, { progress: response.progress });
          }
        }),
        takeWhile((response) => ['processing', 'starting'].includes(response.status), true),
        switchMap((response) => {
          if (response.status === 'completed') {
            return of(response).pipe(delay(1000));
          }
          return of(response);
        }),
        tap((response: StatusResponse) => {
          if (response.status === 'completed') {
            patchState(store, {
              cgoData: response.data,
              progress: 0,
              callState: 'success',
            });
          }
        }),
        catchError((error) => {
          patchState(store, { callState: { error: error.message } });
          return EMPTY;
        }),
      ),
  })),
  withMethods((store, cgoFileService = inject(CgoFileService)) => ({
    generateAndPoll: rxMethod<GenerateInterface>(
      pipe(
        tap((data) => {
          patchState(store, {
            cgoData: null,
            progress: 0,
            callState: 'triggering',
            lastRequest: data,
          });
        }),
        switchMap((data) =>
          cgoFileService.triggerGeneration(data.period, data.agency).pipe(
            switchMap(() => {
              patchState(store, {
                callState: 'polling',
                lastRequest: { period: data.period, agency: data.agency },
              });
              return store.createPollingObservable();
            }),
            catchError((error) => {
              patchState(store, { callState: { error: error.message } });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
    checkAndPollExistingJob: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            callState: 'polling',
          });
        }),
        switchMap(() =>
          cgoFileService.getJobStatus().pipe(
            switchMap(() => {
              return store.createPollingObservable();
            }),
            catchError((error) => {
              patchState(store, { callState: { error: error.message } });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
    updateCgoData(statusResponse: StatusResponse): void {
      patchState(store, {
        cgoData: statusResponse?.data,
        progress: statusResponse?.progress,
        lastRequest: { period: statusResponse.period, agency: statusResponse.agency },
      });
    },
  })),
  withComputed((store) => ({
    isLoading: computed(
      () => store.callState() === 'triggering' || store.callState() === 'polling',
    ),
    isSuccess: computed(() => store.callState() === 'success'),
    ressources: computed(() => store.cgoData()?.ressources ?? []),
    cra: computed(() => store.cgoData()?.cra ?? []),
    notesDeFrais: computed(() => store.cgoData()?.notesDeFrais ?? []),
  })),
);
