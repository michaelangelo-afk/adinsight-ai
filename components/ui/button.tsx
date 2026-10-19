import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "white" | "glass";
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
  "rounded-full border border-transparent text-sm font-medium " +
  "transition-colors duration-200 tap-press " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  /** App primary. */
  primary:
    "bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 shadow-card",
  /** App secondary (light surfaces in both themes). */
  secondary:
    "bg-surface-50 text-mist-600 border-mist-300 hover:bg-mist-50 hover:border-mist-400 " +
    "dark:bg-ink-900 dark:text-mist-100 dark:border-ink-700 dark:hover:bg-ink-850",
  outline:
    "bg-transparent text-brand-700 border-brand-300 hover:bg-brand-50 " +
    "dark:text-brand-200 dark:border-brand-500/40 dark:hover:bg-brand-500/10",
  ghost:
    "bg-transparent text-mist-600 hover:bg-mist-100 hover:text-ink-950 " +
    "dark:text-mist-300 dark:hover:bg-ink-850 dark:hover:text-white",
  /** Marketing primary — contrast pill, inverts with the shell. */
  white:
    "bg-shell text-shellbg shadow-cta-ring hover:brightness-[0.96] dark:hover:brightness-100",
  /** Marketing secondary — glass pill, accent-tinted. */
  glass:
    "text-shell border-accent/30 bg-shell/[0.04] " +
    "hover:bg-accent/10 hover:border-accent/50"
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
