import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import { mmkv } from '@utils/mmkvStorage';

const CACHE_KEY = 'rq-cache-v1';
export const PERSIST_MAX_AGE = 24 * 60 * 60_000;

/**
 * Saves the browse data (home, catalog, meals, kitchens) to MMKV so the next
 * app open paints real content instantly while a fresh copy loads behind it
 * (stale-while-revalidate). MMKV is synchronous, so restoring costs a few ms.
 */
export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => mmkv.getString(key) ?? null,
    setItem: (key, value) => mmkv.set(key, value),
    removeItem: (key) => {
      mmkv.remove(key);
    },
  },
  key: CACHE_KEY,
  throttleTime: 2000,
});

/** Only public browse queries are saved. Cart, orders, wallet and chats stay in memory. */
const PERSISTED_ROOTS = new Set(['home', 'catalog', 'meals', 'kitchens']);
const NEVER_PERSISTED = new Set(['favorites', 'following']);

export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: queryPersister,
  maxAge: PERSIST_MAX_AGE,
  buster: '1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      if (query.state.status !== 'success') return false;
      const [root, second] = query.queryKey as unknown[];
      return PERSISTED_ROOTS.has(String(root)) && !NEVER_PERSISTED.has(String(second));
    },
  },
};
