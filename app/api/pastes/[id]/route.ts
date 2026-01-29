import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

interface PasteData {
  content: string;
  remaining_views: number | null;
  expires_at: number | null;
}

// Updated params type to Promise to match Next.js 15/16 requirements
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; // Must await params

  const data = await redis.get(`paste:${id}`);
  if (!data) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 }); // [cite: 71, 72]
  }

  const paste = (typeof data === "string" ? JSON.parse(data) : data) as PasteData;

  // Deterministic time support [cite: 78, 81]
  const testHeader = req.headers.get("x-test-now-ms");
  const now = process.env.TEST_MODE === "1" && testHeader
      ? parseInt(testHeader, 10)
      : Date.now();

  // Expiry check [cite: 21, 68]
  if (paste.expires_at !== null && now > paste.expires_at) {
    await redis.del(`paste:${id}`);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // View-count enforcement [cite: 22, 65, 69]
  if (typeof paste.remaining_views === "number") {
    if (paste.remaining_views <= 0) { // [cite: 114]
      await redis.del(`paste:${id}`);
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    paste.remaining_views -= 1; // Each successful API fetch counts as a view [cite: 65]
    await redis.set(`paste:${id}`, JSON.stringify(paste));

    if (paste.remaining_views === 0) {
      await redis.del(`paste:${id}`); // Become unavailable when constraint triggers [cite: 23]
    }
  }

  return NextResponse.json({
    content: paste.content,
    remaining_views: paste.remaining_views,
    expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
  });
}