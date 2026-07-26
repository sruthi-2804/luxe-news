import Link from "next/link";
import ArticleCard from "./components/ArticleCard";
import SignOutButton from "./components/SignOutButton";
import ScrollGate from "./components/ScrollGate";
import { createClient } from "./lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <ScrollGate isLoggedIn={!!user}>
      <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100">
        <header className="border-b border-amber-800/20 bg-stone-50/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-7 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif italic tracking-tight text-zinc-900">
                Luxe News
              </h1>
              <p className="text-zinc-500 mt-1 text-sm tracking-wide">
                Curated luxury fashion news, organized for you.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      Admin
                    </Link>
                  )}
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
          {articles && articles.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-6">
              {articles.length} stories curated today
            </p>
          )}
          {articles?.[0] && (
            <div className="mb-6">
              <ArticleCard article={articles[0]} featured />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles?.slice(1).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </main>
      </div>
    </ScrollGate>
  );
}
