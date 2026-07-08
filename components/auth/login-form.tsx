"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { readSupabaseEnv, formatEnvError } from "@/lib/supabase/env";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const env = readSupabaseEnv();
    if (!env.ok) {
      setError(formatEnvError(env));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      // Surface the real error so it's debuggable — not just an opaque "unexpected".
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass-card shadow-card-elevated dark:shadow-card-elevated-dark p-6 sm:p-8 animate-fade-up hover-lift">
      <div className="text-center mb-7 sm:mb-8">
        <h1 className="text-2xl sm:text-[1.7rem] font-bold tracking-tight text-mist-600 dark:text-mist-50">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-mist-600 dark:text-mist-300">
          Sign in to your GrowthAds dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-600 dark:text-rose-400 animate-fade-up">
            {error}
          </div>
        )}

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
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-10 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 touch-target"
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
          className="w-full rounded-lg bg-violet-700 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 shadow-glow-emerald hover:shadow-[0_0_50px_-5px_rgba(16,185,129,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 tap-press touch-target relative overflow-hidden"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>

        <p className="text-center text-sm text-mist-500 dark:text-mist-400 pt-1">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200 transition-colors duration-200"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
