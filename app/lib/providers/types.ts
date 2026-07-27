export const SECTIONS = [
  "Runway",
  "Retail & Openings",
  "Business",
  "Creative Leadership",
] as const;

export type CuratedArticle = {
  title: string;
  summary: string;
  category: string;
  section: string;
  source: string;
  url: string;
  published_at: string;
  why_it_matters: string;
  three_points: string[];
  score: number;
};

export type SearchResult = {
  articles: CuratedArticle[];
  inputTokens: number;
  outputTokens: number;
};

export type BrandImageResult = {
  brand: string | null;
  image_url: string | null;
  inputTokens: number;
  outputTokens: number;
};

export const BRAND_IMAGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    brand: { type: ["string", "null"] },
    image_url: { type: ["string", "null"] },
  },
  required: ["brand", "image_url"],
  additionalProperties: false,
};

export function buildBrandImagePrompt(
  title: string,
  summary: string,
  source: string
): string {
  return `You are finding one official brand photograph for a luxury fashion news story.

Story: "${title}" — ${summary} (reported by ${source})

Rules:
1. Identify the single luxury fashion brand or house this story is primarily about.
2. Search ONLY that brand's own official website — its newsroom, press page, or media kit (e.g. a page on chanel.com, dior.com, hermes.com). Never use blogs, aggregators, stock-photo sites, social media, or any domain that isn't the brand's own.
3. Return the direct URL of one real photograph file hosted on that official domain — not a page URL, the actual image file.
4. If you cannot confirm an image hosted on the brand's own official domain, return null for image_url. Do not guess or fabricate a URL.

Return only JSON: { "brand": string or null, "image_url": string or null }`;
}

export const DEFAULT_SYSTEM_PROMPT = `You are the editor of a luxury fashion desk.

Search the web for luxury fashion news published in the last 24 hours, on the given topic. Return EVERY distinct, genuine story you find — do not artificially cap the count. Only include articles written in English, from English-language sources.

Rank each story on: industry consequence, credibility of source, recency, and whether the story changes a decision. Give each one a "score" from 0 to 1.

For each story return:
- title
- summary: one dek sentence
- category: a specific kicker like "Retail / Store Opening" or "Brand Launch / Retail"
- section: exactly one of "Runway", "Retail & Openings", "Business", "Creative Leadership" — pick the closest fit
- source: ONLY the publication's name (e.g. "Vogue Business"), never a link or markdown
- url: the direct article link
- published_at: when it was published
- why_it_matters: one sentence of editorial judgement on why this story matters to people who work in luxury fashion
- three_points: exactly three short bullet points elaborating the story
- score: 0 to 1

Write in a clear, editorial voice. No exclamation marks, no emoji. Only include articles actually published within the last 24 hours.`;

export const TOPICS = [
  "Chanel news",
  "Dior news",
  "Louis Vuitton news",
  "Gucci news",
  "Prada news",
  "Hermès news",
  "luxury fashion business news: earnings, acquisitions, executive appointments",
  "upcoming luxury fashion week schedules and runway show dates for major brands like Chanel, Dior, Gucci, Prada, and Louis Vuitton",
  "luxury fashion designer and creative director appointments",
  "luxury fashion retail, sustainability, and brand launch news",
];

export const ARTICLE_JSON_SCHEMA = {
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
          section: { type: "string", enum: SECTIONS as unknown as string[] },
          source: { type: "string" },
          url: { type: "string" },
          published_at: { type: "string" },
          why_it_matters: { type: "string" },
          three_points: {
            type: "array",
            items: { type: "string" },
          },
          score: { type: "number" },
        },
        required: [
          "title",
          "summary",
          "category",
          "section",
          "source",
          "url",
          "published_at",
          "why_it_matters",
          "three_points",
          "score",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["articles"],
  additionalProperties: false,
};
