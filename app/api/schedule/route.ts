import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, recipientEmail, senderName, sendAt } = body;

        if (!projectId || !recipientEmail || !sendAt) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Server-side validation to ensure user owns the project
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: project } = await supabase
            .from("projects")
            .select("user_id")
            .eq("id", projectId)
            .single();

        if (!project || project.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized to schedule this project" }, { status: 403 });
        }

        // Insert into scheduled_deliveries
        const { data, error } = await supabase
            .from("scheduled_deliveries")
            .insert([
                {
                    project_id: projectId,
                    recipient_email: recipientEmail,
                    sender_name: senderName || null,
                    send_at: sendAt,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error inserting schedule:", error);
            return NextResponse.json({ error: "Database error while scheduling" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        console.error("Schedule API error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
