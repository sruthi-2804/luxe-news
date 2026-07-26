import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import ProviderSelector from "./ProviderSelector";
import AdminRefreshButton from "./AdminRefreshButton";

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
    .select("active_provider")
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
              ${billing?.credit_balance_usd?.toFixed(2) ?? "0.00"}
            </span>
          </p>
          <AdminRefreshButton />
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
                <th className="pb-2 pr-4">Cost</th>
                <th className="pb-2">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {usageLog?.map((row) => (
                <tr key={row.id} className="border-b border-stone-100">
                  <td className="py-2 pr-4 text-zinc-500">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{row.provider ?? row.model}</td>
                  <td className="py-2 pr-4">{row.input_tokens}</td>
                  <td className="py-2 pr-4">{row.output_tokens}</td>
                  <td className="py-2 pr-4">
                    {row.cost_usd != null ? `$${row.cost_usd.toFixed(4)}` : "—"}
                  </td>
                  <td className="py-2">
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
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.is_admin ? "Yes" : "No"}</td>
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
