import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, ttl_seconds, max_views } = await req.json();

    // Validate content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Invalid content" },
        { status: 400 }
      );
    }

    // Validate ttl_seconds if present
    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return NextResponse.json(
        { error: "Invalid ttl_seconds" },
        { status: 400 }
      );
    }

    // Validate max_views if present
    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return NextResponse.json(
        { error: "Invalid max_views" },
        { status: 400 }
      );
    }

    const id = nanoid(10);
    const expires_at =
      typeof ttl_seconds === "number"
        ? Date.now() + ttl_seconds * 1000
        : null;

    const pasteData = {
      content,
      remaining_views:
        typeof max_views === "number" ? max_views : null,
      expires_at,
    };

    await redis.set(`paste:${id}`, JSON.stringify(pasteData));

    if (typeof ttl_seconds === "number") {
      await redis.expire(`paste:${id}`, ttl_seconds);
    }

    const host = req.headers.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";

    return NextResponse.json(
      {
        id,
        url: `${protocol}://${host}/p/${id}`,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }
}
