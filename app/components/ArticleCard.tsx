import { Article } from "../lib/types";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="border border-stone-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      <span className="text-xs uppercase tracking-wide text-amber-800/70 font-medium">
        {article.category}
      </span>
      <h2 className="text-xl font-serif mt-2 mb-3 text-zinc-900">
        {article.title}
      </h2>
      <p className="text-zinc-600 mb-4">{article.summary}</p>
      <div className="text-sm text-zinc-400 flex justify-between items-center">
        <span>{article.source}</span>
        <span>{article.published_at}</span>
      </div>
      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm font-medium text-zinc-900 hover:underline"
        >
          Read full article →
        </a>
      )}
    </article>
  );
}
