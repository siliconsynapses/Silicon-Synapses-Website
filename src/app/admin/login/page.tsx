"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        // Deliberately vague — do not reveal whether the email exists.
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      {/* Ambient circuit backdrop */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            ← Back to site
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
            <span className="text-gradient-accent">Silicon Synapses</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Admin console</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/80 p-6 shadow-2xl backdrop-blur sm:p-8">
          <h2 className="text-lg font-semibold text-white">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">Authorized club staff only.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="you@college.edu"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Protected area · access is logged
        </p>
      </div>
    </div>
  );
}
