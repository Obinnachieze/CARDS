import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type") || "stickers";
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "20";

    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Giphy API key not configured" }, { status: 500 });
    }

    try {
        const timestamp = Date.now();
        const endpoint = q
            ? `https://api.giphy.com/v1/${type}/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=g&ts=${timestamp}`
            : `https://api.giphy.com/v1/${type}/trending?api_key=${apiKey}&limit=${limit}&offset=${offset}&rating=g&ts=${timestamp}`;

        console.log(`Fetching Giphy: ${endpoint}`);
        const res = await fetch(endpoint);
        const data = await res.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Giphy Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch from Giphy" }, { status: 500 });
    }
}
