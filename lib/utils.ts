import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

const NGN_DEC = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2
});

export const formatNaira = (n: number) => NGN.format(n);
export const formatNairaPrecise = (n: number) => NGN_DEC.format(n);

export const formatCompactNumber = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

export const formatPercent = (n: number, digits = 1) =>
  `${(n * 100).toFixed(digits)}%`;

export const formatDelta = (delta: number) => {
  const sign = delta >= 0 ? "▲" : "▼";
  return `${sign} ${Math.abs(delta).toFixed(1)}%`;
};

export const statusColor: Record<string, "good" | "warn" | "bad"> = {
  active: "good",
  healthy: "good",
  applied: "good",
  paused: "warn",
  pending: "warn",
  dismissed: "bad",
  completed: "good"
};

export const statusLabel: Record<string, string> = {
  active: "Active",
  healthy: "Healthy",
  applied: "Applied",
  paused: "Paused",
  pending: "Pending",
  dismissed: "Dismissed",
  completed: "Completed"
};
