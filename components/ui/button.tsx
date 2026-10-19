import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

/**
 * Size scale — pinned heights, not padding-derived.
 *
 * `md` (44px) is the default and the touch-facing floor; `sm` (40px) is reserved
 * for desktop chrome; `lg` (48px) is the hero CTA. Letter-spacing tightens as
 * the label grows so the mono caps stay optically even.
 */
const sizes: Record<Size, string> = {
  sm: "h-10 min-h-10 px-3.5 gap-1.5",
  md: "h-11 min-h-11 px-5 gap-2",
  lg: "h-12 min-h-12 px-6 gap-2.5"
};

/**
 * Shared voice: mono, uppercase, tracked. Buttons read as press-stamped labels
 * rather than rounded SaaS pills — the same language as the ticker and the
 * statement rows. Keyboard focus comes from the global `:focus-visible` rule.
 */
const shared =
  "inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap " +
  "rounded-xs border border-transparent font-mono text-xs font-medium uppercase tracking-[0.1em] " +
  "transition-colors duration-200 tap-press " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-950 text-paper-50 border-ink-950 hover:bg-brand-800 hover:border-brand-800 " +
    "dark:bg-paper-50 dark:text-ink-950 dark:border-paper-50 dark:hover:bg-brand-200 dark:hover:border-brand-200",
  secondary:
    "bg-transparent text-ink-950 border-ink-950/35 hover:bg-paper-200 hover:border-brand-800 " +
    "dark:text-paper-50 dark:border-paper-50/35 dark:hover:bg-ink-850 dark:hover:border-brand-300",
  outline:
    "bg-transparent text-brand-700 border-brand-700 hover:bg-brand-50 " +
    "dark:text-brand-200 dark:border-brand-300 dark:hover:bg-brand-950",
  ghost:
    "bg-transparent text-mist-600 border-transparent hover:bg-paper-200 hover:text-ink-950 " +
    "dark:text-mist-300 dark:hover:bg-ink-850 dark:hover:text-paper-50"
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
