export interface GoogleFont {
    family: string;
    category: string;
    variants: string[];
    subsets: string[];
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
const BASE_URL = "https://www.googleapis.com/webfonts/v1/webfonts";

export const fetchGoogleFonts = async (): Promise<{ items: GoogleFont[], error?: string }> => {
    if (!API_KEY) {
        return { items: [], error: "API Key is missing from environment variables." };
    }
    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&sort=popularity`);
        if (!response.ok) {
            const text = await response.text();
            return { items: [], error: `Google API Error (${response.status}): ${text}` };
        }
        const data = await response.json();
        return { items: (data.items || []) as GoogleFont[] };
    } catch (error) {
        console.error("Failed to fetch fonts", error);
        return { items: [], error: `Network Error: ${String(error)}` };
    }
}

export const loadFont = (fontFamily: string) => {
    if (!fontFamily) return;
    const id = `font-${fontFamily.replace(/\s+/g, "-")}`;
    if (typeof document !== "undefined" && !document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}&display=swap`;
        document.head.appendChild(link);
    }
};
