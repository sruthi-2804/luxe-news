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

### Phase 0 — Foundations (setup)
- [ ] Install Node.js
- [ ] Create the Next.js app, run it locally, see "Hello World" in the browser
- [ ] Put it on GitHub

### Phase 1 — Show hardcoded news (learn the frontend)
- [ ] Build the news page layout with 3-4 fake/sample articles
- [ ] Make it look like a real luxury magazine

### Phase 2 — The LLM curation engine (learn the backend + LLM)
- [ ] Get an OpenAI or Gemini API token from your father
- [ ] Write the backend job: web search -> send to Claude -> get curated articles
- [ ] Print the results to a terminal (no database yet)

### Phase 3 — Store & display real data
- [ ] Set up Supabase database
- [ ] Save curated articles to the database
- [ ] News page reads from the database instead of fake data

### Phase 4 — Automation
- [ ] Cron job runs the curation engine every 12 hours
- [ ] "Refresh now" button for on-demand updates

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

## Current status: Phase 0
