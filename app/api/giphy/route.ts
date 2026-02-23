import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const rawType = searchParams.get("type");
    const type = ["stickers", "gifs"].includes(rawType as string) ? rawType : "stickers";
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "20";

    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

    if (!apiKey) {
        console.error("[Giphy API] API key missing from environment");
        return NextResponse.json({ error: "Giphy API key not configured on server" }, { status: 500 });
    }

    try {
        const timestamp = Date.now();
        const endpoint = q
            ? `https://api.giphy.com/v1/${type}/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=g&ts=${timestamp}`
            : `https://api.giphy.com/v1/${type}/trending?api_key=${apiKey}&limit=${limit}&offset=${offset}&rating=g&ts=${timestamp}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (!res.ok) {
            console.error(`[Giphy API Error] Status: ${res.status}, Message: ${data?.meta?.msg || "Unknown Giphy Error"}`);
            return NextResponse.json({
                error: `Giphy API error: ${res.status}`,
                details: data?.meta?.msg || "Unknown Giphy Error"
            }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Giphy Proxy Catch Error:", error);
        return NextResponse.json({ error: "Failed to fetch from Giphy", details: error.message }, { status: 500 });
    }
}
