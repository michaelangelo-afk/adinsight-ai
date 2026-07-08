import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Sign in — GrowthAds",
  description: "Sign in to your GrowthAds dashboard."
};

export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface-50 dark:bg-ink-950">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
