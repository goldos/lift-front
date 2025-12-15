import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';

export interface LayoutState {
  isRouterLoading: boolean;
}

const initialState: LayoutState = {
  isRouterLoading: false,
};

export const LayoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setRouterLoading(isLoading: boolean): void {
      patchState(store, { isRouterLoading: isLoading });
    },
  })),
  withComputed((store) => ({
    isLoading: computed(() => store.isRouterLoading()),
  })),
);
