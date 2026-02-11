"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor } from "./editor-context";

export function ShareDialog() {
    const [copied, setCopied] = useState(false);
    const { currentProjectId, saveCurrentProject } = useEditor();

    // Mock link generation pending backend connection
    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/share/${currentProjectId || "draft"}`
        : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        // In a real app, this would save the project to the database first
        if (currentProjectId) {
            console.log("Saving before share...");
            await saveCurrentProject();
        }
        handleCopy();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-gray-200 font-semibold h-9 w-9 sm:w-auto px-0 sm:px-4 gap-2 rounded-full sm:rounded-md transition-all">
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white text-black border-gray-200">
                <DialogHeader>
                    <DialogTitle>Share design</DialogTitle>
                    <DialogDescription>
                        Anyone with the link can view this design.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={shareUrl}
                            readOnly
                            className="bg-gray-50 border-gray-300 text-gray-900"
                        />
                    </div>
                    <Button type="button" size="sm" className="px-3 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleShare}>
                        <span className="sr-only">Copy</span>
                        {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Globe size={14} />
                        <span>Anyone with link can view</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
