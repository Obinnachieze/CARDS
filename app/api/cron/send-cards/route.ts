import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

// Vercel Cron jobs must use standard web Edge / Serverless functions
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: Request) {
    try {
        // Verify Cron authorization if Vercel header is present (optional security layer)
        const authHeader = req.headers.get('authorization');
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
            // Allow manual triggering locally if no secret set
            process.env.NODE_ENV === 'production'
        ) {
            return new Response('Unauthorized', { status: 401 });
        }

        // We use the admin client because this runs automatically without an active user session
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // IMPORTANT: You must add this env var for cron!

        // Fallback to anon key if service role is missing (though RLS might block reads)
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

        // Find all deliveries that are due and haven't been sent
        const { data: deliveries, error } = await supabase
            .from('scheduled_deliveries')
            .select(`
                id,
                project_id,
                recipient_email,
                sender_name,
                projects ( name )
            `)
            .eq('status', 'pending')
            .lte('send_at', new Date().toISOString());

        if (error) {
            console.error("Error fetching scheduled deliveries:", error);
            throw new Error(error.message);
        }

        if (!deliveries || deliveries.length === 0) {
            return NextResponse.json({ message: "No deliveries due." });
        }

        const stats = { sent: 0, failed: 0 };

        // Process each delivery
        for (const delivery of deliveries) {
            try {
                // Determine origin dynamically or use an env var
                const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
                const host = req.headers.get("host") || "vibepost.com";
                const shareLink = `${protocol}://${host}/share/${delivery.project_id}`;

                const senderDisplay = delivery.sender_name || "A friend";
                const projectName = (Array.isArray(delivery.projects) ? delivery.projects[0]?.name : (delivery.projects as any)?.name) || "A VibePost Card";

                // Generate HTML content
                const htmlContent = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 20px;">
                        <h2 style="color: #6d28d9;">You received a scheduled card!</h2>
                        <p style="font-size: 16px; color: #333;"><strong>${senderDisplay}</strong> scheduled this card to arrive right now.</p>
                        
                        <div style="margin: 40px 0;">
                            <a href="${shareLink}" style="background-color: #9333ea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Open Your VibePost
                            </a>
                        </div>
                        
                        <p style="font-size: 12px; color: #888;">Powered by VibePost.</p>
                    </div>
                `;

                const { error: emailError } = await resend.emails.send({
                    from: "VibePost Delivery <onboarding@resend.dev>", // Replace with your domain when ready
                    to: delivery.recipient_email,
                    subject: `${senderDisplay} sent you a VibePost: ${projectName}`,
                    html: htmlContent,
                });

                if (emailError) throw new Error(emailError.message);

                // Mark as sent
                await supabase
                    .from('scheduled_deliveries')
                    .update({ status: 'sent' })
                    .eq('id', delivery.id);

                stats.sent++;
            } catch (err: any) {
                console.error(`Failed to send delivery ${delivery.id}:`, err);

                // Optionally mark as failed
                await supabase
                    .from('scheduled_deliveries')
                    .update({ status: 'failed' })
                    .eq('id', delivery.id);

                stats.failed++;
            }
        }

        return NextResponse.json({
            message: "Cron job executed successfully.",
            stats
        });

    } catch (error: any) {
        console.error("Cron execution error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
