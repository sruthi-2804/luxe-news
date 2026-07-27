import OpenAI from "openai";
import {
  ARTICLE_JSON_SCHEMA,
  BRAND_IMAGE_JSON_SCHEMA,
  buildBrandImagePrompt,
  type SearchResult,
  type BrandImageResult,
} from "./types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-5.4-nano";

export const PRICING = { input: 0.2, output: 1.25 };

export async function searchTopic(
  topic: string,
  systemPrompt: string
): Promise<SearchResult> {
  const response = await client.responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Search for: ${topic}. Return every distinct story you find as structured articles.`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "curated_articles",
        schema: ARTICLE_JSON_SCHEMA,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text);

  return {
    articles: parsed.articles,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}

export async function findBrandImage(
  title: string,
  summary: string,
  source: string
): Promise<BrandImageResult> {
  const response = await client.responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      { role: "user", content: buildBrandImagePrompt(title, summary, source) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "brand_image",
        schema: BRAND_IMAGE_JSON_SCHEMA,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text);

  return {
    brand: parsed.brand ?? null,
    image_url: parsed.image_url ?? null,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
