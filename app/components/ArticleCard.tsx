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
    <article className="group border border-stone-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 rounded-full px-2.5 py-1">
        {article.category}
      </span>
      <h2
        className={`font-serif text-zinc-900 mt-3 mb-3 leading-snug ${
          featured ? "text-3xl" : "text-xl"
        }`}
      >
        {article.title}
      </h2>
      <p
        className={`text-zinc-600 mb-4 ${featured ? "text-base" : "text-sm"}`}
      >
        {article.summary}
      </p>
      <div className="text-xs text-zinc-400 flex justify-between items-center border-t border-stone-100 pt-3">
        <span className="font-medium text-zinc-500">{article.source}</span>
        <span>{formatDate(article.published_at)}</span>
      </div>
      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-zinc-900 group-hover:gap-2 transition-all"
        >
          Read full article <span aria-hidden>→</span>
        </a>
      )}
    </article>
  );
}
