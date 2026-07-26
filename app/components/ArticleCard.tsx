import { Article } from "../lib/types";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticleCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  return (
    <article
      className={`group ${
        featured ? "" : "p-6 border border-zinc-200 -ml-px -mt-px"
      }`}
    >
      <span className="inline-block text-[11px] uppercase tracking-[0.15em] font-semibold text-zinc-500">
        {article.category}
      </span>
      <h2
        className={`font-serif text-black mt-2 mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4 ${
          featured ? "text-4xl sm:text-5xl" : "text-xl"
        }`}
      >
        {article.title}
      </h2>
      <p className={`text-zinc-600 mb-3 ${featured ? "text-lg" : "text-sm"}`}>
        {article.summary}
      </p>
      <div className="text-xs text-zinc-400 flex items-center gap-3 flex-wrap">
        <span className="uppercase tracking-wide font-medium text-zinc-500">
          {article.source}
        </span>
        <span>·</span>
        <span>{formatDate(article.published_at)}</span>
        {article.url && (
          <>
            <span>·</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-wide font-medium text-black hover:underline"
            >
              Read
            </a>
          </>
        )}
      </div>
    </article>
  );
}
