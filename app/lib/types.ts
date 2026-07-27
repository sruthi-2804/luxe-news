export type Article = {
  id: number;
  title: string;
  summary: string;
  category: string;
  section: string | null;
  source: string;
  url: string | null;
  published_at: string;
  score: number | null;
  state: string | null;
  why_it_matters: string | null;
  three_points: string[] | null;
  edition_label: string | null;
  image_url: string | null;
  image_kind: "own" | "brand" | "category" | null;
  image_credit: string | null;
};
