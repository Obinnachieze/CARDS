import { createClient, createAdminClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { redirect } from "next/navigation";

// Get the user's actual organization
async function getUserOrg() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?callbackUrl=/dashboard/history");

    const supabaseAdmin = await createAdminClient();
    const { data } = await supabaseAdmin.from("organizations").select("id, name").eq("owner_id", user.id).limit(1).single();
    if (!data) redirect("/onboarding");
    return data;
}

export default async function DeliveryHistoryPage() {
    const supabase = await createClient();
    const org = await getUserOrg();

    if (!org) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
                <p className="text-muted-foreground">Please create an organization first.</p>
            </div>
        );
    }

    const supabaseAdmin = await createAdminClient();
    const { data: logs } = await supabaseAdmin
        .from("delivery_logs")
        .select(`
      id, status, scheduled_for, sent_at, error_message, retry_count,
      members ( full_name, email )
    `)
        .eq("org_id", org.id)
        .order("scheduled_for", { ascending: false });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Delivery History</h1>
                <p className="text-muted-foreground">
                    View the logs for automated birthday cards sent to your team.
                </p>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Recipient</th>
                            <th className="px-4 py-3 font-medium">Scheduled Date</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {(!logs || logs.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No delivery logs found. Cards will appear here once the cron job runs.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{log.members?.full_name || "Unknown"}</p>
                                        <p className="text-xs text-muted-foreground">{log.members?.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {format(new Date(log.scheduled_for), "MMM do, yyyy")}
                                        {log.sent_at && <span className="block text-xs text-muted-foreground mt-1">Sent at: {format(new Date(log.sent_at), "HH:mm")}</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            {log.status === "sent" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            {log.status === "pending" && <Clock className="w-4 h-4 text-yellow-500" />}
                                            {log.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                                            <span className={`capitalize ${log.status === "sent" ? "text-green-600 dark:text-green-400" :
                                                log.status === "failed" ? "text-red-600 dark:text-red-400" :
                                                    "text-yellow-600 dark:text-yellow-400"
                                                }`}>
                                                {log.status}
                                            </span>
                                        </div>
                                        {log.error_message && (
                                            <p className="text-xs text-red-500 mt-1 truncate max-w-[200px]" title={log.error_message}>
                                                {log.error_message}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {log.status === "failed" && (
                                            <Button variant="outline" size="sm" className="h-8">
                                                <RefreshCw className="w-3 h-3 mr-2" />
                                                Retry
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
