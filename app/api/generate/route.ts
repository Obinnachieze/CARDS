import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Simple in-memory rate limiting (for demonstration)
// In production, use Redis or a database
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog: Record<string, number[]> = {};

export async function POST(req: Request) {
    try {
        const { prompt, tone } = await req.json();

        // Basic Rate Limiting by IP (using a mock IP since we're local/serverless)
        const ip = "user-ip"; // In real app: req.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();

        if (!requestLog[ip]) {
            requestLog[ip] = [];
        }

        // Filter out old requests
        requestLog[ip] = requestLog[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

        if (requestLog[ip].length >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please try again in a minute." },
                { status: 429 }
            );
        }

        requestLog[ip].push(now);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a creative writing assistant for a card design app. 
                    Write a short, engaging message based on the user's prompt. 
                    Keep it under 30 words unless specified otherwise. 
                    Tone: ${tone || "neutral"}.`
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "mixtral-8x7b-32768",
        });

        const generatedText = completion.choices[0]?.message?.content || "";

        return NextResponse.json({ text: generatedText });

    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate text" },
            { status: 500 }
        );
    }
}
