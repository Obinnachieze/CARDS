import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CsvImporter } from "@/components/dashboard/csv-importer";
import { Button } from "@/components/ui/button";
import { Users, Mail, Copy } from "lucide-react";

import { redirect } from "next/navigation";

// Get the user's actual organization
async function getUserOrg() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?callbackUrl=/dashboard/members");

    const supabaseAdmin = await createAdminClient();
    const { data } = await supabaseAdmin.from("organizations").select("id, name").eq("owner_id", user.id).single();
    if (!data) redirect("/onboarding");
    return data;
}

export default async function MembersPage() {
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
    const { data: members } = await supabaseAdmin
        .from("members")
        .select("*")
        .eq("org_id", org.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground">
                    Manage your team members and their birthdays for {org.name}.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Bulk Import Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Bulk Import CSV
                    </h2>
                    <CsvImporter orgId={org.id} />
                </section>

                {/* Invite Link Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        Invite by Link
                    </h2>
                    <div className="p-6 border rounded-lg bg-white/5 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Generate a shareable link that allows employees to add themselves to the birthday roster.
                        </p>
                        {/* We would normally wire this up to a client component that calls the API we built */}
                        <Button variant="secondary" className="w-full">
                            <Copy className="w-4 h-4 mr-2" />
                            Generate Invite Link
                        </Button>
                    </div>
                </section>
            </div>

            <section className="space-y-4 pt-8">
                <h2 className="text-xl font-semibold">Current Members ({members?.length || 0})</h2>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Birthday</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {members?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No members found. Import some to get started!
                                    </td>
                                </tr>
                            ) : (
                                members?.map((member) => (
                                    <tr key={member.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{member.full_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{member.role_title || "-"}</td>
                                        <td className="px-4 py-3">
                                            {member.birth_month}/{member.birth_day}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
