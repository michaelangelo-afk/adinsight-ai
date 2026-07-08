import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  variant = "elevated",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "elevated" | "glow" | "subtle";
}) {
  const variants = {
    elevated: "glass-card shadow-card-elevated hover-lift",
    glow:
      "glass-card shadow-glow-violet border-violet-500/20 hover-lift",
    subtle: "rounded-xl bg-ink-850/60 hairline transition-colors duration-300"
  };
  return (
    <div
      className={cn("rounded-2xl", variants[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-5 sm:p-6 pb-3 flex items-start justify-between gap-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-tight text-mist-50",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-mist-300", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 pt-0 flex items-center gap-2 mt-2",
        className
      )}
      {...props}
    />
  );
}
