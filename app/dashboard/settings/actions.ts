"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTemplateSettings(templateJson: any) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
        return { error: "Not authorized" };
    }

    const { data: org } = await supabaseAuth
        .from("organizations")
        .select("id, settings")
        .eq("owner_id", user.id)
        .limit(1)
        .single();

    if (!org) {
        return { error: "Organization not found" };
    }

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

export async function saveAISettings(promptAddition: string) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
        return { error: "Not authorized" };
    }

    const { data: org } = await supabaseAuth
        .from("organizations")
        .select("id, settings")
        .eq("owner_id", user.id)
        .limit(1)
        .single();

    if (!org) {
        return { error: "Organization not found" };
    }

    const currentSettings = org.settings || {};
    const newSettings = {
        ...currentSettings,
        ai_prompt_addition: promptAddition
    };

    const { error } = await supabaseAuth
        .from("organizations")
        .update({ settings: newSettings })
        .eq("id", org.id);

    if (error) {
        console.error("Failed to save AI settings:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}
