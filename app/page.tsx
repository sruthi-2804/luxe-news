import Link from "next/link";
import ArticleCard from "./components/ArticleCard";
import FashionWeekSlideshow from "./components/FashionWeekSlideshow";
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

  const isScheduleArticle = (article: { category: string; title: string }) =>
    article.category.toLowerCase().includes("schedule") ||
    article.category.toLowerCase().includes("fashion week") ||
    article.title.toLowerCase().includes("fashion week");

  const scheduleArticles = articles?.filter(isScheduleArticle) ?? [];
  const otherArticles = articles?.filter((a) => !isScheduleArticle(a)) ?? [];

  return (
    <ScrollGate isLoggedIn={!!user}>
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-10 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 items-center">
            <div />
            <div className="text-center">
              <h1 className="font-serif uppercase text-4xl sm:text-5xl tracking-[0.08em] text-black">
                Luxe News
              </h1>
            </div>
            <div className="flex justify-end gap-4 text-xs uppercase tracking-wider text-zinc-500">
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="hover:text-zinc-900">
                      Admin
                    </Link>
                  )}
                  <SignOutButton />
                </>
              ) : (
                <Link href="/login" className="hover:text-zinc-900">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <p className="text-center text-zinc-500 text-xs uppercase tracking-[0.2em] pb-6">
            Curated Luxury Fashion News
          </p>
          <div className="h-px bg-black" />
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          {articles && articles.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-8">
              {articles.length} stories curated today
            </p>
          )}

          <FashionWeekSlideshow articles={scheduleArticles} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </main>
      </div>
    </ScrollGate>
  );
}
