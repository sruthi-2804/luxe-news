# Luxe News

An auto-curated luxury-fashion publication. An LLM runs web searches across a set of
fashion topics and returns structured story objects; the backend filters, ranks and
illustrates them, then files them into a review queue. An editor approves stories and
publishes an edition; readers see that edition as a single editorial feed.

The point of the project is the **pipeline between "a model searched the web" and
"this is publishable"** — the filtering, the picture sourcing, the approval gate, and
the cost accounting that makes the whole thing affordable to run.

- **Stack:** Next.js 16 (App Router, React 19), TypeScript, Tailwind 4, Supabase
  (Postgres + Auth + Storage), deployed on Vercel.
- **Providers:** OpenAI, Anthropic and Gemini are interchangeable behind one interface;
  the active one is switched from the admin UI.
- **Sections:** Runway, Retail & Openings, Business, Creative Leadership.

## How a story gets published

```
cron (06:00 UTC)  ─┐
                   ├─→ runCuration() ─→ filter ─→ rank ─→ illustrate ─→ queue (pending)
admin "Refresh"   ─┘                                                       │
                                                                           ▼
                                                      approve / feature ─→ publishEdition()
                                                                           │
                                                                           ▼
                                                                     reader feed at /
```

`runCuration()` ([app/lib/curate.ts](app/lib/curate.ts)) runs these stages:

1. **Load config** — provider, topic list, recency window (default 36 h), stories per
   edition (default 10), from the `app_settings` singleton row.
2. **Balance gate** — abort if the tracked credit balance is under \$0.50, recording a
   failed run rather than silently spending.
3. **Fan out** — one provider call per topic, in parallel. Each returns stories against
   a strict JSON schema: title, dek, kicker, section, source, URL, why-it-matters,
   three bullet points, and a 0–1 score.
4. **Filter.** Five passes, each one there because the model doesn't reliably obey the
   prompt: dedupe by title, drop non-English (CJK/kana/Hangul/Arabic/Cyrillic), drop
   anything outside the recency window or with an unparseable date, drop blocked
   domains, then clamp the fields that come back out of range.
5. **Rank** by score, keep the top N.
6. **Illustrate** — the picture ladder, below.
7. **Settle cost** — compute spend, decrement the balance, write the ledger row.
8. **Insert** as `pending`. If auto-publish is on, approve and publish immediately;
   by default every story waits for review.

### The picture ladder

Licensed fashion photography is the hard part of a project like this. The compromise
([app/lib/images/resolveImage.ts](app/lib/images/resolveImage.ts)) is to try, in order:

1. the article's own `og:image`, re-hosted in Supabase Storage;
2. a cached image for that brand from a previous run;
3. an image on the brand's **own official domain**, found by the LLM and validated by
   checking the hostname actually contains the brand name — then cached, so each brand
   is searched at most once ever;
4. a generic SVG for the section;
5. nothing.

Re-hosting rejects non-image content types and anything over 8 MB.

### Publishing an edition

`publishEdition()` retires the previous edition by moving its stories to `rejected`,
then stamps every approved story that has no label yet with `Edition — <date>`. The
public site therefore shows exactly one edition at a time, and retirement is a state
change rather than a delete, so nothing is lost.

## Cost accounting

Each run writes one row to `api_usage` and decrements a balance. The part that is easy
to get wrong, and that this tracks explicitly, is that **web-search tool calls are
billed separately from tokens**:

```
cost = input_tokens/1e6 × input_price
     + output_tokens/1e6 × output_price
     + tool_calls × web_search_cost_per_call
```

Search calls run roughly \$10 per 1,000 for OpenAI and Anthropic, and \$14 per 1,000
grounded queries for Gemini. With 10 topics plus up to one brand-image search per kept
story, a run can make 20-odd search calls — so at default settings the search fees
dominate the token cost, not the other way round. Each provider reports its tool-call
count in a different place, so counting it is per-provider work.

The ledger records tokens in and out, provider, cost, balance after, trigger
(`cron`/`manual`), how many stories were found, and how many survived filtering. The
admin surfaces balance, spend today, per-run history, and average cost per run.

The balance is a **hand-entered bookkeeping figure**, not a reading from any provider's
billing API. It is there to stop a runaway loop, not to reconcile an invoice.

## Running it

```bash
npm install
cp .env.local.example .env.local   # then add the rest of the variables below
npm run dev                        # http://localhost:3000
```

Environment variables:

| Variable | For |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser/server client (respects RLS) |
| `SUPABASE_SECRET_KEY` | service-role client; **bypasses RLS** |
| `OPENAI_API_KEY` | OpenAI provider |
| `ANTHROPIC_API_KEY` | Anthropic provider |
| `GEMINI_API_KEY` | Gemini provider |
| `CRON_SECRET` | bearer token the cron route checks |

You only need the key for the provider you actually select. `.env.local.example`
currently lists only the two Supabase variables.

**You also need the database.** There are no migrations in this repo — the schema has
to be created by hand in Supabase. From the queries in the code, that is eight tables
(`articles`, `app_settings`, `billing_state`, `api_usage`, `prompts`, `sources`,
`brand_images`, `profiles`), a storage bucket `article-images`, singleton rows with
`id = 1` in `app_settings` and `billing_state`, and a `profiles` row with
`is_admin = true` for your user before `/admin` will let you in. This is the single
biggest obstacle to standing the project up fresh, and it should be fixed by committing
the SQL.

Deployment is Vercel. `vercel.json` contains nothing but the cron declaration.

## Known limitations

These are real and listed deliberately rather than left to be discovered.

- **The paywall is decorative.** `ScrollGate` shows a modal at 60 % scroll and sets
  `body.overflow = hidden` client-side; the content is already in the HTML, so it is
  bypassed trivially. The membership button has no handler. Payments are unbuilt.
- **Cron runs once a day, not twice.** The Vercel Hobby plan allows one cron run per
  day, so the schedule is `0 6 * * *`. Some UI copy still says "refreshed every 12
  hours", and the cost projection still assumes two runs a day. Real 12-hour cadence
  needs Vercel Pro or an external scheduler.
- **No schema in the repo** (above).
- **Unrecognised sections are silently filed under the last section in the list**
  rather than dropped — a quiet mis-categorisation.
- **The `og:image` scrape is a regex over raw HTML.** It misses JS-rendered pages, and
  the `LuxeNewsBot/1.0` user agent will be blocked by some publishers.
- **Gemini's usage field names are guessed.** The code tries several spellings and logs
  the raw object; its cost figures are unverified until those are confirmed.
- **`api_usage.model` stores the provider name, not the model id**, so the exact model
  behind a given run isn't recoverable from the ledger.
- **Rejected articles are never deleted** and accumulate.
- **No tests.**
- Session refresh lives in `proxy.ts` — Next.js 16's rename of `middleware.ts`. Easy to
  miss when looking for it.

`ROADMAP.md` is also stale: it reports phases 5 and 6 as upcoming when both have
shipped. Genuinely outstanding are payments and go-live.

## How this was built

I designed the pipeline, chose the filtering and the picture-ladder strategy, worked
out the cost model including the separately-billed search calls, and made the product
decisions. An AI assistant (Claude Code) was used for implementation and for drafting
this README — `AGENTS.md` in this repo is an instruction to it. The limitations above
are things I found by reading the result rather than assuming it was correct.
