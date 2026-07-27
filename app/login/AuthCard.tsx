"use client";

import { useState } from "react";
import { signIn, signUp } from "./actions";

export default function AuthCard({
  error,
  message,
  refreshedAgo,
}: {
  error?: string;
  message?: string;
  refreshedAgo?: string | null;
}) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  const authTitle = tab === "signin" ? "Welcome back" : "Start reading";
  const authSub =
    tab === "signin"
      ? refreshedAgo
        ? `Your edition refreshed ${refreshedAgo}.`
        : "Sign in to read the latest edition."
      : "Every edition, open in full. No card required.";
  const authCta = tab === "signin" ? "Sign in" : "Create account";
  const authFoot =
    "Every edition open in full. Membership is optional — £12 a month if the desk earns it.";

  return (
    <div className="max-w-[380px] w-full">
      <div className="flex gap-0 border border-line rounded-full p-[3px] mb-9 w-fit">
        <button
          onClick={() => setTab("signin")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-opacity duration-200 ${
            tab === "signin" ? "bg-ink text-paper" : "text-muted"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setTab("signup")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-opacity duration-200 ${
            tab === "signup" ? "bg-ink text-paper" : "text-muted"
          }`}
        >
          Create account
        </button>
      </div>

      <h2 className="text-[30px] font-medium tracking-[-0.025em] leading-[1.1] mb-2 text-ink">
        {authTitle}
      </h2>
      <p className="text-sm leading-[1.55] text-muted mb-8">{authSub}</p>

      {error && (
        <p className="mb-5 text-sm text-accent border border-line rounded p-2">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-5 text-sm text-ink-soft border border-line rounded p-2">
          {message}
        </p>
      )}

      <form className="flex flex-col">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-muted mb-2">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full border border-line rounded-none px-[14px] py-[13px] text-[15px] text-ink outline-none mb-5 bg-transparent"
        />

        <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-muted mb-2">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full border border-line rounded-none px-[14px] py-[13px] text-[15px] text-ink outline-none mb-7 bg-transparent"
        />

        <button
          formAction={tab === "signin" ? signIn : signUp}
          className="w-full bg-ink text-paper rounded-full py-[15px] text-sm font-medium tracking-[0.01em] transition-opacity duration-200 hover:opacity-[0.82]"
        >
          {authCta}
        </button>
      </form>

      <p className="text-xs leading-[1.6] text-muted mt-7">{authFoot}</p>
      <p className="text-[11px] leading-[1.6] text-muted-soft mt-3.5 font-mono tracking-[0.04em]">
        supabase.auth · cookie session via @supabase/ssr
      </p>
    </div>
  );
}
