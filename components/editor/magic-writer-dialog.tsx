"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, RefreshCw, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MagicWriterDialogProps {
    onInsert: (text: string) => void;
    initialText?: string;
    mode?: "generate" | "rewrite";
}

export function MagicWriterDialog({ onInsert, initialText = "", mode = "generate" }: MagicWriterDialogProps) {
    const [prompt, setPrompt] = useState(initialText);
    const [tone, setTone] = useState("fun and witty");
    const [generatedText, setGeneratedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!prompt) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: mode === "rewrite" ? prompt : prompt, // prompt acts as source text in rewrite mode
                    tone,
                    mode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate text");
            }

            setGeneratedText(data.text);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsert = () => {
        onInsert(generatedText);
        setIsOpen(false);
        setGeneratedText("");
        setPrompt("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-900/50"
                    title="AI Magic Writer"
                >
                    <Wand2 size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0c0c0e] text-zinc-100 border-white/10 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-purple-400">
                        <Wand2 size={20} />
                        {mode === "rewrite" ? "AI Smart Assistant" : "AI Magic Writer"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {mode === "rewrite"
                            ? "Rewriting your message into a different tone."
                            : "Describe what you want to say, and let AI write it for you."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="prompt" className="text-zinc-300">
                            {mode === "rewrite" ? "Your Message" : "What's the occasion?"}
                        </Label>
                        <Textarea
                            id="prompt"
                            placeholder={mode === "rewrite" ? "Your current text..." : "e.g. A funny birthday wish for my brother who loves pizza..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="bg-zinc-950 border-white/10 text-zinc-100 min-h-[80px] focus-visible:ring-purple-500 placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-300">Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="bg-zinc-950 border-white/10 text-zinc-100">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="fun and witty">Fun & Witty</SelectItem>
                                <SelectItem value="heartfelt and emotional">Heartfelt & Emotional</SelectItem>
                                <SelectItem value="professional and formal">Professional & Formal</SelectItem>
                                <SelectItem value="short and punchy">Short & Punchy</SelectItem>
                                <SelectItem value="poetic and rhyming">Poetic & Rhyming</SelectItem>
                                <SelectItem value="sarcastic">Sarcastic</SelectItem>
                                <SelectItem value="shakespearean">Shakespearean</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    {generatedText && (
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-md">
                            <p className="text-sm italic text-zinc-200">"{generatedText}"</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    {!generatedText ? (
                        <Button
                            onClick={handleGenerate}
                            disabled={!prompt || isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === "rewrite" ? "Rewriting..." : "Writing Magic..."}
                                </>
                            ) : (
                                mode === "rewrite" ? "Rewrite Message" : "Generate"
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5 hover:text-white text-zinc-400"
                                onClick={handleGenerate}
                                disabled={isLoading}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={handleInsert}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Insert
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
