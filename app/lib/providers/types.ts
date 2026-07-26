export type CuratedArticle = {
  title: string;
  summary: string;
  category: string;
  source: string;
  url: string;
  published_at: string;
};

export type SearchResult = {
  articles: CuratedArticle[];
  inputTokens: number;
  outputTokens: number;
};

export const SYSTEM_PROMPT =
  "You are a luxury fashion news editor. Search the web for luxury fashion news published in the last 24 hours. Return EVERY distinct, genuine story you find on the given topic — do not artificially cap the count. For 'source', give ONLY the publication's name (e.g. 'Vogue Business'), never a link or markdown formatting. Put the direct article link in 'url'. Only include articles actually published within the last 24 hours.";

export const TOPICS = [
  "Chanel news",
  "Dior news",
  "Louis Vuitton news",
  "Gucci news",
  "Prada news",
  "Hermès news",
  "LVMH business and earnings news",
  "Kering business and earnings news",
  "Richemont business and earnings news",
  "luxury fashion runway shows and fashion week news",
  "luxury fashion designer and creative director appointments",
  "luxury fashion brand acquisitions and mergers",
  "luxury fashion sustainability and material innovation news",
  "luxury fashion retail and e-commerce news",
  "luxury fashion collaborations and brand launches",
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
};
