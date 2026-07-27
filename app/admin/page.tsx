import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { DEFAULT_SYSTEM_PROMPT } from "../lib/providers/types";
import AdminShell from "./AdminShell";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select(
      "active_provider, topics, recency_hours, auto_publish, stories_per_edition"
    )
    .eq("id", 1)
    .single();

  const { data: billing } = await supabaseAdmin
    .from("billing_state")
    .select("credit_balance_usd")
    .eq("id", 1)
    .single();

  const { data: runs } = await supabaseAdmin
    .from("api_usage")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: readers } = await supabaseAdmin
    .from("profiles")
    .select("email, is_admin, created_at")
    .order("created_at", { ascending: false });

  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  const { data: sources } = await supabaseAdmin
    .from("sources")
    .select("domain, name, allowed, pick_count")
    .order("pick_count", { ascending: false });

  const { data: promptRow } = await supabaseAdmin
    .from("prompts")
    .select("body")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const { data: brandImages } = await supabaseAdmin
    .from("brand_images")
    .select("brand, image_url")
    .order("brand", { ascending: true });

  const balance = billing?.credit_balance_usd ?? 0;
  const topicsText = (settings?.topics ?? []).join("\n");
  const promptBody = promptRow?.body ?? DEFAULT_SYSTEM_PROMPT;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const costToday = (runs ?? [])
    .filter((r) => new Date(r.created_at) >= startOfToday && !r.error)
    .reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);

  const lastRunAt = (runs ?? []).find((r) => !r.error)?.created_at ?? null;

  return (
    <AdminShell
      balance={balance}
      settings={settings ?? null}
      articles={articles ?? []}
      topicsText={topicsText}
      promptBody={promptBody}
      sources={sources ?? []}
      brandImages={brandImages ?? []}
      readers={readers ?? []}
      runs={runs ?? []}
      costToday={costToday}
      lastRunAt={lastRunAt}
    />
  );
}
