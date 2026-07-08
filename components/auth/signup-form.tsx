"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { readSupabaseEnv, formatEnvError } from "@/lib/supabase/env";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsEmailConfirmation(false);
    setResendSent(false);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const env = readSupabaseEnv();
    if (!env.ok) {
      setError(formatEnvError(env));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Session is null when the remote Supabase project has "Confirm email" enabled
      // (Authentication → Providers → Email → Confirm email) — the local config.toml
      // may say false. The "try signing in" hint below is opportunistic: it works
      // if the project doesn't require double-confirming email changes, otherwise the
      // login form returns a clearer "email not confirmed" error.
      if (!data?.session) {
        setNeedsEmailConfirmation(true);
        setError(
          `Account created! Please check ${email} for a confirmation link before continuing (also check your spam folder). If you don't see it, try signing in to check if your account is already active.`
        );
        return;
      }

      // Redirect to onboarding to collect business details
      router.push("/onboarding");
    } catch (err) {
      // Surface the real error so it's debuggable
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSent(false);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setResendSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend confirmation email."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass-card shadow-card-elevated dark:shadow-card-elevated-dark p-6 sm:p-8 animate-fade-up hover-lift">
      <div className="text-center mb-7 sm:mb-8">
        <h1 className="text-2xl sm:text-[1.7rem] font-bold tracking-tight text-mist-600 dark:text-mist-50">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-mist-600 dark:text-mist-300">
          Start growing every naira you spend on ads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-600 dark:text-rose-400 space-y-2 animate-fade-up">
            <p>{error}</p>
            {needsEmailConfirmation && !resendSent && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="font-medium text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200 underline underline-offset-4 decoration-violet-400/60 hover:decoration-violet-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed tap-press touch-target"
              >
                {resendLoading ? "Sending…" : "↻ Resend confirmation email"}
              </button>
            )}
            {resendSent && (
              <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-fade-up">
                ✓ Confirmation email resent. Check your inbox and spam folder.
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-mist-600 dark:text-mist-200 mb-1.5"
          >
            Full name
          </label>
          <div className="relative focus-glow rounded-lg">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 pointer-events-none transition-colors"
            />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Adaeze Okafor"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-3 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500 touch-target"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-mist-600 dark:text-mist-200 mb-1.5"
          >
            Email
          </label>
          <div className="relative focus-glow rounded-lg">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 pointer-events-none transition-colors"
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="adaeze@lagosbites.com"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-3 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500 touch-target"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-mist-600 dark:text-mist-200 mb-1.5"
          >
            Password
          </label>
          <div className="relative focus-glow rounded-lg">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 pointer-events-none transition-colors"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-10 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500 touch-target"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-mist-400 hover:text-violet-600 dark:hover:text-violet-300 tap-press transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-700 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 shadow-glow-emerald hover:shadow-[0_0_50px_-5px_rgba(16,185,129,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 tap-press touch-target"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>

        <p className="text-center text-sm text-mist-500 dark:text-mist-400 pt-1">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200 transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
