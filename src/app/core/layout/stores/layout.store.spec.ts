import { TestBed } from '@angular/core/testing';
import { LayoutStore } from './layout.store';

describe('LayoutStore', () => {
  let store: InstanceType<typeof LayoutStore>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayoutStore],
    });

    store = TestBed.inject(LayoutStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have an initial isRouterLoading state of false', () => {
      expect(store.isRouterLoading()).toBe(false);
    });
  });

  describe('withMethods: setRouterLoading', () => {
    it('should set isRouterLoading to true', () => {
      expect(store.isRouterLoading()).toBe(false);

      store.setRouterLoading(true);

      expect(store.isRouterLoading()).toBe(true);
    });

    it('should set isRouterLoading to false after being true', () => {
      store.setRouterLoading(true);
      expect(store.isRouterLoading()).toBe(true);

      store.setRouterLoading(false);

      expect(store.isRouterLoading()).toBe(false);
    });
  });

  describe('withComputed: isLoading', () => {
    it('should reflect the value of isRouterLoading', () => {
      expect(store.isLoading()).toBe(false);
      expect(store.isLoading()).toBe(store.isRouterLoading());

      store.setRouterLoading(true);
      expect(store.isLoading()).toBe(true);
      expect(store.isLoading()).toBe(store.isRouterLoading());

      store.setRouterLoading(false);
      expect(store.isLoading()).toBe(false);
      expect(store.isLoading()).toBe(store.isRouterLoading());
    });
  });
});
