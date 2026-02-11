"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Menu, Undo2, Redo2, Cloud, FileText,
    Share2, Crown, FilePlus, FolderOpen, Save, FileJson, Image as ImageIcon, Download
} from "lucide-react";
import { useEditor } from "./editor-context";
import { useParams } from "next/navigation";
import { UserAvatar } from "./user-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef } from "react";
import { ShareDialog } from "./share-dialog";

export const Header = ({ onPreview }: { onPreview: () => void }) => {
    const params = useParams();
    const type = params?.type || "Untitled Design";
    const {
        undo, redo, canUndo, canRedo,
        createNewProject, saveCurrentProject, saveProjectAs,
        exportProjectAsJSON, importProjectFromJSON,
        downloadAsImage,
        currentProjectId
    } = useEditor();

    const handleSave = () => {
        if (currentProjectId) {
            saveCurrentProject();
        } else {
            // Auto-save new projects with a name derived from the card type
            const projectName = typeof type === "string"
                ? `${type.charAt(0).toUpperCase() + type.slice(1)} Card`
                : "Untitled Card";
            saveProjectAs(projectName);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importProjectFromJSON(file);
        }
    };

    return (
        <header className="h-14 bg-gradient-to-r from-slate-900 to-slate-900 border-b border-white/10 flex items-center justify-between px-3 md:px-4 text-white z-50 relative">
            <div className="flex items-center gap-2 md:gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white w-9 h-9">
                            <Menu size={20} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 bg-[#1e1e2e] border-gray-700 text-white p-2 rounded-xl shadow-2xl backdrop-blur-xl">
                        <DropdownMenuLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1.5">File Options</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700 mx-2 my-1" />
                        <DropdownMenuItem onClick={createNewProject} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 transition-colors gap-3">
                            <FilePlus size={18} className="text-purple-400" />
                            <span className="text-sm font-medium">New Design</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 transition-colors gap-3">
                            <FolderOpen size={18} className="text-blue-400" />
                            <span className="text-sm font-medium">Open Project</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700 mx-2 my-1" />
                        <DropdownMenuItem
                            onClick={handleSave}
                            className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 transition-colors gap-3"
                        >
                            <Save size={18} className="text-emerald-400" />
                            <span className="text-sm font-medium">{currentProjectId ? "Save" : "Save As"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportProjectAsJSON} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 transition-colors gap-3">
                            <FileJson size={18} className="text-amber-400" />
                            <span className="text-sm font-medium">Export JSON</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700 mx-2 my-1" />
                        <DropdownMenuItem
                            onClick={downloadAsImage}
                            className="hover:bg-white/10 focus:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 transition-colors gap-3"
                        >
                            <Download size={18} className="text-pink-400" />
                            <span className="text-sm font-medium">Download Image</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Hidden Input for Import */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />

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
                {/* Mobile: Icon only. Desktop: Text. */}
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
        </header>
    );
};
