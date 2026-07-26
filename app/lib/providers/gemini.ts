import { GoogleGenAI } from "@google/genai";
import {
  ARTICLE_JSON_SCHEMA,
  SYSTEM_PROMPT,
  type SearchResult,
} from "./types";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.5-flash-lite";

export const PRICING = { input: 0.3, output: 2.5 };

export async function searchTopic(topic: string): Promise<SearchResult> {
  const interaction = await client.interactions.create({
    model: MODEL,
    input: `${SYSTEM_PROMPT}\n\nSearch for: ${topic}. Published in the last 24 hours. Return every distinct story you find as structured articles.`,
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
  const usage = interaction.usage as unknown as Record<string, number>;

  return {
    articles: parsed.articles,
    inputTokens:
      usage?.inputTokens ?? usage?.promptTokenCount ?? usage?.input_tokens ?? 0,
    outputTokens:
      usage?.outputTokens ??
      usage?.responseTokenCount ??
      usage?.output_tokens ??
      0,
  };
}
