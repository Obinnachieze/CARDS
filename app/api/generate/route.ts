import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Mock Data for Fallback
const MOCK_RESPONSES: Record<string, string[]> = {
    birthday: [
        "Wishing you a day filled with laughter, joy, and plenty of cake! Happy Birthday!",
        "Another year older, none the wiser! Have a fantastic birthday!",
        "Happy Birthday! May your day be as special as you are.",
        "Cheers to another trip around the sun! Have a blast!",
    ],
    wedding: [
        "Congratulations on finding your forever. Wishing you a lifetime of love and happiness.",
        "To love, laughter, and happily ever after. Congratulations!",
        "Best wishes on this wonderful journey to build your new life together.",
    ],
    thankyou: [
        "Thank you so much for your kindness and support. It means the world to me.",
        "I can't thank you enough! You're amazing.",
        "Just a little note to say a big thank you!",
    ],
    anniversary: [
        "Happy Anniversary to my better half. Here's to many more years of love.",
        "Cheers to us and the beautiful life we've built. Happy Anniversary!",
    ],
    holiday: [
        "Wishing you peace, joy, and happiness this holiday season.",
        "Merry Christmas and a Happy New Year!",
        "Warmest wishes for a wonderful holiday season.",
    ],
    default: [
        "Sending you positive vibes and warm wishes!",
        "Thinking of you and hoping you have a wonderful day.",
        "You've got this! Believe in yourself.",
        "Just wanted to say hello and brighten your day.",
        "Here is a magical message just for you!"
    ]
};

const getMockResponse = (prompt: string, tone: string) => {
    const lowerPrompt = prompt.toLowerCase();

    // Simple keyword matching
    let category = "default";
    if (lowerPrompt.includes("birthday") || lowerPrompt.includes("bday")) category = "birthday";
    else if (lowerPrompt.includes("wedding") || lowerPrompt.includes("marriage")) category = "wedding";
    else if (lowerPrompt.includes("thank") || lowerPrompt.includes("thanks")) category = "thankyou";
    else if (lowerPrompt.includes("anniversary")) category = "anniversary";
    else if (lowerPrompt.includes("christmas") || lowerPrompt.includes("holiday") || lowerPrompt.includes("new year")) category = "holiday";

    const options = MOCK_RESPONSES[category];
    const randomResponse = options[Math.floor(Math.random() * options.length)];

    // Simulate tone slightly (very basic)
    if (tone === "fun and witty") return randomResponse + " 🎉";
    if (tone === "heartfelt and emotional") return randomResponse + " ❤️";

    return randomResponse;
};

// Initialize Groq only if API key is present
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog: Record<string, number[]> = {};

export async function POST(req: Request) {
    try {
        const { prompt, tone } = await req.json();

        // 1. Check for API Key - Use Mock if missing
        if (!process.env.GROQ_API_KEY) {
            console.log("No GROQ_API_KEY found. Using Mock AI.");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockText = getMockResponse(prompt, tone);
            return NextResponse.json({ text: mockText });
        }

        // 2. Rate Limiting (Skip for mock mode usually, but good to keep structure)
        const ip = "user-ip";
        const now = Date.now();

        if (!requestLog[ip]) requestLog[ip] = [];
        requestLog[ip] = requestLog[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

        if (requestLog[ip].length >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
        }

        requestLog[ip].push(now);

        // 3. Call Groq API
        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are a creative writing assistant for a card design app. 
                            Write a short, engaging message based on the user's prompt. 
                            Keep it under 30 words unless specified otherwise. 
                            Tone: ${tone || "neutral"}.`
                        },
                        { role: "user", content: prompt },
                    ],
                    model: "mixtral-8x7b-32768",
                });

                const generatedText = completion.choices[0]?.message?.content || "";
                return NextResponse.json({ text: generatedText });
            } catch (groqError) {
                console.error("Groq API failed, falling back to mock:", groqError);
                const mockText = getMockResponse(prompt, tone);
                return NextResponse.json({ text: mockText });
            }
        }

        return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });

    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
    }
}
