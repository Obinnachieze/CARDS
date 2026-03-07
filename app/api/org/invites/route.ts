import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orgId, maxUses, expiresInDays = 7 } = await req.json();

        if (!orgId) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
        }

        // Verify the user owns or is a member of the organization
        // Note: For simple security, we check if they are the owner in the organizations table.
        // If a membership table exists, that should be checked for "Admin" permissions.
        const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("id")
            .eq("id", orgId)
            .eq("owner_id", user.id)
            .single();

        if (orgError || !org) {
            return NextResponse.json({ error: "Unauthorized: You do not have permission to invite to this organization" }, { status: 403 });
        }

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const { data, error } = await supabase
            .from("org_invites")
            .insert([
                {
                    org_id: orgId,
                    max_uses: maxUses || null,
                    expires_at: expiresAt.toISOString(),
                }
            ])
            .select("token")
            .single();

        if (error) {
            console.error("Invite creation error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Build the invite URL
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const inviteUrl = `${baseUrl}/join/${data.token}`;

        return NextResponse.json({ success: true, token: data.token, url: inviteUrl });
    } catch (err: any) {
        console.error("API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
