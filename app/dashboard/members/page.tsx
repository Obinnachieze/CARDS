import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CsvImporter } from "@/components/dashboard/csv-importer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Copy } from "lucide-react";
import { DeleteMemberButton } from "@/components/dashboard/delete-member-button";
import { InviteMemberButton } from "@/components/dashboard/invite-member-button";

import { redirect } from "next/navigation";

// Get the user's actual organization
async function getUserOrg() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?callbackUrl=/dashboard/members");

    const supabaseAdmin = await createAdminClient();
    const { data } = await supabaseAdmin.from("organizations").select("id, name").eq("owner_id", user.id).limit(1).single();
    if (!data) redirect("/onboarding");
    return data;
}

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

    const { q } = await searchParams;
    const searchQuery = typeof q === 'string' ? q : '';

    const supabaseAdmin = await createAdminClient();
    let query = supabaseAdmin
        .from("members")
        .select("*")
        .eq("org_id", org.id)
        .order("created_at", { ascending: false });

    if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data: members } = await query;

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
                        <InviteMemberButton orgId={org.id} />
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
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {members?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No members found. Import some to get started!
                                    </td>
                                </tr>
                            ) : (
                                members?.map((member) => {
                                    const initials = member.full_name
                                        ? member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
                                        : member.email[0].toUpperCase();

                                    return (
                                        <tr key={member.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-white/10">
                                                    <AvatarFallback className="bg-purple-900 text-purple-200 text-xs">{initials}</AvatarFallback>
                                                </Avatar>
                                                {member.full_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{member.role_title || "-"}</td>
                                            <td className="px-4 py-3">
                                                {member.birth_month}/{member.birth_day}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DeleteMemberButton memberId={member.id} memberName={member.full_name || member.email} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
