# Luxe News — Project Roadmap

A curated luxury fashion news site. An LLM organizes fresh web-search results
into polished editorial content, refreshed every 12 hours or on demand.
Paying customers log in to read it. An admin page controls the system.

## Tech stack
- **Next.js** — frontend + backend in one framework
- **Supabase** — database + user login
- **OpenAI (GPT) or Google Gemini API** — the curation "brain" (LLM). Swappable — the rest of the system does not depend on which one.
- **OpenAI built-in web search** — the LLM searches the web itself, in the same call (no separate search service needed to start). A standalone search API (Tavily/Brave) can be added later if we want more control or switch LLMs.
- **Razorpay / Stripe** — payments
- **Vercel** — hosting + the 12-hour cron timer

## Build phases (each phase fully works before we start the next)

### Phase 0 — Foundations (setup) ✅ DONE
- [x] Install Node.js
- [x] Create the Next.js app, run it locally, see "Hello World" in the browser
- [x] Put it on GitHub

### Phase 1 — Show hardcoded news (learn the frontend) ✅ DONE
- [x] Build the news page layout with 3-4 fake/sample articles
- [x] Make it look like a real luxury magazine

### Phase 2 — The LLM curation engine (learn the backend + LLM) ✅ DONE
- [x] Get an OpenAI API token from your father
- [x] Write the backend job: web search -> OpenAI -> get curated articles as JSON
- [x] `/api/curate` endpoint returns curated articles

### Phase 3 — Store & display real data ✅ DONE
- [x] Set up Supabase database (articles table + RLS)
- [x] Save curated articles to the database
- [x] News page reads from the database instead of fake data

Known rough edges to fix in Phase 4: duplicate articles on repeated runs (no dedup/replace yet), messy `source` field (LLM includes raw markdown links).

### Phase 4 — Automation ✅ CODE DONE (blocked on OpenAI billing to fully test)
- [x] Fixed duplicates: each run now replaces old articles instead of piling up
- [x] Clean `source` (name only) + new `url` field for "Read full article" links
- [x] `/api/curate` protected with CRON_SECRET (no more open/unauthenticated endpoint)
- [x] "Refresh Now" button via a Server Action (temporary: publicly visible until Phase 5/6 adds admin-only gating)
- [x] `vercel.json` cron config written — set to once/day (Vercel Hobby tier limit; revisit at Phase 8 for true 12h cadence via Pro plan or an external cron service)
- [ ] Live end-to-end test of the button (blocked — OpenAI account credit balance is $0, needs funding)

### Phase 5 — User login
- [ ] Sign up / log in with Supabase
- [ ] Only logged-in users can see the curated page

### Phase 6 — Admin page
- [ ] Admin-only dashboard: trigger refresh, edit/delete articles, see users

### Phase 7 — Payments
- [ ] Razorpay/Stripe checkout
- [ ] Only paying users get access

### Phase 8 — Go live
- [ ] Deploy to Vercel (or your father's server)
- [ ] Custom domain

## Current status: Phase 4 code complete, blocked on OpenAI billing. Phase 5 (login) next.
