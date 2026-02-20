"use client";

import React from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, PartyPopper, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const EffectsSidebar = () => {
    const { activeCardId, cards, setCelebration } = useEditor();

    const activeCard = cards.find(c => c.id === activeCardId);
    if (!activeCard) return null;

    const currentEffect = activeCard.celebration || "none";
    const currentEmoji = activeCard.celebrationEmoji || "🎈";

    const effects = [
        { id: "none", label: "None", icon: <Zap size={20} /> },
        { id: "confetti", label: "Confetti", icon: <PartyPopper size={20} /> },
        { id: "fireworks", label: "Fireworks", icon: <Sparkles size={20} /> },
        { id: "floating-emoji", label: "Floating Emoji", icon: <span className="text-xl">{currentEmoji}</span> },
    ];

    const handleEffectSelect = (effectId: string) => {
        // If clicking floating-emoji again, ideally we open picker, but for now just set it.
        // The picker is separate interaction or automatic?
        // Let's make the entire button trigger the picker if it's already selected? 
        // Or better, just a separate picker trigger.
        setCelebration(activeCard.id, effectId as any);
        if (effectId === "floating-emoji" && !activeCard.celebrationEmoji) {
            setCelebration(activeCard.id, "floating-emoji", "🎈");
        }
    };

    const handleEmojiSelect = (emojiData: EmojiClickData) => {
        setCelebration(activeCard.id, "floating-emoji", emojiData.emoji);
        // Also close popover if we had one?
    };

    return (
        <div className="flex flex-col p-3">
            <div className="flex items-center gap-2">
                {effects.map((effect) => {
                    if (effect.id === "floating-emoji") {
                        return (
                            <Popover key={effect.id}>
                                <PopoverTrigger asChild>
                                    <button
                                        onClick={() => handleEffectSelect(effect.id)}
                                        title={effect.label}
                                        className={cn(
                                            "p-3 rounded-xl transition-all",
                                            currentEffect === effect.id
                                                ? "bg-purple-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        {effect.icon}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0 border-none">
                                    <EmojiPicker onEmojiClick={handleEmojiSelect} width="100%" height={300} />
                                </PopoverContent>
                            </Popover>
                        )
                    }

                    return (
                        <button
                            key={effect.id}
                            onClick={() => handleEffectSelect(effect.id)}
                            title={effect.label}
                            className={cn(
                                "p-3 rounded-xl transition-all",
                                currentEffect === effect.id
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            )}
                        >
                            {effect.icon}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
