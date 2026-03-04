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
        <>
            <div className="absolute top-8 left-8 z-20">
                <Link
                    href="/"
                    className="flex w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>
            <OnboardingForm />
        </>
    );
}
