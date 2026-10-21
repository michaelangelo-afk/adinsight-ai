import {
  Handshake,
  MapPin,
  MessageCircle,
  Network,
  Search,
  Store,
  Users,
  type LucideIcon
} from "lucide-react";
import type { ChannelGroup } from "@/lib/platforms/catalog";
import { PLATFORM_LOGOS } from "@/lib/platforms/logos";
import { cn } from "@/lib/utils";

const ICONS: Record<ChannelGroup, LucideIcon> = {
  search: Search,
  social: Users,
  messaging: MessageCircle,
  marketplace: Store,
  local: MapPin,
  network: Network,
  "sales-led": Handshake
};

export function ChannelGlyph({
  channelId,
  group,
  size = 24,
  className
}: {
  channelId: string;
  group: ChannelGroup;
  size?: number;
  className?: string;
}) {
  const src = PLATFORM_LOGOS[channelId];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        aria-hidden
        className={cn(
          // `w-auto` lets wordmarks (Konga, Transsion) stay legible instead of
          // being squeezed into the square icon box; square marks stay 24px.
          "h-6 w-auto max-w-[88px] shrink-0 object-contain",
          className
        )}
      />
    );
  }

  const Icon = ICONS[group];
  return <Icon size={size} aria-hidden className={cn("shrink-0", className)} />;
}
