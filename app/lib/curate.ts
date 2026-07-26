import { supabaseAdmin } from "./supabaseAdmin";
import { TOPICS, type CuratedArticle } from "./providers/types";
import * as openaiProvider from "./providers/openai";
import * as claudeProvider from "./providers/claude";
import * as geminiProvider from "./providers/gemini";

const PROVIDERS = {
  openai: openaiProvider,
  claude: claudeProvider,
  gemini: geminiProvider,
} as const;

type ProviderName = keyof typeof PROVIDERS;

export async function runCuration() {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("active_provider")
    .eq("id", 1)
    .single();

  const providerName = (settings?.active_provider ?? "openai") as ProviderName;
  const provider = PROVIDERS[providerName];

  const results = await Promise.all(
    TOPICS.map((topic) => provider.searchTopic(topic))
  );

  let inputTokens = 0;
  let outputTokens = 0;
  const allArticles: CuratedArticle[] = [];

  for (const result of results) {
    inputTokens += result.inputTokens;
    outputTokens += result.outputTokens;
    allArticles.push(...result.articles);
  }

  // Dedupe: the 4 topic searches can overlap on the same story
  const seenTitles = new Set<string>();
  const deduped = allArticles.filter((article) => {
    const key = article.title.trim().toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  // The model doesn't always obey "English only" strictly, so enforce it here too.
  // Matches CJK, Japanese kana, Hangul, Arabic, and Cyrillic script characters.
  const nonEnglishScript =
    /[一-鿿぀-ヿ가-힯؀-ۿЀ-ӿ]/;

  const englishOnly = deduped.filter((article) => {
    const text = `${article.title} ${article.summary} ${article.source}`;
    const isEnglish = !nonEnglishScript.test(text);
    if (!isEnglish) {
      console.log(
        `[curate] rejected as non-English: "${article.title}" — source: "${article.source}"`
      );
    }
    return isEnglish;
  });

  // The model doesn't always obey "last 24 hours" strictly, so enforce it here too
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  const freshArticles = englishOnly.filter((article) => {
    const publishedDate = new Date(article.published_at);
    const isFresh = !isNaN(publishedDate.getTime()) && publishedDate >= cutoff;
    if (!isFresh) {
      console.log(
        `[curate] rejected by recency filter: "${article.title}" — published_at: "${article.published_at}"`
      );
    }
    return isFresh;
  });

  const price = provider.PRICING;
  const costUsd =
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output;

  console.log(
    `[curate] provider: ${providerName}, ${TOPICS.length} searches — ${allArticles.length} raw, ${deduped.length} after dedupe, ${englishOnly.length} after language filter, ${freshArticles.length} after recency filter`
  );
  console.log(
    `[curate] tokens — input: ${inputTokens}, output: ${outputTokens}, cost: $${costUsd.toFixed(
      4
    )}`
  );

  const { data: billing } = await supabaseAdmin
    .from("billing_state")
    .select("credit_balance_usd")
    .eq("id", 1)
    .single();

  const balanceAfter = (billing?.credit_balance_usd ?? 0) - costUsd;

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
  });

  if (freshArticles.length === 0) {
    console.log(
      "[curate] 0 fresh articles this run — keeping existing articles instead of wiping them"
    );
    return [];
  }

  // Replace old articles with this fresh batch, instead of piling up duplicates
  await supabaseAdmin.from("articles").delete().neq("id", 0);

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert(freshArticles)
    .select();

  if (error) throw new Error(error.message);

  return data;
}
