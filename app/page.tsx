import Link from "next/link";
import ArticleCard from "./components/ArticleCard";
import RefreshButton from "./components/RefreshButton";
import SignOutButton from "./components/SignOutButton";
import ScrollGate from "./components/ScrollGate";
import { createClient } from "./lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <ScrollGate isLoggedIn={!!user}>
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Luxe News</h1>
              <p className="text-zinc-500 mt-1">
                Curated luxury fashion news, organized for you.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <RefreshButton />
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-900 hover:underline"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles?.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </main>
      </div>
    </ScrollGate>
  );
}
