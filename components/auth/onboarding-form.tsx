"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Wallet,
  Target,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const OBJECTIVES = [
  { value: "conversions", label: "Conversions", desc: "Get more orders or sign-ups" },
  { value: "leads", label: "Leads", desc: "Collect contact information" },
  { value: "traffic", label: "Traffic", desc: "Drive visitors to your website" },
  { value: "awareness", label: "Awareness", desc: "Reach more people" },
  { value: "engagement", label: "Engagement", desc: "Get more likes, comments, shares" }
] as const;

const BUDGET_OPTIONS = [
  { value: 50000, label: "₦50,000" },
  { value: 100000, label: "₦100,000" },
  { value: 250000, label: "₦250,000" },
  { value: 500000, label: "₦500,000" },
  { value: 1000000, label: "₦1,000,000" },
  { value: 2000000, label: "₦2,000,000+" }
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(250000);
  const [objective, setObjective] = useState("conversions");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          phone,
          monthlyAdBudget: monthlyBudget,
          primaryObjective: objective
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass-card p-8 shadow-card-elevated dark:shadow-card-elevated-dark">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                s === step
                  ? "bg-violet-700 text-white"
                  : s < step
                  ? "bg-violet-700/30 text-violet-300"
                  : "bg-mist-50/[0.04] hairline text-mist-400"
              )}
            >
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "h-px w-8",
                  s < step ? "bg-violet-700/50" : "bg-mist-50/[0.08]"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-xl font-bold tracking-tight text-mist-600 dark:text-mist-50 text-center">
        {step === 1 && "Tell us about your business"}
        {step === 2 && "What's your monthly ad budget?"}
        {step === 3 && "What do you want to achieve?"}
      </h1>
      <p className="mt-2 text-sm text-mist-600 dark:text-mist-300 text-center mb-8">
        {step === 1 && "We'll use this to personalise your dashboard."}
        {step === 2 && "This helps us tailor recommendations to your spend level."}
        {step === 3 && "Your primary objective shapes your AI recommendations."}
      </p>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-600 dark:text-rose-400 mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Business name + phone */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mist-600 dark:text-mist-200 mb-1.5">
              Business name
            </label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
              />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                placeholder="Lagos Bites"
                className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-3 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mist-600 dark:text-mist-200 mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 803 555 0123"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 px-3 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: Budget */}
      {step === 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMonthlyBudget(opt.value)}
              className={cn(
                "rounded-xl border p-4 text-center transition-all",
                monthlyBudget === opt.value
                  ? "border-violet-700/60 bg-violet-700/10 text-violet-700 dark:border-violet-500/60 dark:bg-violet-500/15 dark:text-violet-200 shadow-glow-emerald"
                  : "border-mist-200 bg-white hover:border-violet-700/30 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-violet-700/40"
              )}
            >
              <Wallet
                size={20}
                className={cn(
                  "mx-auto mb-2",
                  monthlyBudget === opt.value
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-mist-400"
                )}
              />
              <div
                className={cn(
                  "text-sm font-semibold",
                  monthlyBudget === opt.value
                    ? "text-violet-700 dark:text-violet-200"
                    : "text-mist-600 dark:text-mist-200"
                )}
              >
                {opt.label}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Objective */}
      {step === 3 && (
        <div className="space-y-3">
          {OBJECTIVES.map((obj) => (
            <button
              key={obj.value}
              type="button"
              onClick={() => setObjective(obj.value)}
              className={cn(
                "w-full rounded-xl border p-4 text-left flex items-start gap-3 transition-all",
                objective === obj.value
                  ? "border-violet-700/60 bg-violet-700/10 dark:border-violet-500/60 dark:bg-violet-500/15 shadow-glow-emerald"
                  : "border-mist-200 bg-white hover:border-violet-700/30 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-violet-700/40"
              )}
            >
              <Target
                size={20}
                className={cn(
                  "mt-0.5 shrink-0",
                  objective === obj.value
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-mist-400"
                )}
              />
              <div>
                <div
                  className={cn(
                    "text-sm font-semibold",
                    objective === obj.value
                      ? "text-violet-700 dark:text-violet-200"
                      : "text-mist-600 dark:text-mist-200"
                  )}
                >
                  {obj.label}
                </div>
                <div className="text-xs text-mist-500 dark:text-mist-400 mt-0.5">
                  {obj.desc}
                </div>
              </div>
              {objective === obj.value && (
                <Check size={16} className="ml-auto mt-0.5 text-violet-700 dark:text-violet-300" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-mist-600 hover:bg-mist-100 dark:text-mist-200 dark:hover:bg-ink-850 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={step === 1 && !businessName.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Setting up…" : "Go to dashboard"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
