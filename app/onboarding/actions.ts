"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrganization(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to create an organization." };
    }

    const companyName = formData.get("companyName") as string;
    if (!companyName) {
        return { error: "Company name is required." };
    }

    // simplistic slug generation
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data, error } = await supabase
        .from("organizations")
        .insert([{
            name: companyName,
            slug: slug,
            owner_id: user.id,
            settings: { "ai_prompt_addition": "Keep it professional." }
        }])
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}
