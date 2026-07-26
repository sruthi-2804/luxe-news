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
        <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur">
          <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif tracking-tight text-zinc-900">
                Luxe News
              </h1>
              <p className="text-zinc-500 mt-1">
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
