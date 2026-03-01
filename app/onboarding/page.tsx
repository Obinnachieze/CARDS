import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirect to login but they need to come back here
        redirect("/login?callbackUrl=/onboarding");
    }

    // Check if the user already owns an organization
    const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (org) {
        // User already has an org, redirect to dashboard
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30">
            <div className="absolute top-8 left-8 z-20">
                <Link
                    href="/"
                    className="flex w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 py-20 relative overflow-hidden">
                {/* Subtle decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-purple-900/40">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Your Workspace</h1>
                        <p className="text-zinc-400 text-sm">Set up your company profile to start automating birthday cards for your team.</p>
                    </div>

                    <OnboardingForm />
                </div>
            </div>
        </main>
    );
}
