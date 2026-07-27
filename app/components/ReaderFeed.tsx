"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS } from "../lib/providers/types";
import type { Article } from "../lib/types";

type FeedArticle = Article & { editionNo: string };

const FILTERS = ["All", ...SECTIONS] as const;

function formatTime(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReaderFeed({
  articles,
  leadId,
  editionLabel,
  editionStamp,
  nextRunLine,
}: {
  articles: FeedArticle[];
  leadId: number | null;
  editionLabel: string;
  editionStamp: string;
  nextRunLine: string;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const router = useRouter();

  if (articles.length === 0) {
    return (
      <main className="max-w-[1440px] mx-auto px-14 py-24">
        <p className="text-muted">
          No edition has been published yet — check back soon.
        </p>
      </main>
    );
  }

  const matchSection = (value: string | null) =>
    SECTIONS.find((s) => s.toLowerCase() === value?.trim().toLowerCase()) ??
    null;

  const lead = articles.find((a) => a.id === leadId) ?? null;
  const rest = articles.filter((a) => a.id !== leadId);
  const showLead = filter === "All";
  const visibleCats = filter === "All" ? SECTIONS : [filter];
  const source = filter === "All" ? rest : articles;

  const groups: { name: string; items: FeedArticle[] }[] = visibleCats
    .map((section) => ({
      name: section,
      items: source.filter((a) => matchSection(a.section) === section),
    }))
    .filter((g) => g.items.length > 0);

  // Safety net: a story whose section didn't match any known category
  // (an older row, or a model that ignored the enum) still shows up here
  // rather than silently vanishing from the edition.
  if (filter === "All") {
    const leftover = rest.filter((a) => !matchSection(a.section));
    if (leftover.length > 0) groups.push({ name: "More", items: leftover });
  }

  return (
    <main className="max-w-[1440px] mx-auto px-14 pb-[72px]">
      <div className="py-[26px] border-b border-line flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <span className="text-[13px] font-semibold tracking-[0.16em] uppercase whitespace-nowrap">
            {editionLabel}
          </span>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] whitespace-nowrap transition-all duration-200 ${
                  filter === f
                    ? "bg-ink text-paper border border-ink"
                    : "bg-paper text-muted border border-line"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <span className="font-mono text-xs tracking-[0.04em] text-muted">
          {editionStamp}
        </span>
      </div>

      {showLead && lead && (
        <article
          onClick={() => router.push(`/story/${lead.id}`)}
          className="cursor-pointer py-12"
        >
          {/* A substituted picture never runs as the lead's full-bleed image —
              only the story's own picture earns that weight. */}
          {lead.image_kind === "own" && lead.image_url && (
            <figure className="w-full mb-10">
              <div className="w-full aspect-[21/9] bg-paper-alt overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lead.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {lead.image_credit && (
                <figcaption className="text-[11px] uppercase tracking-[0.08em] text-muted pt-2.5">
                  {lead.image_credit}
                </figcaption>
              )}
            </figure>
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-24 items-start">
            <div>
              <div className="flex items-baseline gap-3.5 mb-[22px]">
                <span className="font-mono text-xs text-accent">01</span>
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted">
                  {lead.category}
                </span>
              </div>
              <h1 className="font-sans text-[clamp(32px,3.4vw,56px)] leading-[1.05] tracking-[-0.03em] font-semibold max-w-[22ch] text-balance">
                {lead.title}
              </h1>
              <p className="text-[clamp(19px,1.6vw,24px)] leading-[1.5] text-muted mt-9 max-w-[44ch]">
                {lead.summary}
              </p>
              <div className="flex items-center gap-3.5 mt-[30px]">
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase">
                  {lead.source}
                </span>
                <span className="text-line-strong">·</span>
                <span className="font-mono text-xs text-muted">
                  {formatTime(lead.published_at)}
                </span>
                <span className="text-line-strong">·</span>
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-accent">
                  Read
                </span>
              </div>
            </div>
            {lead.why_it_matters && (
              <aside className="border-l border-line pl-8">
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted mb-4">
                  Why it matters
                </p>
                <p className="text-[15px] leading-[1.62] text-ink-soft">
                  {lead.why_it_matters}
                </p>
              </aside>
            )}
          </div>
        </article>
      )}

      {groups.map((group) => (
        <section key={group.name} className="pt-14 pb-2">
          <div className="grid grid-cols-3 gap-10 items-baseline mb-[22px]">
            <h2 className="font-sans text-[13px] font-semibold tracking-[0.16em] uppercase">
              {group.name}
            </h2>
            <span />
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted text-right">
              {group.items.length}{" "}
              {group.items.length === 1 ? "story" : "stories"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-x-10 gap-y-14">
            {group.items.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/story/${item.id}`)}
                className="bg-paper border-t border-ink pt-[22px] flex flex-col cursor-pointer"
              >
                {item.image_kind && item.image_url && (
                  <>
                    <div className="w-full aspect-[4/3] bg-paper-alt overflow-hidden mb-[18px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {item.image_credit && (
                      <p className="text-[10px] uppercase tracking-[0.08em] text-muted -mt-2.5 mb-4">
                        {item.image_credit}
                      </p>
                    )}
                  </>
                )}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-[11px] text-accent">
                    {item.editionNo}
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-sans text-[21px] leading-[1.2] tracking-[-0.025em] font-semibold mb-3 text-pretty">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-[1.55] text-muted mb-5 text-pretty">
                  {item.summary}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap mt-auto">
                  <span className="text-[11px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
                    {item.source}
                  </span>
                  <span className="text-line-strong">·</span>
                  <span className="font-mono text-[11px] text-muted whitespace-nowrap">
                    {formatTime(item.published_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="bg-ink text-paper px-20 py-24 grid grid-cols-[minmax(0,1fr)_340px] gap-[120px] items-center mt-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-dark-muted mb-6">
            Open to every reader
          </p>
          <h2 className="font-sans text-[clamp(38px,3.6vw,62px)] leading-[0.94] tracking-[-0.04em] font-semibold max-w-[19ch]">
            Read it all. Support it if it earns it
            <span className="text-paper">.</span>
          </h2>
          <p className="text-lg leading-[1.6] text-dark-muted mt-7 max-w-[58ch]">
            Every story is open — no meter, no gate. Membership adds the
            evening briefing by email, the full archive and search, and keeps
            the desk running.
          </p>
        </div>
        <div className="border border-dark-line p-9">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-[52px] font-semibold tracking-[-0.04em] leading-none">
              £12
            </span>
            <span className="text-sm text-dark-muted">/ month</span>
          </div>
          <div className="h-px bg-dark-line my-7" />
          <div className="flex flex-col gap-3 text-sm leading-[1.5] text-dark-muted">
            <span>Evening briefing by email</span>
            <span>Full archive and search</span>
            <span>Priority on requested topics</span>
          </div>
          <button className="w-full mt-8 bg-paper text-ink rounded-full py-[15px] text-sm font-medium hover:opacity-[0.88] transition-opacity duration-200">
            Become a member
          </button>
        </div>
      </section>

      <footer className="border-t border-line mt-[88px] pt-8 flex items-baseline justify-between text-xs text-muted">
        <span>Luxe News — curated luxury fashion, twice daily.</span>
        <span className="font-mono tracking-[0.04em]">{nextRunLine}</span>
      </footer>
    </main>
  );
}
