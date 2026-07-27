import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

function formatTime(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .in("state", ["approved", "featured"])
    .single();

  if (!article) notFound();

  const { data: related } = await supabase
    .from("articles")
    .select("id, title, category")
    .in("state", ["approved", "featured"])
    .neq("id", article.id)
    .order("score", { ascending: false })
    .limit(3);

  const points: string[] = (article.three_points ?? []).slice(0, 3);

  return (
    <div className="min-h-screen bg-paper">
      <main className="max-w-[1440px] mx-auto px-14 pb-[72px]">
        <div className="py-[30px] border-b border-line flex items-baseline justify-between gap-6">
          <Link
            href="/"
            className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted whitespace-nowrap"
          >
            ← Back to the edition
          </Link>
          {article.edition_label && (
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted whitespace-nowrap">
              {article.edition_label}
            </span>
          )}
        </div>

        <article className="grid grid-cols-[minmax(0,1fr)_300px] gap-[72px] pt-[72px] max-w-[1180px] mx-auto">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted mb-6">
              {article.category}
            </p>
            <h1 className="font-sans text-[54px] leading-[0.98] tracking-[-0.042em] font-semibold text-balance">
              {article.title}
            </h1>
            <div className="flex items-center gap-3.5 mt-[30px] mb-11 pb-[26px] border-b border-line">
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase">
                {article.source}
              </span>
              <span className="text-line-strong">·</span>
              <span className="font-mono text-xs text-muted">
                {formatTime(article.published_at)}
              </span>
            </div>

            {article.image_kind && article.image_url && (
              <figure className="mb-8">
                <div className="w-full aspect-[16/9] bg-paper-alt overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.image_credit && (
                  <figcaption className="text-[11px] uppercase tracking-[0.08em] text-muted pt-2.5">
                    {article.image_credit}
                  </figcaption>
                )}
              </figure>
            )}

            <p className="text-[22px] leading-[1.55] text-ink mb-8 text-pretty">
              {article.summary}
            </p>

            {points.length > 0 && (
              <div className="border-t border-ink pt-[26px] mb-12">
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted mb-5">
                  The three points
                </p>
                <div className="flex flex-col gap-4">
                  {points.map((point, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[26px_1fr] gap-3.5 items-baseline"
                    >
                      <span className="font-mono text-xs text-accent">
                        {"0" + (i + 1)}
                      </span>
                      <span className="text-base leading-[1.6] text-ink-soft">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border border-line-strong rounded-full px-6 py-[13px] text-[13px] font-medium hover:border-ink transition-colors duration-200"
              >
                Read the full report at {article.source}
              </a>
            )}
          </div>

          <aside className="border-l border-line pl-9">
            {article.why_it_matters && (
              <>
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted mb-4">
                  Why it matters
                </p>
                <p className="text-[15px] leading-[1.62] text-ink-soft mb-11">
                  {article.why_it_matters}
                </p>
              </>
            )}
            {related && related.length > 0 && (
              <>
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted mb-[18px]">
                  Also in this edition
                </p>
                <div className="flex flex-col gap-5">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/story/${r.id}`}
                      className="block pb-5 border-b border-line"
                    >
                      <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted mb-2">
                        {r.category}
                      </p>
                      <p className="font-sans text-[17px] leading-[1.22] tracking-[-0.02em] font-medium">
                        {r.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </aside>
        </article>
      </main>
    </div>
  );
}
