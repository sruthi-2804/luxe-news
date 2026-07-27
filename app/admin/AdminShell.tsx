"use client";

import { useState } from "react";
import Link from "next/link";
import AdminRefreshButton from "./AdminRefreshButton";
import RunsPanel from "./panels/RunsPanel";
import QueuePanel from "./panels/QueuePanel";
import SourcesPanel from "./panels/SourcesPanel";
import ReadersPanel from "./panels/ReadersPanel";
import HistoryPanel from "./panels/HistoryPanel";
import type { Article } from "../lib/types";

const TABS = [
  { id: "runs", label: "Runs & schedule" },
  { id: "queue", label: "Story queue" },
  { id: "sources", label: "Sources & prompt" },
  { id: "readers", label: "Readers" },
  { id: "history", label: "Run history" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Settings = {
  active_provider: string;
  recency_hours: number | null;
  stories_per_edition: number | null;
  auto_publish: boolean | null;
};

type Reader = { email: string; is_admin: boolean | null; created_at: string };

type Source = {
  domain: string;
  name: string | null;
  allowed: boolean | null;
  pick_count: number | null;
};

type Run = {
  id: number;
  created_at: string;
  trigger: string | null;
  found_count: number | null;
  kept_count: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  error: string | null;
};

type BrandImage = { brand: string; image_url: string };

export default function AdminShell({
  balance,
  settings,
  articles,
  topicsText,
  promptBody,
  sources,
  brandImages,
  readers,
  runs,
  costToday,
  lastRunAt,
}: {
  balance: number;
  settings: Settings | null;
  articles: Article[];
  topicsText: string;
  promptBody: string;
  sources: Source[];
  brandImages: BrandImage[];
  readers: Reader[];
  runs: Run[];
  costToday: number;
  lastRunAt: string | null;
}) {
  const [tab, setTab] = useState<TabId>("runs");
  const pendingCount = articles.filter((a) => a.state === "pending").length;

  const subtitle: Record<TabId, string> = {
    runs: "Pipeline health, schedule, and model spend.",
    queue: "Review what the desk found before it goes live.",
    sources: "Topics, the curation prompt, and which domains are trusted.",
    readers: "Everyone with an account.",
    history: "Every run, cost, and outcome.",
  };

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: "248px 1fr" }}>
      <aside className="bg-ink text-paper py-8 px-6 flex flex-col sticky top-0 h-screen">
        <div>
          <div className="text-lg font-bold tracking-[-0.045em] text-paper">
            LUXE NEWS
          </div>
          <div className="text-[10px] uppercase tracking-wider text-accent mt-1">
            Control room
          </div>
        </div>

        <nav className="flex flex-col mt-10 gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-left text-sm px-3.5 py-2.5 transition-colors duration-200 border-l-2 ${
                tab === t.id
                  ? "bg-paper/[0.08] text-paper border-accent"
                  : "text-dark-muted border-transparent hover:text-paper"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-[22px] border-t border-dark-line">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-dark-muted mb-1.5">
              Balance
            </p>
            <p className="font-mono text-[15px] text-paper">
              ${balance.toFixed(2)}
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-dark-muted hover:text-paper underline underline-offset-4 transition-colors duration-200"
          >
            View public site
          </Link>
        </div>
      </aside>

      <div className="flex flex-col">
        <header
          className="sticky top-0 bg-paper border-b border-line flex items-center justify-between px-12 z-10"
          style={{ height: 88 }}
        >
          <div>
            <h1 className="text-[22px] font-medium text-ink">
              {TABS.find((t) => t.id === tab)?.label}
            </h1>
            <p className="text-xs text-muted mt-0.5">{subtitle[tab]}</p>
          </div>
          <AdminRefreshButton />
        </header>

        <main className="px-12 py-10 flex-1 overflow-x-auto">
          {tab === "runs" && (
            <RunsPanel
              settings={settings}
              balance={balance}
              pendingCount={pendingCount}
              costToday={costToday}
              readerCount={readers.length}
              lastRunAt={lastRunAt}
            />
          )}
          {tab === "queue" && <QueuePanel articles={articles} />}
          {tab === "sources" && (
            <SourcesPanel
              topicsText={topicsText}
              promptBody={promptBody}
              sources={sources}
              brandImages={brandImages}
            />
          )}
          {tab === "readers" && <ReadersPanel readers={readers} />}
          {tab === "history" && <HistoryPanel runs={runs} />}
        </main>
      </div>
    </div>
  );
}
