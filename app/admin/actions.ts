"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../lib/requireAdmin";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { runCuration } from "../lib/curate";

export async function setProvider(provider: "openai" | "claude" | "gemini") {
  await requireAdmin();
  await supabaseAdmin
    .from("app_settings")
    .update({ active_provider: provider })
    .eq("id", 1);
  revalidatePath("/admin");
}

export async function refreshNow() {
  await requireAdmin();
  await runCuration();
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteArticle(id: number) {
  await requireAdmin();
  await supabaseAdmin.from("articles").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateTopics(formData: FormData) {
  await requireAdmin();
  const raw = (formData.get("topics") as string) ?? "";
  const topics = raw
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  await supabaseAdmin
    .from("app_settings")
    .update({ topics })
    .eq("id", 1);
  revalidatePath("/admin");
}

export async function addCredits(formData: FormData) {
  await requireAdmin();
  const amount = parseFloat(formData.get("amount") as string);
  if (isNaN(amount) || amount <= 0) return;

  const { data: billing } = await supabaseAdmin
    .from("billing_state")
    .select("credit_balance_usd")
    .eq("id", 1)
    .single();

  const newBalance = (billing?.credit_balance_usd ?? 0) + amount;

  await supabaseAdmin
    .from("billing_state")
    .update({ credit_balance_usd: newBalance })
    .eq("id", 1);
  revalidatePath("/admin");
}
