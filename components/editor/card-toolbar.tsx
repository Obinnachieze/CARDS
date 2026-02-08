"use client";

import React from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy, Palette } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPicker, colors } from "./color-picker";

export const CardToolbar = () => {
    const {
        selectedElementId,
        backgroundColor,
        setBackgroundColor,
        addCard,
        removeCard,
        duplicateCard,
        activeCardId
    } = useEditor();

    const currentFace = "front"; // Default or derived? CardToolbar is for the whole card

    // Only show when no element is selected
    if (selectedElementId) return null;

    const handleAddCard = () => {
        addCard();
    };

    const handleDeleteCard = () => {
        if (activeCardId) {
            removeCard(activeCardId);
        }
    };

    const handleDuplicateCard = () => {
        if (activeCardId) {
            duplicateCard(activeCardId);
        }
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-2 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-4">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-gray-100 text-gray-700"
                onClick={handleAddCard}
                title="Add New Card (Clear)"
            >
                <Plus size={20} />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-red-50 text-gray-700 hover:text-red-600"
                onClick={handleDeleteCard}
                title="Delete Card (Clear)"
            >
                <Trash2 size={20} />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-gray-100 text-gray-700"
                onClick={handleDuplicateCard}
                title="Duplicate Card"
            >
                <Copy size={20} />
            </Button>

            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className="w-8 h-8 rounded-full shadow-sm ml-1 ring-1 ring-gray-100 transition-transform hover:scale-105"
                        style={{ backgroundColor }}
                        title="Background Color"
                    />
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 shadow-xl border-0" side="bottom">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none text-sm">Background Color</h4>
                        <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
