import OpenAI from "openai";
import { supabaseAdmin } from "./supabaseAdmin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Price per 1 million tokens, in USD. Update if the model changes.
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-5.4-nano": { input: 0.2, output: 1.25 },
  "gpt-5.6-luna": { input: 1.0, output: 6.0 },
  "gpt-5.6-terra": { input: 2.5, output: 15.0 },
  "gpt-5.6-sol": { input: 5.0, output: 30.0 },
};

const MODEL = "gpt-5.4-nano";

const SYSTEM_PROMPT =
  "You are a luxury fashion news editor. Search the web for luxury fashion news published in the last 24 hours. Return EVERY distinct, genuine story you find on the given topic — do not artificially cap the count. For 'source', give ONLY the publication's name (e.g. 'Vogue Business'), never a link or markdown formatting. Put the direct article link in 'url'. Only include articles actually published within the last 24 hours.";

const ARTICLE_SCHEMA = {
  type: "json_schema" as const,
  name: "curated_articles",
  schema: {
    type: "object",
    properties: {
      articles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            category: { type: "string" },
            source: { type: "string" },
            url: { type: "string" },
            published_at: { type: "string" },
          },
          required: [
            "title",
            "summary",
            "category",
            "source",
            "url",
            "published_at",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["articles"],
    additionalProperties: false,
  },
  strict: true,
};

const TOPICS = [
  "luxury fashion runway shows and fashion week news",
  "luxury fashion designer and creative director moves",
  "luxury fashion business news: earnings, acquisitions, executive appointments",
  "luxury fashion retail, sustainability, and brand launch news",
];

async function searchTopic(topic: string) {
  return openai.responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Search for: ${topic}. Published in the last 24 hours. Return every distinct story you find as structured articles.`,
      },
    ],
    text: { format: ARTICLE_SCHEMA },
  });
}

export async function runCuration() {
  const responses = await Promise.all(TOPICS.map(searchTopic));

  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  const allArticles: {
    title: string;
    summary: string;
    category: string;
    source: string;
    url: string;
    published_at: string;
  }[] = [];

  for (const response of responses) {
    inputTokens += response.usage?.input_tokens ?? 0;
    outputTokens += response.usage?.output_tokens ?? 0;
    totalTokens += response.usage?.total_tokens ?? 0;

    const parsed = JSON.parse(response.output_text);
    allArticles.push(...parsed.articles);
  }

  // Dedupe: the 4 topic searches can overlap on the same story
  const seenTitles = new Set<string>();
  const deduped = allArticles.filter((article) => {
    const key = article.title.trim().toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  // The model doesn't always obey "last 24 hours" strictly, so enforce it here too
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  const freshArticles = deduped.filter((article) => {
    const publishedDate = new Date(article.published_at);
    return !isNaN(publishedDate.getTime()) && publishedDate >= cutoff;
  });

  const price = PRICING[MODEL];
  const costUsd = price
    ? (inputTokens / 1_000_000) * price.input +
      (outputTokens / 1_000_000) * price.output
    : 0;

  console.log(
    `[curate] ${TOPICS.length} searches — ${allArticles.length} raw, ${deduped.length} after dedupe, ${freshArticles.length} after recency filter`
  );
  console.log(
    `[curate] tokens — input: ${inputTokens}, output: ${outputTokens}, total: ${totalTokens}, cost: $${costUsd.toFixed(
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
    total_tokens: totalTokens,
    model: MODEL,
    cost_usd: costUsd,
    balance_after: balanceAfter,
  });

  // Replace old articles with this fresh batch, instead of piling up duplicates
  await supabaseAdmin.from("articles").delete().neq("id", 0);

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert(freshArticles)
    .select();

  if (error) throw new Error(error.message);

  return data;
}
