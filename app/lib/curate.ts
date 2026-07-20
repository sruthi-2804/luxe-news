import OpenAI from "openai";
import { supabaseAdmin } from "./supabaseAdmin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runCuration() {
  const response = await openai.responses.create({
    model: "gpt-5.6",
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content:
          "You are a luxury fashion news editor. Search the web for the most notable, recent luxury fashion news: runway shows, designer moves, business news, sustainability. Pick the 6 most important stories from the last few days. For 'source', give ONLY the publication's name (e.g. 'Vogue Business'), never a link or markdown formatting. Put the direct article link in 'url'.",
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

  const parsed = response.output_parsed ?? JSON.parse(response.output_text);

  // Replace old articles with this fresh batch, instead of piling up duplicates
  await supabaseAdmin.from("articles").delete().neq("id", 0);

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert(parsed.articles)
    .select();

  if (error) throw new Error(error.message);

  return data;
}
