import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { redirect } from "next/navigation";

// Get the user's actual organization
async function getUserOrg() {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) redirect("/login?callbackUrl=/dashboard/settings");

    const { data } = await supabaseAuth.from("organizations").select("id, name, settings").eq("owner_id", user.id).limit(1).single();
    if (!data) redirect("/onboarding");
    return data;
}

export default async function SettingsPage() {
    const org = await getUserOrg();

    if (!org) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
                <p className="text-muted-foreground">Please create an organization first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Template Settings</h1>
                <p className="text-muted-foreground">
                    Configure the default automated birthday card template for {org.name}.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <section className="space-y-4">
                    <div className="p-6 border border-white/10 rounded-xl bg-white/5 shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold">Active Template</h2>
                        <p className="text-sm text-muted-foreground">
                            Define the default JSON canvas template used when generating standard birthday cards.
                            Tokens like {'{{member.full_name}}'} and {'{{org.name}}'} will be automatically replaced.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="template-json">Canvas JSON Definition</Label>
                            <Textarea
                                id="template-json"
                                className="font-mono text-xs h-64 bg-black/20 border-white/10 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-purple-500/50"
                                defaultValue={JSON.stringify({
                                    layers: [
                                        { type: 'text', id: 'greeting', content: 'Happy Birthday, {{member.full_name}}!' },
                                        { type: 'text', id: 'role', content: '{{member.role_title}} at {{org.name}}' },
                                        { type: 'text', id: 'message', content: '{{ai_generated_message}}' },
                                        { type: 'image', id: 'bg', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800' },
                                    ]
                                }, null, 2)}
                            />
                        </div>

                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Save Default Template</Button>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="p-6 border border-purple-500/20 rounded-xl bg-purple-500/5 shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
                        <p className="text-sm text-muted-foreground">
                            Configure how the Groq LLM generates your personalized birthday messages.
                        </p>

                        <div className="space-y-2">
                            <Label>System Prompt Additions</Label>
                            <Textarea
                                className="text-sm min-h-[100px] bg-black/20 border-white/10 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-purple-500/50"
                                placeholder="e.g. Always mention that there is cake in the breakroom."
                                defaultValue={org.settings?.ai_prompt_addition || ""}
                            />
                        </div>
                        <Button variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 bg-transparent">Update AI Settings</Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
