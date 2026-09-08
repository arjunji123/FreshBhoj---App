import { useCallback, useState } from 'react';
import { mmkv } from '@utils/mmkvStorage';

const STORAGE_KEY = 'search-history';
const MAX_ITEMS = 8;

function readHistory(): string[] {
  try {
    const raw = mmkv.getString(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Local, per-device search history — most recent first, capped at 8 terms. */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(readHistory);

  const persist = useCallback((next: string[]) => {
    setHistory(next);
    mmkv.set(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addTerm = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 2) return;
      setHistory((current) => {
        const next = [
          trimmed,
          ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, MAX_ITEMS);
        mmkv.set(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const removeTerm = useCallback(
    (term: string) => {
      persist(history.filter((item) => item !== term));
    },
    [history, persist],
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  return { history, addTerm, removeTerm, clearAll };
}
