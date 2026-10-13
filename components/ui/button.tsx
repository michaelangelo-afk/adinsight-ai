import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

/**
 * Size scale.
 *
 * Every step now pins BOTH a height and a horizontal rhythm instead of relying on
 * `py-*`, because padding-based sizing made the rendered heights land on odd
 * values (38px, 41px) that never lined up with the 4px grid or with each other
 * when a button sat next to an input or a chip. Fixed heights + centred content
 * means two buttons in a row are always exactly the same height.
 *
 * Hit areas: WCAG 2.5.8 (AA) wants 24×24 and 2.5.5 (AAA) wants 44×44. `md` — the
 * default, and what every touch-facing CTA uses — clears 44. `sm` is 40px, and is
 * reserved for dense desktop chrome (the landing nav, table toolbars) where the
 * pointer is a mouse; it still clears AA comfortably. `lg` is 48px for hero CTAs.
 *
 * Gap scales with the type size (1.5 / 2 / 2.5) so the icon-to-label distance
 * stays optically constant rather than looking cramped on the large button.
 */
const sizes: Record<Size, string> = {
  sm: "h-10 min-h-10 px-3.5 text-xs gap-1.5",
  md: "h-11 min-h-11 px-5 text-sm gap-2",
  lg: "h-12 min-h-12 px-6 text-base gap-2.5"
};

/**
 * Variants.
 *
 * Shared rules, so no variant can drift:
 *  - `cursor-pointer`: Tailwind's preflight leaves <button> with the default
 *    arrow cursor, which made every button in the product feel non-clickable.
 *  - `focus-visible:ring-*`: keyboard focus is visible on every variant. The
 *    offset colour matches the surface it sits on, light and dark.
 *  - a press state (`active:`) on all four, because `:active` is the only
 *    feedback a touch user gets before the navigation happens.
 *  - no arbitrary shadows anywhere — `shadow-card` and `shadow-glow` only.
 */
const shared =
  "inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap " +
  "rounded-2xl font-semibold transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-brand-500/50 focus-visible:ring-offset-surface-50 " +
  "dark:focus-visible:ring-offset-ink-950 " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-card " +
    "hover:bg-brand-600 hover:shadow-glow hover:-translate-y-px " +
    "active:translate-y-0 active:scale-[0.985] active:bg-brand-700",
  secondary:
    "bg-white text-mist-600 border border-mist-300 shadow-card " +
    "hover:bg-mist-50 hover:border-mist-400 hover:-translate-y-px " +
    "active:translate-y-0 active:scale-[0.985] " +
    "dark:bg-ink-900 dark:text-mist-100 dark:border-ink-700 dark:hover:bg-ink-850 dark:hover:border-brand-700/50",
  outline:
    "bg-white text-brand-700 border border-brand-300 " +
    "hover:border-brand-600 hover:bg-brand-50 hover:-translate-y-px " +
    "active:translate-y-0 active:scale-[0.985] " +
    "dark:bg-ink-900 dark:text-brand-300 dark:border-brand-700/50 dark:hover:border-brand-500 dark:hover:bg-brand-950/60",
  ghost:
    "bg-transparent text-mist-600 " +
    "hover:bg-mist-100 hover:text-brand-700 active:scale-[0.985] active:bg-mist-200 " +
    "dark:text-mist-200 dark:hover:bg-ink-850 dark:hover:text-brand-300 dark:active:bg-ink-800"
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...rest
}: CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  }) {
  const cls = cn(shared, sizes[size], variants[variant], className);

  // Internal navigation uses Next.js <Link> for client-side routing + prefetch.
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link
        href={href}
        className={cls}
        {...(rest as Omit<
          React.ComponentProps<typeof Link>,
          "href" | "className"
        >)}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and blocks interaction. Keeps the label to preserve width. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(shared, sizes[size], variants[variant], className)}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
