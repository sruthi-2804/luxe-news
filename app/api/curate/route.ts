import { NextResponse } from "next/server";
import { runCuration } from "../../lib/curate";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await runCuration("cron");
  return NextResponse.json({ inserted: articles.length, articles });
}
