import { supabaseAdmin } from "../supabaseAdmin";

const MAX_BYTES = 8 * 1024 * 1024;
const BUCKET = "article-images";

export async function storeImage(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) return null;

    const ext = contentType.split("/")[1]?.split(";")[0] ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(buffer), { contentType, upsert: true });
    if (error) return null;

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}
