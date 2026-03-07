import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "./settings-form";

// Get the user's actual organization
async function getUserOrg() {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) redirect("/login?callbackUrl=/dashboard/settings");

    const { data } = await supabaseAuth.from("organizations").select("id, name, settings").eq("owner_id", user.id).limit(1).single();
    if (!data) redirect("/onboarding");
    return data;
}

export default async function SettingsPage() {
    const org = await getUserOrg();

    if (!org) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
                <p className="text-muted-foreground">Please create an organization first.</p>
            </div>
        );
    }

    return <SettingsForm org={org} />;
}
