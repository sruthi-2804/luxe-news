import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { MIN_BALANCE_USD } from "../lib/curate";
import ProviderSelector from "./ProviderSelector";
import AdminRefreshButton from "./AdminRefreshButton";
import { deleteArticle, updateTopics, addCredits } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("active_provider, topics")
    .eq("id", 1)
    .single();

  const { data: billing } = await supabaseAdmin
    .from("billing_state")
    .select("credit_balance_usd")
    .eq("id", 1)
    .single();

  const { data: usageLog } = await supabaseAdmin
    .from("api_usage")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select("email, is_admin, created_at")
    .order("created_at", { ascending: false });

  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  const balance = billing?.credit_balance_usd ?? 0;
  const isLowBalance = balance < MIN_BALANCE_USD;
  const topicsText = (settings?.topics ?? []).join("\n");

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-zinc-900">Admin</h1>
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        {isLowBalance && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
            ⚠ Balance is ${balance.toFixed(2)}, below the ${MIN_BALANCE_USD.toFixed(2)}{" "}
            minimum — curation runs are blocked until you add credits.
          </div>
        )}

        <section className="bg-white border border-stone-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            LLM Provider
          </h2>
          <ProviderSelector active={settings?.active_provider ?? "openai"} />
        </section>

        <section className="bg-white border border-stone-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Curation
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            Remaining balance:{" "}
            <span className="font-medium text-zinc-900">
              ${balance.toFixed(2)}
            </span>
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <AdminRefreshButton />
            <form action={addCredits} className="flex items-center gap-2">
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                placeholder="Amount"
                required
                className="border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 w-28"
              />
              <button
                type="submit"
                className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Add Credits
              </button>
            </form>
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            Search Topics
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            One topic per line — these are the queries run on every curation.
          </p>
          <form action={updateTopics} className="flex flex-col gap-3">
            <textarea
              name="topics"
              defaultValue={topicsText}
              rows={10}
              className="border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 font-mono"
            />
            <button
              type="submit"
              className="self-start rounded bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700"
            >
              Save Topics
            </button>
          </form>
        </section>

        <section className="bg-white border border-stone-200 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Usage Log
          </h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-stone-200">
                <th className="pb-2 pr-4">When</th>
                <th className="pb-2 pr-4">Provider</th>
                <th className="pb-2 pr-4">Input</th>
                <th className="pb-2 pr-4">Output</th>
                <th className="pb-2 pr-4">Cost / Status</th>
                <th className="pb-2">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {usageLog?.map((row) => (
                <tr key={row.id} className="border-b border-stone-100">
                  <td className="py-2 pr-4 text-zinc-500">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-zinc-900">
                    {row.provider ?? row.model}
                  </td>
                  <td className="py-2 pr-4 text-zinc-900">
                    {row.input_tokens}
                  </td>
                  <td className="py-2 pr-4 text-zinc-900">
                    {row.output_tokens}
                  </td>
                  <td className="py-2 pr-4">
                    {row.error ? (
                      <span className="text-red-600 font-medium">
                        FAILED: {row.error}
                      </span>
                    ) : row.cost_usd != null ? (
                      <span className="text-zinc-900">
                        ${row.cost_usd.toFixed(4)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 text-zinc-900">
                    {row.balance_after != null
                      ? `$${row.balance_after.toFixed(4)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white border border-stone-200 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Articles
          </h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-stone-200">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {articles?.map((article) => (
                <tr key={article.id} className="border-b border-stone-100">
                  <td className="py-2 pr-4 text-zinc-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="py-2 pr-4 text-zinc-500">
                    {article.category}
                  </td>
                  <td className="py-2 pr-4 text-zinc-500">
                    {article.source}
                  </td>
                  <td className="py-2 pr-4 text-zinc-500">
                    {article.published_at}
                  </td>
                  <td className="py-2">
                    <form action={deleteArticle.bind(null, article.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:underline text-xs font-medium"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white border border-stone-200 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Users</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-stone-200">
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Admin</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.email} className="border-b border-stone-100">
                  <td className="py-2 pr-4 text-zinc-900">{u.email}</td>
                  <td className="py-2 pr-4 text-zinc-900">
                    {u.is_admin ? "Yes" : "No"}
                  </td>
                  <td className="py-2 text-zinc-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
