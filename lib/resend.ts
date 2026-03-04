import { Resend } from "resend";

export function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        // Fallback or early return logic can be handled by the caller, 
        // but the constructor will only be called with a valid key or a placeholder if allowed.
        // During build-time, we shouldn't throw if we want to avoid aborting the build.
        // However, if the key is missing at RUNTIME, we should know.
        if (process.env.NODE_ENV === "production") {
            throw new Error("RESEND_API_KEY is not configured in production");
        }
        return new Resend("re_placeholder");
    }
    return new Resend(apiKey);
}
