"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Globe, AlertCircle, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor } from "./editor-context";
import { useParams } from "next/navigation";

export function ShareDialog() {
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { currentProjectId, saveCurrentProject, saveProjectAs } = useEditor();
    const params = useParams();
    const type = params?.type || "Untitled Design";

    const isSaved = !!currentProjectId;

    // Only generate a real-looking URL when the project has been saved
    const shareUrl = isSaved && typeof window !== "undefined"
        ? `${window.location.origin}/share/${currentProjectId}`
        : "";

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        setError(null);
        setIsSaving(true);
        try {
            if (currentProjectId) {
                await saveCurrentProject();
            }
            handleCopy();
        } catch (e) {
            console.error("Share failed:", e);
            setError("Failed to save project. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndShare = async () => {
        setError(null);
        setIsSaving(true);
        try {
            const projectName = typeof type === "string"
                ? `${type.charAt(0).toUpperCase() + type.slice(1)} Card`
                : "Untitled Card";
            await saveProjectAs(projectName);
            // After saving, the component will re-render with currentProjectId set,
            // and the user can then copy the link. We could auto-copy here if we wanted,
            // but waiting for the UI to update is safer.
        } catch (e) {
            console.error("Save failed:", e);
            setError("Failed to create project. Please check if Supabase is configured.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-transparent sm:bg-white text-white sm:text-black hover:bg-white/10 sm:hover:bg-gray-200 font-semibold h-9 w-9 sm:w-auto px-0 sm:px-4 gap-2 rounded-full sm:rounded-md transition-all border-0 shadow-none sm:shadow-sm">
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white text-black border-gray-200">
                <DialogHeader>
                    <DialogTitle>Share design</DialogTitle>
                    <DialogDescription>
                        {isSaved
                            ? "Anyone with the link can view this design."
                            : "Save your project to generate a shareable link."}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {!isSaved ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <AlertCircle size={18} className="text-amber-600 shrink-0" />
                            <p className="text-sm text-amber-800">
                                Your project needs to be saved before you can share it.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                            onClick={handleSaveAndShare}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isSaving ? "Saving..." : "Save & Generate Link"}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">
                                    Link
                                </Label>
                                <Input
                                    id="link"
                                    value={shareUrl}
                                    readOnly
                                    className="bg-gray-50 border-gray-300 text-gray-900"
                                />
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="px-3 bg-purple-600 hover:bg-purple-700 text-white min-w-[80px]"
                                onClick={handleShare}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <span className="sr-only">Copy</span>
                                        {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Globe size={14} />
                                <span>Anyone with link can view</span>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
