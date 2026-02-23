import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Spotify credentials missing from environment");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Spotify Auth] Failed to get access token (${response.status}):`, errorText);
        throw new Error(`Spotify auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("q") || "";

    try {
        const { authOptions } = await import("@/lib/auth");
        const session: any = await getServerSession(authOptions);
        const token = session?.accessToken || await getAccessToken();

        let endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`;
        let isLibrary = false;

        if (!query) {
            if (!session) {
                return NextResponse.json({ tracks: [] });
            }
            // Fetch user's saved tracks if no query provided
            endpoint = `https://api.spotify.com/v1/me/tracks?limit=20`;
            isLibrary = true;
        }

        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Spotify API] Request failed (${endpoint}) with status ${response.status}:`, errorText);
            return NextResponse.json({ error: `Spotify API error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();

        // Saved tracks (me/tracks) has a different structure than search (items are wrapped in an object with added_at)
        const rawTracks = isLibrary ? data.items?.map((item: any) => item.track) : data.tracks?.items;

        if (!rawTracks) {
            console.error("[Spotify API] Unexpected response format (missing tracks):", data);
            return NextResponse.json({ error: "Unexpected response from Spotify" }, { status: 502 });
        }

        const tracks = rawTracks.map((track: any) => {
            if (!track) return null;
            return {
                id: track.id,
                name: track.name,
                artist: track.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
                albumArt: track.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
                previewUrl: track.preview_url,
                hasPreview: !!track.preview_url,
                externalUrl: track.external_urls?.spotify,
            };
        }).filter(Boolean);

        return NextResponse.json({ tracks });
    } catch (error: any) {
        console.error("Spotify Search Error:", error);
        return NextResponse.json({
            error: "Failed to search Spotify",
            details: error.message
        }, { status: 500 });
    }
}
