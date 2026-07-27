import Anthropic from "@anthropic-ai/sdk";
import {
  ARTICLE_JSON_SCHEMA,
  BRAND_IMAGE_JSON_SCHEMA,
  buildBrandImagePrompt,
  type SearchResult,
  type BrandImageResult,
} from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5";

export const PRICING = { input: 1.0, output: 5.0 };

export async function searchTopic(
  topic: string,
  systemPrompt: string
): Promise<SearchResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 5 },
    ],
    messages: [
      {
        role: "user",
        content: `Search for: ${topic}. Return every distinct story you find as structured articles.`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: ARTICLE_JSON_SCHEMA,
      },
    },
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  const parsed = JSON.parse(textBlock?.text ?? '{"articles":[]}');

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
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 5 },
    ],
    messages: [
      {
        role: "user",
        content: buildBrandImagePrompt(title, summary, source),
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: BRAND_IMAGE_JSON_SCHEMA,
      },
    },
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  const parsed = JSON.parse(textBlock?.text ?? '{"brand":null,"image_url":null}');

  return {
    brand: parsed.brand ?? null,
    image_url: parsed.image_url ?? null,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
