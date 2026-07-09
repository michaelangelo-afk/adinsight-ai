// lib/influencer/use-shortlist.ts
//
// "use client" hook for the creator shortlist. localStorage-backed;
// reads are deferred to `useEffect` so SSR markup matches first
// client render (server emits empty state regardless). Listens for
// the `adinsight:shortlist` CustomEvent so multiple panels stay in
// sync without prop-drilling.

"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "adinsight.shortlist.v1";
const EVENT_NAME = "adinsight:shortlist";

interface ShortlistState {
  ids: string[];
  hydrated: boolean;
}

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota exceeded — silent. */
  }
}

function broadcast(ids: string[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { ids } })
  );
}

/**
 * Hook return:
 *  - `ids`: list of shortlisted creator ids (server-rendered as empty)
 *  - `hydrated`: true after the first client-side read
 *  - `toggle(id)`: add or remove
 *  - `has(id)`: O(1) check
 *  - `removeAll()`, `addMany(ids)`: bulk ops
 */
export function useShortlist() {
  const [state, setState] = useState<ShortlistState>({
    ids: [],
    hydrated: false
  });

  // Hydrate once on mount.
  useEffect(() => {
    const stored = readStorage();
    setState({ ids: stored, hydrated: true });
  }, []);

  // Listen for cross-panel updates (Shortlist panel + Creator card
  // emit the same event when they mutate).
  useEffect(() => {
    function handler(ev: Event) {
      const ce = ev as CustomEvent<{ ids?: string[] }>;
      if (!ce.detail || !Array.isArray(ce.detail.ids)) return;
      setState({ ids: ce.detail.ids, hydrated: true });
    }
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const mutate = useCallback((next: string[]) => {
    setState({ ids: next, hydrated: true });
    writeStorage(next);
    broadcast(next);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setState((prev) => {
        const exists = prev.ids.includes(id);
        const next = exists
          ? prev.ids.filter((x) => x !== id)
          : [...prev.ids, id];
        writeStorage(next);
        broadcast(next);
        return { ids: next, hydrated: true };
      });
    },
    []
  );

  const removeAll = useCallback(() => mutate([]), [mutate]);
  const addMany = useCallback(
    (ids: string[]) => mutate(Array.from(new Set(ids))),
    [mutate]
  );

  const has = useCallback((id: string) => state.ids.includes(id), [state.ids]);

  return {
    ids: state.ids,
    hydrated: state.hydrated,
    toggle,
    removeAll,
    addMany,
    has
  };
}

/** Convenience for non-React callers: synchronous client-only read. */
export function readShortlistSync(): string[] {
  return readStorage();
}

/** Constant exported in case other components want to subscribe. */
export const SHORTLIST_EVENT = EVENT_NAME;
export const SHORTLIST_KEY = STORAGE_KEY;
