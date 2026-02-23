import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("[Spotify API] Credentials missing (SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET)");
        throw new Error("Spotify credentials missing on server. Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to your deployment environment variables.");
    }

    try {
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
    } catch (error: any) {
        console.error("[Spotify Auth] Error getting client token:", error.message);
        throw error;
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";

    try {
        const { authOptions } = await import("@/lib/auth");
        const session: any = await getServerSession(authOptions);
        const token = session?.accessToken || await getAccessToken();

        // Use 'q' explicitly for search, fall back to library
        let endpoint = query
            ? `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`
            : `https://api.spotify.com/v1/me/tracks?limit=20`;

        const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let spotifyMessage = errorText;
            try {
                const parsed = JSON.parse(errorText);
                spotifyMessage = parsed.error?.message || errorText;
            } catch (e) { }

            console.error(`[Spotify API Error] Status: ${response.status}, Body: ${errorText}`);
            return NextResponse.json({
                error: `Spotify API error: ${response.status}`,
                spotifyError: spotifyMessage
            }, { status: response.status });
        }

        const data = await response.json();
        const rawTracks = query ? data.tracks?.items : data.items?.map((item: any) => item.track);

        if (!rawTracks) {
            return NextResponse.json({ tracks: [] });
        }

        // Fetch client token once for fallback
        const clientToken = await getAccessToken();

        const tracks = await Promise.all(rawTracks.slice(0, 15).map(async (track: any) => {
            if (!track) return null;

            let previewUrl = track.preview_url;

            // FALLBACK logic: Only if missing and we have a valid client token
            if (!previewUrl && clientToken) {
                try {
                    // Try without market first for widest availability
                    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${track.id}`, {
                        headers: { Authorization: `Bearer ${clientToken}` }
                    });
                    if (trackRes.ok) {
                        const trackData = await trackRes.json();
                        previewUrl = trackData.preview_url;
                    }
                } catch (e) { }
            }

            return {
                id: track.id,
                name: track.name,
                artist: track.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
                albumArt: track.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
                previewUrl: previewUrl,
                hasPreview: !!previewUrl,
                externalUrl: track.external_urls?.spotify,
            };
        }));

        return NextResponse.json({ tracks: tracks.filter(Boolean) });
    } catch (error: any) {
        console.error("Spotify API Catch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
