import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // Using admin client for cron

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use Service Role Key to bypass RLS for background jobs
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        const today = new Date();
        // UTC month (1-12) and day (1-31)
        const currentMonth = today.getUTCMonth() + 1;
        const currentDay = today.getUTCDate();
        const todayString = today.toISOString().split("T")[0];

        // Find all active members with a birthday today
        const { data: members, error: membersError } = await supabaseAdmin
            .from("members")
            .select(`
        id, 
        full_name, 
        email, 
        role_title, 
        department, 
        org_id,
        organizations ( id, name, settings )
      `)
            .eq("status", "active")
            .eq("birth_month", currentMonth)
            .eq("birth_day", currentDay);

        if (membersError) {
            console.error("Error fetching members:", membersError);
            return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
        }

        if (!members || members.length === 0) {
            return NextResponse.json({ success: true, message: "No birthdays today", count: 0 });
        }

        let queuedCount = 0;

        // For each member, we need to check if a delivery is already pending or sent today
        for (const member of members) {
            const { data: existingLogs, error: logError } = await supabaseAdmin
                .from("delivery_logs")
                .select("id")
                .eq("member_id", member.id)
                .eq("trigger_type", "birthday")
                .eq("scheduled_for", todayString)
                .in("status", ["pending", "sent"]);

            if (logError) {
                console.error(`Error checking logs for member ${member.id}:`, logError);
                continue; // Skip if we can't reliably determine idempotency
            }

            // If no log exists for today, we enqueue a new one
            if (!existingLogs || existingLogs.length === 0) {
                const { error: insertError } = await supabaseAdmin
                    .from("delivery_logs")
                    .insert({
                        org_id: member.org_id,
                        member_id: member.id,
                        trigger_type: "birthday",
                        status: "pending",
                        scheduled_for: todayString
                    });

                if (insertError) {
                    console.error(`Error creating delivery log for member ${member.id}:`, insertError);
                } else {
                    queuedCount++;
                }
            }
        }

        // In a full implementation, we wouldn't just insert "pending" logs, 
        // we would actually trigger Phase 4 (generation & delivery).
        // But this correctly queries the DB and implements idempotency checks.

        // Then trigger Phase 4 worker (could be a Next.js background API or synchronous call)
        if (queuedCount > 0) {
            // Use a trusted base URL to avoid Host Header Injection or SSRF-like behavior
            const baseUrl = process.env.NEXTAUTH_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://vibepost.com");
            const processQueueUrl = `${baseUrl}/api/cron/process-queue`;

            // Fire-and-forget call to process the queue asynchronously so this request doesn't timeout
            fetch(processQueueUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${cronSecret}` }
            }).catch(console.error);
        }

        return NextResponse.json({
            success: true,
            found: members.length,
            queued: queuedCount
        });

    } catch (err: any) {
        console.error("Cron Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
