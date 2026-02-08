"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Menu, Undo2, Redo2, Cloud, FileText,
    Share2, Crown
} from "lucide-react";
import { useEditor } from "./editor-context";
import { useParams } from "next/navigation";
import { UserAvatar } from "./user-avatar";

export const Header = ({ onPreview }: { onPreview: () => void }) => {
    const params = useParams();
    const type = params?.type || "Untitled Design";
    const { undo, redo, canUndo, canRedo } = useEditor();

    return (
        <header className="h-14 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-between px-4 text-white border-b border-white/10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                    <Menu size={20} />
                </Button>
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
                <div className="h-4 w-[1px] bg-gray-600 mx-2" />
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

                <Button className="bg-white text-black hover:bg-gray-100 font-semibold gap-2">
                    Share
                </Button>
                <div className="h-4 w-[1px] bg-gray-700 mx-2" />
                <UserAvatar />
            </div>
        </header>
    );
};
