import Anthropic from "@anthropic-ai/sdk";
import {
  ARTICLE_JSON_SCHEMA,
  SYSTEM_PROMPT,
  type SearchResult,
} from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5";

export const PRICING = { input: 1.0, output: 5.0 };

export async function searchTopic(topic: string): Promise<SearchResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 5 },
    ],
    messages: [
      {
        role: "user",
        content: `Search for: ${topic}. Published in the last 24 hours. Return every distinct story you find as structured articles.`,
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
