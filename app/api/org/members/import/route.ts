import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { orgId, members } = await req.json();

        if (!orgId || !Array.isArray(members) || members.length === 0) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Since we don't have proper auth session checks set up yet, 
        // ideally we would verify the user is an admin of the org here.

        // Format members for bulk insert
        const formattedMembers = members.map((member: any) => ({
            org_id: orgId,
            full_name: member.full_name,
            email: member.email,
            role_title: member.role_title || null,
            department: member.department || null,
            birth_month: member.birth_month,
            birth_day: member.birth_day,
            status: "active",
        }));

        // Upsert members to avoid duplicates by email
        const { data, error } = await supabase
            .from("members")
            .upsert(formattedMembers, {
                onConflict: "org_id, email",
                ignoreDuplicates: false,
            })
            .select();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: data?.length || 0 });
    } catch (err: any) {
        console.error("API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
