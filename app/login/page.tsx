import { supabaseAdmin } from "../lib/supabaseAdmin";
import { relativeTime } from "../lib/relativeTime";
import AuthCard from "./AuthCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("source");

  const { data: lastRun } = await supabaseAdmin
    .from("api_usage")
    .select("created_at")
    .is("error", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const storyCount = articles?.length ?? 10;
  const sourceCount = new Set(articles?.map((a) => a.source)).size || 60;
  const refreshedAgo = lastRun ? relativeTime(lastRun.created_at) : null;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
      <div className="hidden lg:flex flex-col justify-between p-14 border-r border-line">
        <div className="text-[21px] font-bold tracking-[-0.03em]">
          LUXE NEWS<span className="text-accent">.</span>
        </div>

        <div className="max-w-[620px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted mb-7">
            The luxury desk
          </p>
          <h1 className="text-[clamp(46px,5.6vw,86px)] leading-[0.92] tracking-[-0.045em] font-semibold text-balance">
            Every story that moved luxury fashion. Twice a day
            <span className="text-accent">.</span>
          </h1>
          <p className="text-lg leading-[1.6] text-muted mt-8 max-w-[44ch]">
            {storyCount} stories, read and organised for you before 8am and
            8pm. Runway, retail, business, creative leadership. No feed, no
            noise.
          </p>
        </div>

        <div className="flex gap-10 text-[13px] text-muted">
          <span>Refreshed every 12 hours</span>
          <span>{storyCount} stories per edition</span>
          <span>Sourced from {sourceCount}+ desks</span>
        </div>
      </div>

      <div className="p-14 flex flex-col justify-center items-center lg:items-start">
        <AuthCard error={error} message={message} refreshedAgo={refreshedAgo} />
      </div>
    </div>
  );
}
