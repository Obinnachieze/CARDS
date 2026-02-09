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
        createNewProject, saveCurrentProject,
        exportProjectAsJSON, importProjectFromJSON,
        downloadAsImage,
        currentProjectId
    } = useEditor();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importProjectFromJSON(file);
        }
    };

    return (
        <header className="h-14 bg-gradient-to-r from-purple-950 via-black to-purple-950 flex items-center justify-between px-4 text-white border-b border-white/10">
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                            <Menu size={20} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-gray-900 border-gray-800 text-white">
                        <DropdownMenuLabel>File</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem onClick={createNewProject} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                            <FilePlus size={16} className="mr-2" />
                            <span>New Design</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                            <FolderOpen size={16} className="mr-2" />
                            <span>Open...</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                            onClick={saveCurrentProject}
                            disabled={!currentProjectId}
                            className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer disabled:opacity-50"
                        >
                            <Save size={16} className="mr-2" />
                            <span>Save</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportProjectAsJSON} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                            <FileJson size={16} className="mr-2" />
                            <span>Save to File (JSON)</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                            onClick={downloadAsImage}
                            className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                        >
                            <Download size={16} className="mr-2" />
                            <span>Download Image</span>
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

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                        className="hover:bg-white/10 text-white disabled:opacity-30"
                    >
                        <Undo2 size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                        className="hover:bg-white/10 text-white disabled:opacity-30"
                    >
                        <Redo2 size={18} />
                    </Button>
                </div>
                <div className="h-4 w-px bg-gray-600 mx-2" />
                <div className="text-sm font-medium text-white/90 capitalize">
                    {type} - Card Design
                </div>
                <Cloud size={16} className="text-white/50 ml-2" />
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                    onClick={onPreview}
                >
                    <FileText size={16} className="mr-2" /> Preview
                </Button>

                <ShareDialog />
                <div className="h-4 w-px bg-gray-700 mx-2" />
                <UserAvatar />
            </div>
        </header>
    );
};
