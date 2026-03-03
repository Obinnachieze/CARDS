"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteMember(memberId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Not authenticated" };
        }

        const supabaseAdmin = await createAdminClient();

        // 1. Get the organization the user owns
        const { data: orgData, error: orgError } = await supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("owner_id", user.id)
            .limit(1)
            .single();

        if (orgError || !orgData) {
            return { error: "Organization not found" };
        }

        // 2. Verify the member belongs to this organization before deleting
        // (This prevents users from deleting members in other organizations)
        const { error: deleteError } = await supabaseAdmin
            .from("members")
            .delete()
            .eq("id", memberId)
            .eq("org_id", orgData.id);

        if (deleteError) {
            console.error("Failed to delete member:", deleteError);
            return { error: "Failed to delete member" };
        }

        revalidatePath("/dashboard/members");
        return { success: true };
    } catch (error) {
        console.error("Delete member exception:", error);
        return { error: "An unexpected error occurred" };
    }
}
