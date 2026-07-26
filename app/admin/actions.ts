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
