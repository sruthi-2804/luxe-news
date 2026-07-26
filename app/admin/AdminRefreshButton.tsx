"use client";

import { useTransition } from "react";
import { refreshNow } from "./actions";

export default function AdminRefreshButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => refreshNow())}
      disabled={isPending}
      className="rounded bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50"
    >
      {isPending ? "Refreshing…" : "Refresh Now"}
    </button>
  );
}
