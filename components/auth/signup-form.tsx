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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      // (the local supabase/config.toml may say false — check the actual remote setting).
      // The "try signing in" hint below is opportunistic: it may unblock the user if
      // the project has double_confirm_changes = false, otherwise the login form
      // returns a clearer "email not confirmed" error.
      // Disable at: Supabase dashboard → Authentication → Providers → Email → Confirm email.
      if (!data?.session) {
        setError(
          `Account created! Please check your email for a confirmation link before continuing. If you don't see it, try signing in with the same credentials — your account may already be active.`
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

  return (
    <div className="rounded-2xl glass-card p-8 shadow-card-elevated dark:shadow-card-elevated-dark">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-mist-600 dark:text-mist-50">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-mist-600 dark:text-mist-300">
          Start growing every naira you spend on ads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-mist-600 dark:text-mist-200 mb-1.5"
          >
            Full name
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
            />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Adaeze Okafor"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-3 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500"
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
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="adaeze@lagosbites.com"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-3 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500"
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
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-mist-300 bg-white py-2.5 pl-10 pr-10 text-sm text-mist-600 placeholder:text-mist-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:bg-ink-900 dark:border-ink-700 dark:text-mist-100 dark:placeholder:text-mist-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-400 hover:text-mist-600 dark:hover:text-mist-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-700 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-mist-500 dark:text-mist-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
