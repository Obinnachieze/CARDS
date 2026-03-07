import { NextResponse } from "next/server";

export async function GET() {
    // We prefer the server-side key if available, otherwise fallback to the public one for now
    const API_KEY = process.env.GOOGLE_FONTS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
    const BASE_URL = "https://www.googleapis.com/webfonts/v1/webfonts";

    if (!API_KEY) {
        return NextResponse.json({ error: "Fonts API Key is missing." }, { status: 500 });
    }

    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&sort=popularity`, {
            cache: "no-store" // Response exceeds Next.js 2MB cache limit
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch from Google" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
