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

export async function runCuration() {
  const response = await openai.responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content:
          "You are a luxury fashion news editor. Search the web thoroughly, using multiple searches with different queries if needed, for luxury fashion news published in the last 24 hours: runway shows, designer moves, business news, sustainability, retail, brand launches. Return EVERY distinct, genuine story you find from the last 24 hours — do not artificially cap the count or stop after a small handful. Skip duplicate stories about the same event. For 'source', give ONLY the publication's name (e.g. 'Vogue Business'), never a link or markdown formatting. Put the direct article link in 'url'. Only include articles actually published within the last 24 hours.",
      },
      {
        role: "user",
        content:
          "Search thoroughly and find every notable luxury fashion news story published in the last 24 hours. Return all of them as structured articles — do not limit yourself to a small number.",
      },
    ],
    text: {
      format: {
        type: "json_schema",
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
      },
    },
  });

  const usage = response.usage;
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const totalTokens = usage?.total_tokens ?? 0;

  const price = PRICING[MODEL];
  const costUsd = price
    ? (inputTokens / 1_000_000) * price.input +
      (outputTokens / 1_000_000) * price.output
    : 0;

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

  const parsed = JSON.parse(response.output_text);

  // Replace old articles with this fresh batch, instead of piling up duplicates
  await supabaseAdmin.from("articles").delete().neq("id", 0);

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert(parsed.articles)
    .select();

  if (error) throw new Error(error.message);

  return data;
}
