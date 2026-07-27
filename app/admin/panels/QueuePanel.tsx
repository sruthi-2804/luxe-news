"use client";

import { useState, useTransition } from "react";
import {
  approveStory,
  featureStory,
  rejectStory,
  approveAllPending,
  publishEdition,
} from "../actions";
import type { Article } from "../../lib/types";

const FILTERS = ["Pending", "Approved", "Featured", "Rejected", "All"] as const;
type Filter = (typeof FILTERS)[number];

export default function QueuePanel({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState<Filter>("Pending");
  const [isPending, startTransition] = useTransition();

  const pendingCount = articles.filter((a) => a.state === "pending").length;
  const approvedCount = articles.filter((a) => a.state === "approved").length;
  const rejectedCount = articles.filter((a) => a.state === "rejected").length;

  const visible = articles.filter((a) => {
    if (filter === "All") return true;
    return a.state === filter.toLowerCase();
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                filter === f
                  ? "bg-ink text-paper"
                  : "border border-line text-muted hover:border-line-strong"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-3 flex-nowrap">
          <button
            disabled={isPending}
            onClick={() => startTransition(() => approveAllPending())}
            className="rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink hover:border-ink transition-colors duration-200 disabled:opacity-50"
          >
            Approve all pending
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => publishEdition())}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium uppercase tracking-wider text-paper hover:opacity-[0.82] transition-opacity duration-200 disabled:opacity-50"
          >
            Publish edition
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-sm text-left w-full" style={{ minWidth: 1080 }}>
          <thead>
            <tr className="text-muted border-b border-line text-xs uppercase tracking-wider">
              <th className="pb-3 pr-4" style={{ width: 80 }}>
                Score
              </th>
              <th className="pb-3 pr-4">Title</th>
              <th className="pb-3 pr-4" style={{ width: 150 }}>
                Source
              </th>
              <th className="pb-3 pr-4" style={{ width: 110 }}>
                Category
              </th>
              <th className="pb-3 pr-4" style={{ width: 88 }}>
                State
              </th>
              <th className="pb-3" style={{ width: 200 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((article) => (
              <tr
                key={article.id}
                className={`border-b border-line align-top ${
                  article.state === "rejected" ? "opacity-40" : ""
                }`}
              >
                <td className="py-3 pr-4 font-mono text-[15px]">
                  <span
                    className={
                      (article.score ?? 0) < 0.7 ? "text-accent" : "text-ink"
                    }
                  >
                    {(article.score ?? 0).toFixed(2)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="text-ink font-medium">{article.title}</div>
                  <div className="text-muted text-xs mt-1 line-clamp-1">
                    {article.summary}
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted">{article.source}</td>
                <td className="py-3 pr-4 text-muted">{article.category}</td>
                <td className="py-3 pr-4 text-muted capitalize">
                  {article.state}
                </td>
                <td className="py-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => approveStory(article.id))
                      }
                      className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-ink transition-colors duration-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => featureStory(article.id))
                      }
                      className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-ink transition-colors duration-200 disabled:opacity-50"
                    >
                      Feature
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => rejectStory(article.id))
                      }
                      className="rounded-full border border-line px-3 py-1 text-xs text-accent hover:border-accent transition-colors duration-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-mono text-xs text-muted">
        {pendingCount} pending · {approvedCount} approved · {rejectedCount}{" "}
        rejected
      </p>
    </div>
  );
}
