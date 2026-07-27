"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../lib/requireAdmin";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { runCuration, publishEdition as publishEditionInternal } from "../lib/curate";

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

export async function approveStory(id: number) {
  await requireAdmin();
  await supabaseAdmin.from("articles").update({ state: "approved" }).eq("id", id);
  revalidatePath("/admin");
}

export async function featureStory(id: number) {
  await requireAdmin();
  await supabaseAdmin.from("articles").update({ state: "featured" }).eq("id", id);
  revalidatePath("/admin");
}

export async function rejectStory(id: number) {
  await requireAdmin();
  await supabaseAdmin.from("articles").update({ state: "rejected" }).eq("id", id);
  revalidatePath("/admin");
}

export async function approveAllPending() {
  await requireAdmin();
  await supabaseAdmin
    .from("articles")
    .update({ state: "approved" })
    .eq("state", "pending");
  revalidatePath("/admin");
}

export async function publishEdition() {
  await requireAdmin();
  await publishEditionInternal();
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

export async function updateRunSettings(formData: FormData) {
  await requireAdmin();
  const recencyHours = parseInt(formData.get("recency_hours") as string, 10);
  const storiesPerEdition = parseInt(
    formData.get("stories_per_edition") as string,
    10
  );
  const autoPublish = formData.get("auto_publish") === "on";

  await supabaseAdmin
    .from("app_settings")
    .update({
      recency_hours: isNaN(recencyHours) ? 36 : recencyHours,
      stories_per_edition: isNaN(storiesPerEdition) ? 10 : storiesPerEdition,
      auto_publish: autoPublish,
    })
    .eq("id", 1);
  revalidatePath("/admin");
}

export async function savePrompt(formData: FormData) {
  await requireAdmin();
  const body = (formData.get("body") as string) ?? "";
  if (!body.trim()) return;

  const { data: latest } = await supabaseAdmin
    .from("prompts")
    .select("version")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  await supabaseAdmin
    .from("prompts")
    .insert({ version: (latest?.version ?? 0) + 1, body });
  revalidatePath("/admin");
}

export async function toggleSourceAllowed(domain: string, allowed: boolean) {
  await requireAdmin();
  await supabaseAdmin
    .from("sources")
    .update({ allowed })
    .eq("domain", domain);
  revalidatePath("/admin");
}

export async function addSource(formData: FormData) {
  await requireAdmin();
  const domain = ((formData.get("domain") as string) ?? "")
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
  if (!domain) return;

  await supabaseAdmin
    .from("sources")
    .upsert({ domain, name: domain, allowed: true, pick_count: 0 }, { onConflict: "domain" });
  revalidatePath("/admin");
}

export async function addBrandImage(formData: FormData) {
  await requireAdmin();
  const brand = ((formData.get("brand") as string) ?? "").trim();
  const imageUrl = ((formData.get("image_url") as string) ?? "").trim();
  if (!brand || !imageUrl) return;

  await supabaseAdmin
    .from("brand_images")
    .upsert({ brand, image_url: imageUrl }, { onConflict: "brand" });
  revalidatePath("/admin");
}

export async function removeBrandImage(brand: string) {
  await requireAdmin();
  await supabaseAdmin.from("brand_images").delete().eq("brand", brand);
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
