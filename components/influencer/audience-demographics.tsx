// components/influencer/audience-demographics.tsx
//
// Server-rendered audience demographics visual for a single creator.
// Mini bar charts for age bands, gender split, and top-cities. Used
// inside the creator detail drawer.

import type {
  AudienceDemographics,
  AgeBand
} from "@/lib/influencer/types";
import { AGE_BANDS } from "@/lib/influencer/types";

export function AudienceDemographicsChart({
  audience
}: {
  audience: AudienceDemographics;
}) {
  return (
    <section
      className="space-y-5"
      aria-label="Creator audience demographics"
    >
      {/* Age bands */}
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-mist-500 mb-2">
          Age
        </h4>
        <div className="space-y-1.5">
          {AGE_BANDS.map((band) => (
            <Bar
              key={band}
              label={band as AgeBand}
              share={audience.ageBands[band]}
              accent
            />
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-mist-500 mb-2">
          Gender
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["female", "Female"],
              ["male", "Male"],
              ["other", "Other"]
            ] as const
          ).map(([k, label]) => (
            <div
              key={k}
              className="rounded-lg bg-mist-50/[0.04] hairline p-2.5 text-center"
            >
              <div className="text-base font-semibold text-mist-50 tabular-nums">
                {Math.round(audience.gender[k] * 100)}
                <span className="text-mist-400 text-xs">%</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-mist-500 mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top cities */}
      <div>
        <h4 className="text-[11px] uppercase tracking-wider text-mist-500 mb-2">
          Top cities
        </h4>
        <div className="space-y-1.5">
          {audience.topCities.map((tc) => (
            <Bar key={tc.city} label={tc.city} share={tc.share} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Bar({
  label,
  share,
  accent
}: {
  label: string;
  share: number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] text-mist-200 mb-0.5">
        <span>{label}</span>
        <span className="tabular-nums text-mist-100 font-semibold">
          {Math.round(share * 100)}%
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-mist-50/[0.06] overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${share * 100}%`,
            background: accent
              ? `linear-gradient(90deg, #15803D, #34D399)`
              : `linear-gradient(90deg, #A78BFA, #C4B5FD)`
          }}
        />
      </div>
    </div>
  );
}
