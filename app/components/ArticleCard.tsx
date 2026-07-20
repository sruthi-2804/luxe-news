import { Article } from "../lib/types";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {article.category}
      </span>
      <h2 className="text-xl font-semibold mt-2 mb-3 text-zinc-900">
        {article.title}
      </h2>
      <p className="text-zinc-600 mb-4">{article.summary}</p>
      <div className="text-sm text-zinc-400 flex justify-between">
        <span>{article.source}</span>
        <span>{article.published_at}</span>
      </div>
    </article>
  );
}
