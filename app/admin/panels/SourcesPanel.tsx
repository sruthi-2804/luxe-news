"use client";

import { useState, useTransition } from "react";
import {
  updateTopics,
  savePrompt,
  toggleSourceAllowed,
  addSource,
  addBrandImage,
  removeBrandImage,
} from "../actions";

type Source = {
  domain: string;
  name: string | null;
  allowed: boolean | null;
  pick_count: number | null;
};

type BrandImage = { brand: string; image_url: string };

export default function SourcesPanel({
  topicsText,
  promptBody,
  sources,
  brandImages,
}: {
  topicsText: string;
  promptBody: string;
  sources: Source[];
  brandImages: BrandImage[];
}) {
  const [isRemoving, startRemoving] = useTransition();
  const [tab, setTab] = useState<"allowed" | "blocked">("allowed");
  const [isPending, startTransition] = useTransition();

  const visible = sources.filter((s) =>
    tab === "allowed" ? s.allowed !== false : s.allowed === false
  );

  return (
    <div className="grid grid-cols-2 gap-8" style={{ minWidth: 900 }}>
      <div className="flex flex-col gap-8">
        <section className="border border-line p-6">
          <h2 className="text-sm font-semibold text-ink mb-2 uppercase tracking-wider">
            Search topics
          </h2>
          <p className="text-xs text-muted mb-4">
            One topic per line — each becomes one web search query per run.
          </p>
          <form action={updateTopics} className="flex flex-col gap-3">
            <textarea
              name="topics"
              defaultValue={topicsText}
              rows={10}
              className="border border-line rounded px-3 py-2 text-sm text-ink font-mono"
            />
            <button
              type="submit"
              className="self-start rounded-full bg-ink text-paper px-4 py-2 text-xs font-medium uppercase tracking-wider hover:opacity-[0.82] transition-opacity duration-200"
            >
              Save topics
            </button>
          </form>
        </section>

        <section className="border border-line p-6">
          <h2 className="text-sm font-semibold text-ink mb-2 uppercase tracking-wider">
            Curation prompt
          </h2>
          <form action={savePrompt} className="flex flex-col gap-3">
            <textarea
              name="body"
              defaultValue={promptBody}
              style={{ minHeight: 230, whiteSpace: "pre-wrap" }}
              className="border border-line rounded px-4 py-4 text-xs leading-[1.7] text-ink font-mono"
            />
            <button
              type="submit"
              className="self-start rounded-full bg-ink text-paper px-4 py-2 text-xs font-medium uppercase tracking-wider hover:opacity-[0.82] transition-opacity duration-200"
            >
              Save prompt
            </button>
          </form>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {(["allowed", "blocked"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                tab === t
                  ? "bg-ink text-paper"
                  : "border border-line text-muted hover:border-line-strong"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="border border-line divide-y divide-line">
          {visible.length === 0 && (
            <p className="p-4 text-sm text-muted">No sources yet.</p>
          )}
          {visible.map((s) => (
            <div
              key={s.domain}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm text-ink truncate">
                  {s.name ?? s.domain}
                </div>
                <div className="text-xs text-muted font-mono truncate">
                  {s.domain}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted font-mono">
                  {s.pick_count ?? 0}
                </span>
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() =>
                      toggleSourceAllowed(s.domain, !(s.allowed !== false))
                    )
                  }
                  className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-ink transition-colors duration-200 disabled:opacity-50"
                >
                  {s.allowed !== false ? "Block" : "Allow"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <form action={addSource} className="flex items-center gap-2">
          <input
            type="text"
            name="domain"
            placeholder="domain.com"
            required
            className="border border-line rounded px-3 py-2 text-sm text-ink placeholder:text-muted-soft flex-1"
          />
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink hover:border-ink transition-colors duration-200"
          >
            Add source
          </button>
        </form>

        <div className="mt-9 pt-[26px] border-t border-line">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted mb-2">
            Brand pictures
          </p>
          <p className="text-xs text-muted mb-4">
            Rung two of the picture ladder — used when a story has no image of
            its own but names one of these brands. Add only images you have
            rights to use; the card credits it as &quot;File picture&quot;.
          </p>
          <div className="border border-line divide-y divide-line mb-3">
            {brandImages.length === 0 && (
              <p className="p-4 text-sm text-muted">No brand pictures yet.</p>
            )}
            {brandImages.map((b) => (
              <div
                key={b.brand}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink">{b.brand}</div>
                  <div className="text-xs text-muted truncate">
                    {b.image_url}
                  </div>
                </div>
                <button
                  disabled={isRemoving}
                  onClick={() =>
                    startRemoving(() => removeBrandImage(b.brand))
                  }
                  className="rounded-full border border-line px-3 py-1 text-xs text-accent hover:border-accent transition-colors duration-200 disabled:opacity-50 shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <form action={addBrandImage} className="flex flex-col gap-2">
            <input
              type="text"
              name="brand"
              placeholder="Brand name, e.g. Chanel"
              required
              className="border border-line rounded px-3 py-2 text-sm text-ink placeholder:text-muted-soft"
            />
            <div className="flex items-center gap-2">
              <input
                type="url"
                name="image_url"
                placeholder="https://…"
                required
                className="border border-line rounded px-3 py-2 text-sm text-ink placeholder:text-muted-soft flex-1"
              />
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink hover:border-ink transition-colors duration-200 whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
