import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  const response = await openai.responses.create({
    model: "gpt-5.6",
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content:
          "You are a luxury fashion news editor. Search the web for the most notable, recent luxury fashion news: runway shows, designer moves, business news, sustainability. Pick the 6 most important stories from the last few days.",
      },
      {
        role: "user",
        content:
          "Find today's most important luxury fashion news and return it as structured articles.",
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
                  published_at: { type: "string" },
                },
                required: [
                  "title",
                  "summary",
                  "category",
                  "source",
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

  console.log("output_parsed:", response.output_parsed);
  console.log("output_text:", response.output_text);

  const parsed = response.output_parsed ?? JSON.parse(response.output_text);
  return NextResponse.json(parsed);
}
