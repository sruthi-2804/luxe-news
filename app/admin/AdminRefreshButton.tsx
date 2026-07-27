"use client";

import { useTransition } from "react";
import { refreshNow } from "./actions";

export default function AdminRefreshButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => refreshNow())}
      disabled={isPending}
      className={
        isPending
          ? "rounded-full bg-paper border border-line-strong text-muted px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-not-allowed"
          : "rounded-full bg-ink text-paper px-5 py-2.5 text-xs font-medium uppercase tracking-wider hover:opacity-[0.82] transition-opacity duration-200"
      }
    >
      {isPending ? "Running…" : "Run curation now"}
    </button>
  );
}
