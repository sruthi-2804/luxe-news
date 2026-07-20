import ArticleCard from "./components/ArticleCard";
import { sampleArticles } from "./data/articles";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-zinc-900">Luxe News</h1>
          <p className="text-zinc-500 mt-1">
            Curated luxury fashion news, organized for you.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sampleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </main>
    </div>
  );
}
