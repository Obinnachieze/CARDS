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
        <div className="h-full flex flex-col gap-6 p-4">
            <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">Celebration Effects</h3>
                <p className="text-xs text-gray-500 mb-4">
                    Choose an effect to play when the recipient opens the card.
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {effects.map((effect) => {
                        if (effect.id === "floating-emoji") {
                            return (
                                <Popover key={effect.id}>
                                    <PopoverTrigger asChild>
                                        <button
                                            onClick={() => handleEffectSelect(effect.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                                currentEffect === effect.id
                                                    ? "border-purple-600 bg-purple-50 text-purple-700"
                                                    : "border-gray-100 bg-white hover:border-purple-200 text-gray-600 hover:text-purple-600"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                currentEffect === effect.id ? "bg-purple-100" : "bg-gray-100"
                                            )}>
                                                {effect.icon}
                                            </div>
                                            <span className="text-xs font-medium">{effect.label}</span>
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
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                    currentEffect === effect.id
                                        ? "border-purple-600 bg-purple-50 text-purple-700"
                                        : "border-gray-100 bg-white hover:border-purple-200 text-gray-600 hover:text-purple-600"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-full",
                                    currentEffect === effect.id ? "bg-purple-100" : "bg-gray-100"
                                )}>
                                    {effect.icon}
                                </div>
                                <span className="text-xs font-medium">{effect.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-xs italic border border-yellow-200">
                <Sparkles size={12} className="inline mr-1" />
                Pro Tip: Effects play automatically when the card is opened!
            </div>
        </div>
    );
};
