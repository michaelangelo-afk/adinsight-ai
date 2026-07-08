import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base"
};

const variants: Record<Variant, string> = {
  primary:
    "bg-violet-700 text-white hover:bg-violet-600 shadow-glow-emerald hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.55)] hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-white text-mist-600 border border-mist-300 hover:bg-mist-50 hover:border-mist-400 " +
    "dark:bg-ink-900 dark:text-mist-100 dark:border-ink-700 dark:hover:bg-ink-850 dark:hover:border-violet-700/40",
  outline:
    "bg-white text-violet-700 border border-violet-300 hover:border-violet-600 hover:bg-violet-50/50 " +
    "dark:bg-ink-900 dark:text-violet-300 dark:border-violet-700/40 dark:hover:border-violet-500 dark:hover:text-violet-200",
  ghost:
    "bg-transparent text-mist-600 hover:bg-mist-100 hover:text-violet-700 " +
    "dark:text-mist-200 dark:hover:bg-ink-850 dark:hover:text-mist-50"
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
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-surface-50 dark:focus-visible:ring-offset-ink-950",
    sizes[size],
    variants[variant],
    className
  );

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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-surface-50 dark:focus-visible:ring-offset-ink-950",
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
