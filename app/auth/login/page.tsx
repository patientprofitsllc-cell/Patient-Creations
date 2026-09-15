"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/portal/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 pb-28 pt-40">
        <h1 className="font-display text-3xl text-ice">Sign in</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label htmlFor="login-email" className="sr-only">Email</label>
          <input
            id="login-email"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="login-password" className="sr-only">Password</label>
          <input
            id="login-password"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-ice placeholder:text-ice/30"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium tracking-wide text-obsidian transition hover:brightness-110 disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-sm text-ice/40">
          No account yet? Purchasing a service in <a href="/services" className="text-gold">Services</a> creates one automatically.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
