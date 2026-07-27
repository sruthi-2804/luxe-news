import { GoogleGenAI } from "@google/genai";
import {
  ARTICLE_JSON_SCHEMA,
  BRAND_IMAGE_JSON_SCHEMA,
  buildBrandImagePrompt,
  type SearchResult,
  type BrandImageResult,
} from "./types";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.5-flash-lite";

export const PRICING = { input: 0.3, output: 2.5 };
// google_search grounding on Gemini 3.x is billed separately from tokens:
// $14 per 1,000 grounded queries (first 5,000/month are free, which this
// doesn't account for — treat this as a worst-case estimate).
export const WEB_SEARCH_COST_PER_CALL = 0.014;

function countGroundingCalls(usage: Record<string, unknown> | undefined) {
  const counts = usage?.grounding_tool_count as
    | Array<{ count?: number }>
    | undefined;
  return counts?.reduce((sum, g) => sum + (g.count ?? 0), 0) ?? 0;
}

export async function searchTopic(
  topic: string,
  systemPrompt: string
): Promise<SearchResult> {
  const interaction = await client.interactions.create({
    model: MODEL,
    input: `${systemPrompt}\n\nSearch for: ${topic}. Return every distinct story you find as structured articles.`,
    tools: [{ type: "google_search" }],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: ARTICLE_JSON_SCHEMA,
    },
  });

  // Field names for token usage on this newer API aren't fully documented yet -
  // logging the raw shape so we can correct the field names below once seen live.
  console.log("[gemini] raw usage object:", JSON.stringify(interaction.usage));

  const parsed = JSON.parse(interaction.output_text ?? '{"articles":[]}');
  const usage = interaction.usage as unknown as Record<string, unknown>;

  return {
    articles: parsed.articles,
    inputTokens:
      (usage?.inputTokens as number) ??
      (usage?.promptTokenCount as number) ??
      (usage?.input_tokens as number) ??
      0,
    outputTokens:
      (usage?.outputTokens as number) ??
      (usage?.responseTokenCount as number) ??
      (usage?.output_tokens as number) ??
      0,
    toolCalls: countGroundingCalls(usage),
  };
}

export async function findBrandImage(
  title: string,
  summary: string,
  source: string
): Promise<BrandImageResult> {
  const interaction = await client.interactions.create({
    model: MODEL,
    input: buildBrandImagePrompt(title, summary, source),
    tools: [{ type: "google_search" }],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: BRAND_IMAGE_JSON_SCHEMA,
    },
  });

  const parsed = JSON.parse(
    interaction.output_text ?? '{"brand":null,"image_url":null}'
  );
  const usage = interaction.usage as unknown as Record<string, unknown>;

  return {
    brand: parsed.brand ?? null,
    image_url: parsed.image_url ?? null,
    inputTokens:
      (usage?.inputTokens as number) ??
      (usage?.promptTokenCount as number) ??
      (usage?.input_tokens as number) ??
      0,
    outputTokens:
      (usage?.outputTokens as number) ??
      (usage?.responseTokenCount as number) ??
      (usage?.output_tokens as number) ??
      0,
    toolCalls: countGroundingCalls(usage),
  };
}
