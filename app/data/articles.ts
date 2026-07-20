export type Article = {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
};

export const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Chanel Unveils Resort 2027 Collection in Marrakech",
    summary:
      "The house returned to North Africa for a sun-drenched showcase blending tailored tweed with flowing silk, signaling a softer silhouette for next year.",
    category: "Runway",
    source: "Vogue",
    publishedAt: "2026-07-18",
  },
  {
    id: "2",
    title: "LVMH Reports Slower Luxury Growth as Asia Demand Cools",
    summary:
      "Quarterly results show a deceleration in Chinese consumer spending, prompting the conglomerate to lean further into personalization and private clienteling.",
    category: "Business",
    source: "Business of Fashion",
    publishedAt: "2026-07-17",
  },
  {
    id: "3",
    title: "Phoebe Philo's Latest Drop Sells Out in Under an Hour",
    summary:
      "The designer's quietly-marketed capsule collection continues to command cult demand, with resale prices already climbing on secondary markets.",
    category: "Designers",
    source: "WWD",
    publishedAt: "2026-07-16",
  },
  {
    id: "4",
    title: "Sustainable Leather Alternatives Gain Ground at Milan Fashion Week",
    summary:
      "Several major houses debuted pieces using mycelium and grape-based leather substitutes, marking a shift in how luxury approaches material sourcing.",
    category: "Sustainability",
    source: "The Business of Fashion",
    publishedAt: "2026-07-15",
  },
];
