import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { BirthdayCardEmail } from "@/components/emails/BirthdayCardEmail";
import { render } from "@react-email/render";
import { getResendClient } from "@/lib/resend";
import { getGroqClient } from "@/lib/groq";



export async function POST(req: Request) {
    const resend = getResendClient();
    const groq = getGroqClient();
    try {
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use Service Role Key to bypass RLS for background jobs
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        // Get all pending delivery logs
        const { data: pendingLogs, error: logError } = await supabaseAdmin
            .from("delivery_logs")
            .select(`
        id, 
        member_id, 
        org_id,
        members ( id, full_name, email, role_title, department ),
        organizations ( id, name, settings )
      `)
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(50); // Process in batches

        if (logError || !pendingLogs || pendingLogs.length === 0) {
            return NextResponse.json({ success: true, processed: 0 });
        }

        let successCount = 0;
        let failCount = 0;

        for (const log of pendingLogs) {
            if (!log.members || Array.isArray(log.members)) continue; // Type guard
            const member = log.members as any;
            const org = Array.isArray(log.organizations) ? log.organizations[0] : log.organizations;

            try {
                // 1. Generate Personalized AI Message with Groq
                let aiMessage = "Happy Birthday from the team!";
                try {
                    const completion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: "user",
                                content: `Write a warm, professional birthday message for: Name: ${member.full_name}, Role: ${member.role_title || "team member"}, Company: ${(org as any)?.name || "our company"}. Keep it under 2 sentences. Professional but heartfelt. No emojis.`,
                            },
                        ],
                        model: "llama3-8b-8192", // Using Llama3 on Groq for blazing fast generation
                        max_tokens: 150,
                    });
                    aiMessage = completion.choices[0]?.message?.content || aiMessage;
                } catch (aiErr) {
                    console.error(`AI generation failed for ${member.id}, using default.`, aiErr);
                }

                console.log(`AI Message generated: ${aiMessage}`);

                // 2. Personalize Template & Render Card Image
                // (In a full production scale, you'd use Puppeteer/Playwright or a canvas library to generate)
                // For MVP, we pass the AI message as part of the email data instead of merging it directly into a canvas if Puppeteer is too heavy
                const dummyCardImage = "https://images.unsplash.com/photo-1530103862676-de8892795f5f?auto=format&fit=crop&q=80&w=800";
                const dummyShareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/view/${log.id}`;

                // 3. Send Email using Resend
                const emailHtml = await render(BirthdayCardEmail({
                    memberFullName: member.full_name,
                    orgName: org?.name || "The Team",
                    cardImageUrl: dummyCardImage,
                    cardShareUrl: dummyShareUrl
                }));

                const { error: emailError } = await resend.emails.send({
                    from: "B2B Cards <onboarding@resend.dev>", // Configure verified domain here
                    to: member.email,
                    subject: `Happy Birthday, ${member.full_name}! 🎂`,
                    html: emailHtml,
                });

                if (emailError) {
                    throw new Error(emailError.message);
                }

                // 4. Mark log as sent
                await supabaseAdmin
                    .from("delivery_logs")
                    .update({ status: "sent", sent_at: new Date().toISOString() })
                    .eq("id", log.id);

                successCount++;

            } catch (err: any) {
                console.error(`Failed to process log ${log.id}:`, err);
                // Mark log as failed
                await supabaseAdmin
                    .from("delivery_logs")
                    .update({
                        status: "failed",
                        error_message: err.message,
                        retry_count: 1 // Implement proper retry logic loop if needed
                    })
                    .eq("id", log.id);

                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: pendingLogs.length,
            successCount,
            failCount
        });

    } catch (err: any) {
        console.error("Queue Processing Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
