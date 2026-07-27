import { supabaseAdmin } from "./supabaseAdmin";
import {
  TOPICS as DEFAULT_TOPICS,
  DEFAULT_SYSTEM_PROMPT,
  SECTIONS,
  type CuratedArticle,
} from "./providers/types";
import * as openaiProvider from "./providers/openai";
import * as claudeProvider from "./providers/claude";
import * as geminiProvider from "./providers/gemini";
import { resolveImages } from "./images/resolveImage";

const PROVIDERS = {
  openai: openaiProvider,
  claude: claudeProvider,
  gemini: geminiProvider,
} as const;

type ProviderName = keyof typeof PROVIDERS;

export const MIN_BALANCE_USD = 0.5;

async function logFailedRun(
  providerName: string,
  balance: number,
  message: string,
  trigger: "manual" | "cron"
) {
  console.error("[curate] run failed:", message);
  await supabaseAdmin.from("api_usage").insert({
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    model: providerName,
    provider: providerName,
    cost_usd: 0,
    balance_after: balance,
    error: message,
    trigger,
  });
}

// The model doesn't always return the section string byte-for-byte, even
// with an enum in the schema — match case/whitespace-insensitively rather
// than silently dropping the story from every grouped section.
function normalizeSection(raw: string): string {
  const match = SECTIONS.find(
    (s) => s.toLowerCase() === raw?.trim().toLowerCase()
  );
  return match ?? SECTIONS[SECTIONS.length - 1];
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function trackSource(domainSource: string, url: string) {
  const domain = getDomain(url);
  if (!domain) return;

  const { data: existing } = await supabaseAdmin
    .from("sources")
    .select("pick_count")
    .eq("domain", domain)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("sources")
      .update({ pick_count: (existing.pick_count ?? 0) + 1 })
      .eq("domain", domain);
  } else {
    await supabaseAdmin
      .from("sources")
      .insert({ domain, name: domainSource, allowed: true, pick_count: 1 });
  }
}

export async function publishEdition() {
  // Retire whatever was live in the previous edition
  await supabaseAdmin
    .from("articles")
    .update({ state: "rejected" })
    .in("state", ["approved", "featured"])
    .not("edition_label", "is", null);

  const label = `Edition — ${new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}`;

  await supabaseAdmin
    .from("articles")
    .update({ edition_label: label })
    .in("state", ["approved", "featured"])
    .is("edition_label", null);
}

