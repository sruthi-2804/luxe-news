import { supabaseAdmin } from "../supabaseAdmin";
import { fetchOgImage } from "./fetchOgImage";
import { storeImage } from "./storeImage";
import type { BrandImageResult } from "../providers/types";

export const CATEGORY_ART: Record<string, string> = {
  Runway: "/category-art/runway.svg",
  "Retail & Openings": "/category-art/retail-and-openings.svg",
  Business: "/category-art/business.svg",
  "Creative Leadership": "/category-art/creative-leadership.svg",
};

export type ResolvedImage = {
  image_url: string | null;
  image_kind: "own" | "brand" | "category" | null;
  image_credit: string | null;
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
};

// Guards against the model returning an image from somewhere other than the
// brand's own domain despite being told to — a prompt is a request, not a
// guarantee. If the hostname doesn't contain the brand name, we don't use it.
function looksOfficial(brand: string, imageUrl: string): boolean {
  try {
    const host = new URL(imageUrl).hostname.toLowerCase();
    const normalizedBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedHost = host.replace(/[^a-z0-9]/g, "");
    return normalizedBrand.length > 0 && normalizedHost.includes(normalizedBrand);
  } catch {
    return false;
  }
}

export async function resolveImages<
  T extends { url: string; source: string; title: string; summary: string; section: string }
>(
  articles: T[],
  findBrandImage: (
    title: string,
    summary: string,
    source: string
  ) => Promise<BrandImageResult>
): Promise<ResolvedImage[]> {
  const { data: brands } = await supabaseAdmin
    .from("brand_images")
    .select("brand, image_url");

  return Promise.all(
    articles.map(async (article): Promise<ResolvedImage> => {
      // Rung 1 — the story's own picture
      if (article.url) {
        const og = await fetchOgImage(article.url);
        if (og) {
          const stored = await storeImage(og);
          if (stored) {
            return {
              image_url: stored,
              image_kind: "own",
              image_credit: `Picture · ${article.source}`,
              inputTokens: 0,
              outputTokens: 0,
              toolCalls: 0,
            };
          }
        }
      }

      // Rung 2 — a brand file picture already on file (free, admin-curated
      // or previously found by rung 3 below)
      const haystack = `${article.title} ${article.source}`.toLowerCase();
      const brandMatch = brands?.find((b) =>
        haystack.includes(b.brand.toLowerCase())
      );
      if (brandMatch) {
        return {
          image_url: brandMatch.image_url,
          image_kind: "brand",
          image_credit: `File picture · ${brandMatch.brand}`,
          inputTokens: 0,
          outputTokens: 0,
          toolCalls: 0,
        };
      }

      // Rung 3 — search the brand's own official site for a press photo.
      // This costs a small amount of API spend, so a hit is cached into
      // brand_images and never searched again for that brand.
      const found = await findBrandImage(
        article.title,
        article.summary,
        article.source
      );
      const tokens = {
        inputTokens: found.inputTokens,
        outputTokens: found.outputTokens,
        toolCalls: found.toolCalls,
      };

      if (found.brand && found.image_url && looksOfficial(found.brand, found.image_url)) {
        const stored = await storeImage(found.image_url);
        if (stored) {
          await supabaseAdmin
            .from("brand_images")
            .upsert({ brand: found.brand, image_url: stored }, { onConflict: "brand" });
          return {
            image_url: stored,
            image_kind: "brand",
            image_credit: `File picture · ${found.brand}`,
            ...tokens,
          };
        }
      }

      // Rung 4 — a category picture
      if (article.section && CATEGORY_ART[article.section]) {
        return {
          image_url: CATEGORY_ART[article.section],
          image_kind: "category",
          image_credit: `Illustrative · ${article.section}`,
          ...tokens,
        };
      }

      // Rung 5 — nothing
      return { image_url: null, image_kind: null, image_credit: null, ...tokens };
    })
  );
}
