// components/influencer/content-mix-donut.tsx
//
// "use client" — Recharts PieChart (donut via innerRadius) showing
// the creator's content-mix. Light + dark via prop.

"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import type { ContentMixEntry, ContentKind } from "@/lib/influencer/types";
import { CONTENT_KIND_LABEL } from "@/lib/influencer/types";

const KIND_COLOR: Record<ContentKind, string> = {
  reel: "#10B981", // emerald-500
  carousel: "#34D399", // emerald-400
  story: "#A78BFA", // violet-400
  long: "#059669", // emerald-600
  static: "#64748B" // slate-500
};

export function ContentMixDonut({
  mix,
  variant = "dark"
}: {
  mix: ContentMixEntry[];
  variant?: "light" | "dark";
}) {
  const data = mix
    .filter((entry) => entry.share > 0)
    .map((entry) => ({
      name: CONTENT_KIND_LABEL[entry.kind],
      kind: entry.kind,
      value: Math.round(entry.share * 100)
    }));
  const total = data.reduce((s, d) => s + d.value, 0);

  const fg = variant === "dark" ? "#f4f4ff" : "#0b0b18";
  const bg = variant === "dark" ? "rgba(13,13,30,0.95)" : "rgba(255,255,255,0.95)";
  const border = variant === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.10)";

  return (
    <div className="space-y-3">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={true}
              animationBegin={150}
              animationDuration={600}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={KIND_COLOR[d.kind as ContentKind] ?? "#64748B"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                color: fg,
                fontSize: 12
              }}
              formatter={(value, _name, item) => {
                const kind =
                  item && typeof item === "object" && "payload" in item
                    ? (item as { payload?: { kind?: ContentKind } }).payload?.kind
                    : undefined;
                return [`${value}% ${kind ? CONTENT_KIND_LABEL[kind] : ""}`, "Share"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]">
        {data.map((d, i) => (
          <li
            key={`${d.kind}-${i}`}
            className="flex items-center gap-2"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: KIND_COLOR[d.kind as ContentKind] ?? "#64748B" }}
            />
            <span className="text-mist-200 flex-1 truncate">{d.name}</span>
            <span className="tabular-nums text-mist-50 font-semibold">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
