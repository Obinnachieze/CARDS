'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveTemplateSettings, saveAISettings } from "./actions";

export default function SettingsPage({ org }: { org: any }) {
    const [templateJson, setTemplateJson] = useState(
        JSON.stringify(org.settings?.template || {
            layers: [
                { type: 'text', id: 'greeting', content: 'Happy Birthday, {{member.full_name}}!' },
                { type: 'text', id: 'role', content: '{{member.role_title}} at {{org.name}}' },
                { type: 'text', id: 'message', content: '{{ai_generated_message}}' },
                { type: 'image', id: 'bg', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800' },
            ]
        }, null, 2)
    );
    const [aiPrompt, setAiPrompt] = useState(org.settings?.ai_prompt_addition || "");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isSavingAI, setIsSavingAI] = useState(false);

    const handleSaveTemplate = async () => {
        setIsSavingTemplate(true);
        try {
            const json = JSON.parse(templateJson);
            const result = await saveTemplateSettings(json);
            if (result.error) throw new Error(result.error);
            toast.success("Template settings saved");
        } catch (err: any) {
            toast.error(err.message || "Invalid JSON format");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleSaveAI = async () => {
        setIsSavingAI(true);
        try {
            const result = await saveAISettings(aiPrompt);
            if (result.error) throw new Error(result.error);
            toast.success("AI assistant settings updated");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSavingAI(false);
        }
    };

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
                                value={templateJson}
                                onChange={(e) => setTemplateJson(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={handleSaveTemplate}
                            disabled={isSavingTemplate}
                        >
                            {isSavingTemplate ? "Saving..." : "Save Default Template"}
                        </Button>
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
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 bg-transparent"
                            onClick={handleSaveAI}
                            disabled={isSavingAI}
                        >
                            {isSavingAI ? "Updating..." : "Update AI Settings"}
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
