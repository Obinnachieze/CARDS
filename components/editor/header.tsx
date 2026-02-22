"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Undo2, Redo2, Cloud, FileText,
    Home, Save, Plus, Settings, Eye
} from "lucide-react";
import { useEditor } from "./editor-context";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { ShareDialog } from "./share-dialog";
import { SaveModal } from "./save-modal";
import { SettingsSidebar } from "./settings-sidebar";

export const Header = ({ onPreview }: { onPreview: () => void }) => {
    const params = useParams();
    const router = useRouter();
    const type = params?.type || "Untitled Design";
    const {
        undo, redo, canUndo, canRedo,
        saveCurrentProject, saveProjectAs,
        currentProjectId, projectName, createNewProject,
        cards, activeCardId, addCard, activateCard,
        workspaceProjects, activeWorkspaceIndex, switchToWorkspaceProject,
        isSettingsOpen, setIsSettingsOpen
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

    const handleModalSave = async (title: string) => {
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
            <div className="flex items-center gap-1 md:gap-3 min-w-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/10 text-white w-8 h-8 md:w-9 md:h-9 shrink-0"
                    onClick={() => router.push("/")}
                >
                    <Home size={18} />
                </Button>

                <div className="flex items-center gap-1 p-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                        className="h-7 w-7 md:h-8 md:w-8 hover:bg-white/10 text-white disabled:opacity-30 rounded-md"
                    >
                        <Undo2 size={14} />
                    </Button>
                    <div className="w-px h-4 bg-white/10" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                        className="h-7 w-7 md:h-8 md:w-8 hover:bg-white/10 text-white disabled:opacity-30 rounded-md"
                    >
                        <Redo2 size={14} />
                    </Button>
                </div>

                {/* Project Tabs (Rooms) */}
                <div className="hidden sm:flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/5 max-w-[180px] md:max-w-none overflow-x-auto scrollbar-hide">
                    {workspaceProjects.map((project, index) => (
                        <Button
                            key={project.id}
                            variant="ghost"
                            size="icon"
                            onClick={() => switchToWorkspaceProject(index)}
                            className={cn(
                                "h-7 w-7 md:h-8 md:w-8 rounded-md text-xs font-semibold transition-all shrink-0",
                                activeWorkspaceIndex === index
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                            title={project.name || `Card ${index + 1}`}
                        >
                            {index + 1}
                        </Button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={createNewProject}
                        className="h-7 w-7 md:h-8 md:w-8 hover:bg-white/10 text-white/60 hover:text-white rounded-md shrink-0"
                        title="Create New Card"
                    >
                        <Plus size={14} />
                    </Button>
                </div>

                {/* Title - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2 ml-1">
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-sm font-medium text-white/90 truncate max-w-xs">
                        {projectName ? projectName : defaultTitle}
                    </div>
                    <Cloud size={14} className="text-blue-400/80" />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <div />

                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/10 text-white border-0 md:border md:border-white/20 h-9 w-9 md:w-auto md:px-4 rounded-[5px] transition-all"
                    onClick={onPreview}
                >
                    <Eye size={16} className="md:mr-2" />
                    <span className="hidden md:inline">Preview</span>
                </Button>

                <ShareDialog />

                {/* Mobile Share Icon (if ShareDialog is complex, maybe just a simplified trigger?) 
                    For now assuming ShareDialog button fits or is icon-only capable. 
                    Let's just show avatar.
                */}
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <div className="hidden sm:block">
                    <UserAvatar />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "hover:bg-white/10 transition-colors w-8 h-8 md:w-9 md:h-9",
                        isSettingsOpen ? "text-purple-400" : "text-white/70 hover:text-white"
                    )}
                    title="Settings"
                    onClick={() => setIsSettingsOpen(true)}
                >
                    <Settings size={22} />
                </Button>
            </div>

            <SaveModal
                open={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleModalSave}
                defaultTitle={defaultTitle}
                isSaving={isSaving}
            />

            <SettingsSidebar
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSaveClick={() => setShowSaveModal(true)}
            />
        </header>
    );
};
