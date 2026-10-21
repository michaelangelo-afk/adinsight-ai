import type { AssistedChannelId } from "@/lib/channels/assisted";

export interface LaunchRecord {
  id: string;
  channelId: AssistedChannelId;
  channelName: string;
  title: string;
  at: string;
  url: string;
}

const KEY = "growthads:assisted-launches:v1";
const LIMIT = 12;

export function readLaunches(): LaunchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is LaunchRecord => {
        if (!v || typeof v !== "object") return false;
        const r = v as Partial<LaunchRecord>;
        return (
          typeof r.id === "string" &&
          typeof r.channelId === "string" &&
          typeof r.channelName === "string" &&
          typeof r.title === "string" &&
          typeof r.at === "string" &&
          typeof r.url === "string"
        );
      })
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

export function addLaunch(record: LaunchRecord): LaunchRecord[] {
  const next = [record, ...readLaunches().filter((r) => r.id !== record.id)].slice(
    0,
    LIMIT
  );
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota: the session still works, history just won't persist.
  }
  return next;
}

export function clearLaunches(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore storage failures.
  }
}
