import { useStoreContext } from './store';

/**
 * PUBLIC_INTERFACE
 * Hook that exposes state and actions from the store.
 */
export function useStore() {
  return useStoreContext();
}
