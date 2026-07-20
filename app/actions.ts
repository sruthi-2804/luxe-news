"use server";

import { revalidatePath } from "next/cache";
import { runCuration } from "./lib/curate";

export async function refreshArticles() {
  await runCuration();
  revalidatePath("/");
}
