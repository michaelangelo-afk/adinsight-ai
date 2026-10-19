import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Wordmark + mark.
 *
 * The mark is a ruled square containing three rising bars — the smallest
 * possible statement of the product ("spend that goes up and to the right").
 * It is drawn in ink, so it survives on paper and on the dark stock without a
 * second asset, and it has none of the glossy gradient of the old leaf.
 */
export function Logo({
  className,
  showWordmark = true,
  onInk = false
}: {
  className?: string;
  showWordmark?: boolean;
  /** Forces the paper-on-ink treatment for fixed dark panels, where the
   *  theme-aware `dark:` twin cannot apply (the page may be in light mode). */
  onInk?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={
          "relative inline-flex h-9 w-9 shrink-0 items-end justify-center gap-[3px] px-[7px] pb-[8px] pt-[9px] " +
          (onInk
            ? "border border-paper-100 bg-paper-100"
            : "border border-ink-950 bg-ink-950 dark:border-paper-100 dark:bg-paper-100")
        }
        aria-hidden
      >
        <span
          className={
            "h-[6px] w-[4px] " + (onInk ? "bg-brand-500" : "bg-brand-300 dark:bg-brand-800")
          }
        />
        <span
          className={
            "h-[10px] w-[4px] " + (onInk ? "bg-brand-700" : "bg-brand-200 dark:bg-brand-700")
          }
        />
        <span
          className={
            "h-[14px] w-[4px] " + (onInk ? "bg-brand-900" : "bg-paper-50 dark:bg-brand-900")
          }
        />
      </span>
      {showWordmark && (
        <span className="flex items-baseline gap-1.5">
          <span
            className={
              "font-display text-xl font-semibold leading-none tracking-[-0.02em] " +
              (onInk ? "text-paper-50" : "text-ink-950 dark:text-paper-50")
            }
          >
            GrowthAds
          </span>
          <span
            className={
              "font-mono text-xs font-medium leading-none " +
              (onInk ? "text-brand-200" : "text-brand-700 dark:text-brand-200")
            }
          >
            NG
          </span>
        </span>
      )}
    </div>
  );
}
