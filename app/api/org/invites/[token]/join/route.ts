import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
    try {
        const supabase = await createClient();
        const resolvedParams = await params;
        const token = resolvedParams.token;
        const body = await req.json();

        // 1. Verify token
        const { data: invite, error: inviteError } = await supabase
            .from("org_invites")
            .select("org_id, expires_at, max_uses, use_count")
            .eq("token", token)
            .single();

        if (inviteError || !invite) {
            return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 400 });
        }

        // Check expiration
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: "Invite link has expired" }, { status: 400 });
        }

        // Check usage limits
        if (invite.max_uses && invite.use_count >= invite.max_uses) {
            return NextResponse.json({ error: "Invite link usage limit reached" }, { status: 400 });
        }

        // 2. Insert member
        const {
            full_name,
            email,
            role_title,
            department,
            birth_month,
            birth_day
        } = body;

        const { error: insertError } = await supabase
            .from("members")
            .insert([
                {
                    org_id: invite.org_id,
                    full_name,
                    email,
                    role_title: role_title || null,
                    department: department || null,
                    birth_month,
                    birth_day,
                    status: "active"
                }
            ]);

        if (insertError) {
            // Handle unique constraint on (org_id, email)
            if (insertError.code === "23505") {
                return NextResponse.json({ error: "You are already a member of this organization" }, { status: 400 });
            }
            console.error("Member insert error:", insertError);
            return NextResponse.json({ error: "Failed to join organization" }, { status: 500 });
        }

        // 3. Increment use count
        await supabase
            .from("org_invites")
            .update({ use_count: invite.use_count + 1 })
            .eq("token", token);

        return NextResponse.json({ success: true, message: "Successfully joined organization" });
    } catch (err: any) {
        console.error("API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
