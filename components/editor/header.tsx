"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Undo2, Redo2, Cloud, FileText,
    Home, Save
} from "lucide-react";
import { useEditor } from "./editor-context";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "./user-avatar";
import { ShareDialog } from "./share-dialog";
import { SaveModal } from "./save-modal";

export const Header = ({ onPreview }: { onPreview: () => void }) => {
    const params = useParams();
    const router = useRouter();
    const type = params?.type || "Untitled Design";
    const {
        undo, redo, canUndo, canRedo,
        saveCurrentProject, saveProjectAs,
        currentProjectId
    } = useEditor();

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const defaultTitle = typeof type === "string"
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} Card`
        : "Untitled Card";

    const handleSave = () => {
        if (currentProjectId) {
            saveCurrentProject();
        } else {
            setShowSaveModal(true);
        }
    };

    const handleModalSave = async (title: string, creatorName: string) => {
        setIsSaving(true);
        try {
            await saveProjectAs(title);
            setShowSaveModal(false);
        } catch (e) {
            console.error("Save failed:", e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <header className="h-14 bg-gradient-to-r from-slate-900 to-slate-900 border-b border-white/10 flex items-center justify-between px-3 md:px-4 text-white z-50 relative">
            <div className="flex items-center gap-2 md:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/10 text-white w-9 h-9"
                    onClick={() => router.push("/")}
                    title="Go to Homepage"
                >
                    <Home size={20} />
                </Button>

                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                        className="h-8 w-8 hover:bg-white/10 text-white disabled:opacity-30 rounded-md"
                    >
                        <Undo2 size={16} />
                    </Button>
                    <div className="w-px h-4 bg-white/10" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                        className="h-8 w-8 hover:bg-white/10 text-white disabled:opacity-30 rounded-md"
                    >
                        <Redo2 size={16} />
                    </Button>
                </div>

                {/* Title - Hidden on very small screens, truncate on mobile */}
                <div className="hidden xs:flex items-center gap-2 ml-1">
                    <div className="h-8 w-px bg-white/10 hidden sm:block" />
                    <div className="text-sm font-medium text-white/90 truncate max-w-[120px] sm:max-w-xs">
                        {type}
                    </div>
                    <Cloud size={14} className="text-blue-400/80 hidden sm:block" />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/10 text-white h-9 px-3 md:px-4 rounded-full"
                    onClick={handleSave}
                    title="Save"
                >
                    <Save size={16} className="md:mr-2" />
                    <span className="hidden md:inline">Save</span>
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 h-9 px-3 md:px-4 rounded-full shadow-lg shadow-purple-900/20"
                    onClick={onPreview}
                >
                    <FileText size={16} className="md:mr-2" />
                    <span className="hidden md:inline">Preview</span>
                </Button>

                <ShareDialog />

                {/* Mobile Share Icon (if ShareDialog is complex, maybe just a simplified trigger?) 
                    For now assuming ShareDialog button fits or is icon-only capable. 
                    Let's just show avatar.
                */}
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <UserAvatar />
            </div>

            <SaveModal
                open={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleModalSave}
                defaultTitle={defaultTitle}
                isSaving={isSaving}
            />
        </header>
    );
};
