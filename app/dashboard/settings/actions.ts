"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTemplateSettings(templateJson: any) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
        return { error: "Not authorized" };
    }

    // Get current settings first
    const { data: org } = await supabaseAuth
        .from("organizations")
        .select("id, settings")
        .eq("owner_id", user.id)
        .limit(1)
        .single();

    if (!org) {
        return { error: "Organization not found" };
    }

    // Merge new template into existing settings
    const currentSettings = org.settings || {};
    const newSettings = {
        ...currentSettings,
        template: templateJson
    };

    const { error } = await supabaseAuth
        .from("organizations")
        .update({ settings: newSettings })
        .eq("id", org.id);

    if (error) {
        console.error("Failed to save template:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}
