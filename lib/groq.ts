import { Groq } from "groq-sdk";

export function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("GROQ_API_KEY is not configured in production");
        }
        return new Groq({ apiKey: "gsk_placeholder" });
    }
    return new Groq({ apiKey });
}
