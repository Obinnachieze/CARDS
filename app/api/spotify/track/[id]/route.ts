import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const token = await getAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch track" }, { status: response.status });
        }

        const track = await response.json();

        return NextResponse.json({
            id: track.id,
            name: track.name,
            previewUrl: track.preview_url,
            albumArt: track.album.images[0]?.url,
        });
    } catch (error) {
        console.error("Track Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
