"use server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrganization(formData: FormData) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to create an organization." };
    }

    const companyName = formData.get("companyName") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const timezone = formData.get("timezone") as string;

    if (!companyName || !contactEmail || !timezone) {
        return { error: "Company name, email, and time zone are required." };
    }

    // simplistic slug generation
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const supabaseAdmin = await createAdminClient();

    const { data, error } = await supabaseAdmin
        .from("organizations")
        .insert([{
            name: companyName,
            slug: slug,
            owner_id: user.id,
            settings: {
                "ai_prompt_addition": "Keep it professional.",
                "contact_email": contactEmail,
                "timezone": timezone
            }
        }])
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}
