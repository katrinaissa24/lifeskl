import { NextResponse } from "next/server";
import { TRACKS, getTrack } from "@lifeskl/core";

// GET /api/tracks             -> all tracks
// GET /api/tracks?slug=money  -> a single track
//
// This is the backend. The web app currently reads the curriculum directly for
// speed, but this endpoint is what the React Native app (apps/mobile) will call
// over HTTP — same data, one source of truth.
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");

  if (slug) {
    const track = getTrack(slug);
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }
    return NextResponse.json(track);
  }

  return NextResponse.json(TRACKS);
}
