"use client";

import { useTransition } from "react";
import { refreshArticles } from "../actions";

export default function RefreshButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => refreshArticles())}
      disabled={isPending}
      className="rounded-full bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Refreshing…" : "Refresh Now"}
    </button>
  );
}
