import Link from "next/link";
import SignOutButton from "./components/SignOutButton";
import ScrollGate from "./components/ScrollGate";
import ReaderFeed from "./components/ReaderFeed";
import { createClient } from "./lib/supabase/server";
import { supabaseAdmin } from "./lib/supabaseAdmin";
import { SECTIONS } from "./lib/providers/types";
import { relativeTime } from "./lib/relativeTime";
import type { Article } from "./lib/types";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  const { data: published } = await supabase
    .from("articles")
    .select("*")
    .in("state", ["approved", "featured"])
    .order("score", { ascending: false });

  const { data: lastRun } = await supabaseAdmin
    .from("api_usage")
    .select("created_at")
    .is("error", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const freshness = lastRun
    ? `Updated ${relativeTime(lastRun.created_at)}`
    : "Awaiting first edition";

  const articles: Article[] = published ?? [];
  const editionLabel = articles[0]?.edition_label ?? "Latest edition";
  const sourceCount = new Set(articles.map((a) => a.source)).size;

  const lead =
    articles.find((a) => a.state === "featured") ?? articles[0] ?? null;

  const matchSection = (value: string | null) =>
    SECTIONS.find((s) => s.toLowerCase() === value?.trim().toLowerCase()) ??
    null;

  const withNumerals: (Article & { editionNo: string })[] = [];
  if (lead) {
    withNumerals.push({ ...lead, editionNo: "01" });
    const rest = articles.filter((a) => a.id !== lead.id);
    let n = 1;
    for (const section of SECTIONS) {
      for (const article of rest.filter(
        (a) => matchSection(a.section) === section
      )) {
        n += 1;
        withNumerals.push({
          ...article,
          editionNo: (n < 10 ? "0" : "") + n,
        });
      }
    }
    for (const article of rest.filter((a) => !matchSection(a.section))) {
      n += 1;
      withNumerals.push({ ...article, editionNo: (n < 10 ? "0" : "") + n });
    }
  }

  return (
    <ScrollGate isLoggedIn={!!user}>
      <div className="min-h-screen bg-paper">
        <header className="border-t-[3px] border-ink border-b border-line">
          <div className="max-w-[1440px] mx-auto px-14 h-28 grid grid-cols-[1fr_auto_1fr] items-center gap-10">
            <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted whitespace-nowrap">
              {freshness}
            </div>
            <Link href="/" className="text-center">
              <div className="text-[34px] font-bold tracking-[-0.045em] leading-none">
                LUXE NEWS
              </div>
            </Link>
            <div className="flex items-center justify-end gap-6 whitespace-nowrap">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted hover:text-ink"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <>
                  <div className="w-px h-4 bg-line" />
                  <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted">
                    Reader
                  </span>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-muted underline underline-offset-4"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <ReaderFeed
          articles={withNumerals}
          leadId={lead?.id ?? null}
          editionLabel={editionLabel}
          editionStamp={`${articles.length} ${
            articles.length === 1 ? "story" : "stories"
          } · ${sourceCount} sources`}
          nextRunLine={freshness}
        />
      </div>
    </ScrollGate>
  );
}
