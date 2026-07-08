import * as React from "react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-ink-800 ring-1 ring-mist-200 dark:ring-ink-700 overflow-hidden">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          aria-hidden
        >
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="55%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="logo-fill" x1="0" y1="36" x2="36" y2="0">
              <stop offset="0%" stopColor="#052E16" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Stylized leaf shape — rounded teardrop representing a sprout */}
          <path
            d="M18 4 C 27 8, 31 14, 31 22 C 31 28, 26 32, 18 32 C 10 32, 5 28, 5 22 C 5 14, 9 8, 18 4 Z"
            fill="url(#logo-grad)"
          />
          <path
            d="M18 4 C 27 8, 31 14, 31 22 C 31 28, 26 32, 18 32 C 10 32, 5 28, 5 22 C 5 14, 9 8, 18 4 Z"
            fill="url(#logo-fill)"
            opacity="0.6"
          />
          {/* Midrib + ascending chevron = the "growth" mark */}
          <path
            d="M18 9 L 18 30"
            stroke="#FFFFFF"
            strokeOpacity="0.55"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M14 22 L 18 18 L 22 22 M 14 27 L 18 23 L 22 27"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-mist-600 tracking-tight text-[15px]">
            Growth<span className="text-violet-700 dark:text-violet-300">Ads</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.20em] text-mist-500 dark:text-mist-300 font-medium">
            Built for Nigeria
          </span>
        </div>
      )}
    </div>
  );
}