export async function runCuration(trigger: "manual" | "cron" = "manual") {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select(
      "active_provider, topics, recency_hours, auto_publish, stories_per_edition"
    )
    .eq("id", 1)
    .single();

  const providerName = (settings?.active_provider ?? "openai") as ProviderName;
  const provider = PROVIDERS[providerName];
  const topics: string[] =
    settings?.topics && settings.topics.length > 0
      ? settings.topics
      : DEFAULT_TOPICS;
  const recencyHours = settings?.recency_hours ?? 36;
  const storiesPerEdition = settings?.stories_per_edition ?? 10;

  const { data: blockedSources } = await supabaseAdmin
    .from("sources")
    .select("domain")
    .eq("allowed", false);
  const blockedDomains = new Set(blockedSources?.map((s) => s.domain) ?? []);

  const { data: promptRow } = await supabaseAdmin
    .from("prompts")
    .select("body")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const systemPrompt = promptRow?.body ?? DEFAULT_SYSTEM_PROMPT;

  const { data: billingBefore } = await supabaseAdmin
    .from("billing_state")
    .select("credit_balance_usd")
    .eq("id", 1)
    .single();

  const currentBalance = billingBefore?.credit_balance_usd ?? 0;

  if (currentBalance < MIN_BALANCE_USD) {
    const message = `Refresh blocked: balance ($${currentBalance.toFixed(
      2
    )}) is below the minimum threshold ($${MIN_BALANCE_USD.toFixed(2)})`;
    await logFailedRun(providerName, currentBalance, message, trigger);
    throw new Error(message);
  }

  try {
    const results = await Promise.all(
      topics.map((topic) => provider.searchTopic(topic, systemPrompt))
    );

    let inputTokens = 0;
    let outputTokens = 0;
    const allArticles: CuratedArticle[] = [];

    for (const result of results) {
      inputTokens += result.inputTokens;
      outputTokens += result.outputTokens;
      allArticles.push(...result.articles);
    }

    // Dedupe: topic searches can overlap on the same story
    const seenTitles = new Set<string>();
    const deduped = allArticles.filter((article) => {
      const key = article.title.trim().toLowerCase();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });

    // The model doesn't always obey "English only" strictly, so enforce it here too.
    // Matches CJK, Japanese kana, Hangul, Arabic, and Cyrillic script characters.
    const nonEnglishScript = /[一-鿿぀-ヿ가-힯؀-ۿЀ-ӿ]/;

    const englishOnly = deduped.filter((article) => {
      const text = `${article.title} ${article.summary} ${article.source}`;
      return !nonEnglishScript.test(text);
    });

    // The model doesn't always obey the recency window strictly, so enforce it here too
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - recencyHours);

    const freshArticles = englishOnly.filter((article) => {
      const publishedDate = new Date(article.published_at);
      return !isNaN(publishedDate.getTime()) && publishedDate >= cutoff;
    });

    // Drop anything from a domain the admin has blocked in Sources & prompt
    const allowedArticles = freshArticles.filter((article) => {
      const domain = article.url ? getDomain(article.url) : null;
      return !domain || !blockedDomains.has(domain);
    });

    // Guard against the model returning != 3 points, since we can't enforce
    // that in the JSON schema across all three providers
    const normalized = allowedArticles.map((article) => ({
      ...article,
      three_points: (article.three_points ?? []).slice(0, 3),
      score: Math.max(0, Math.min(1, article.score ?? 0.7)),
      section: normalizeSection(article.section),
    }));

    // Rank & save: keep only the top N by score for this edition
    const ranked = [...normalized]
      .sort((a, b) => b.score - a.score)
      .slice(0, storiesPerEdition);

    console.log(
      `[curate] provider: ${providerName}, ${topics.length} searches — ${allArticles.length} raw, ${deduped.length} after dedupe, ${englishOnly.length} after language filter, ${allowedArticles.length} after recency/source filters, ${ranked.length} kept`
    );

    if (ranked.length === 0) {
      const price = provider.PRICING;
      const costUsd =
        (inputTokens / 1_000_000) * price.input +
        (outputTokens / 1_000_000) * price.output;
      const balanceAfter = currentBalance - costUsd;
      await supabaseAdmin
        .from("billing_state")
        .update({ credit_balance_usd: balanceAfter })
        .eq("id", 1);
      await supabaseAdmin.from("api_usage").insert({
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        model: providerName,
        provider: providerName,
        cost_usd: costUsd,
        balance_after: balanceAfter,
        trigger,
        found_count: allArticles.length,
        kept_count: 0,
      });
      console.log("[curate] 0 fresh articles this run — queue unchanged");
      return [];
    }

    for (const article of ranked) {
      if (article.url) await trackSource(article.source, article.url);
    }

    // Finding a brand's official picture is an extra, optional LLM call per
    // story — fold its token spend into the same run's cost rather than
    // letting it leak outside the balance tracking.
    const images = await resolveImages(ranked, provider.findBrandImage);
    for (const image of images) {
      inputTokens += image.inputTokens;
      outputTokens += image.outputTokens;
    }

    const price = provider.PRICING;
    const costUsd =
      (inputTokens / 1_000_000) * price.input +
      (outputTokens / 1_000_000) * price.output;
    const balanceAfter = currentBalance - costUsd;

    await supabaseAdmin
      .from("billing_state")
      .update({ credit_balance_usd: balanceAfter })
      .eq("id", 1);

    await supabaseAdmin.from("api_usage").insert({
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      model: providerName,
      provider: providerName,
      cost_usd: costUsd,
      balance_after: balanceAfter,
      trigger,
      found_count: allArticles.length,
      kept_count: ranked.length,
    });

    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert(
        ranked.map((a, i) => {
          const { image_url, image_kind, image_credit } = images[i];
          return { ...a, image_url, image_kind, image_credit, state: "pending" };
        })
      )
      .select();

    if (error) throw new Error(error.message);

    if (settings?.auto_publish) {
      await supabaseAdmin
        .from("articles")
        .update({ state: "approved" })
        .eq("state", "pending");
      await publishEdition();
    }

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logFailedRun(providerName, currentBalance, message, trigger);
    throw err;
  }
}
