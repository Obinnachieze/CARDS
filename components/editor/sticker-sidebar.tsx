"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

// Curated list of "Stickers" (using public domain or reliable placeholder images for now)
// In a real app, this would come from a database or storage bucket.
const STICKER_PACKS = [
    {
        name: "Fun",
        stickers: [
            "https://cdn-icons-png.flaticon.com/512/742/742751.png", // Party
            "https://cdn-icons-png.flaticon.com/512/742/742923.png", // Heart
            "https://cdn-icons-png.flaticon.com/512/742/742774.png", // Star
            "https://cdn-icons-png.flaticon.com/512/742/742823.png", // Music
            "https://cdn-icons-png.flaticon.com/512/742/742940.png", // Sun
            "https://cdn-icons-png.flaticon.com/512/742/742861.png", // Cake
        ]
    },
    {
        name: "Decoration",
        stickers: [
            // Using some generic decorative shapes/icons
            "https://cdn-icons-png.flaticon.com/512/1067/1067353.png", // Ribbon
            "https://cdn-icons-png.flaticon.com/512/1067/1067584.png", // Balloon
            "https://cdn-icons-png.flaticon.com/512/1067/1067332.png", // Gift
        ]
    }
];

export const StickerSidebar = () => {
    const { addElement } = useEditor();
    const { theme } = useTheme();

    const onEmojiClick = (emojiData: EmojiClickData) => {
        addElement("text", emojiData.emoji, {
            fontSize: 64,
            width: 80,
            height: 80,
        });
    };

    const onStickerClick = (url: string) => {
        addElement("image", url, {
            width: 100,
            height: 100,
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-black border-r border-border">
            <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-lg">Stickers</h2>
                <p className="text-xs text-muted-foreground">Add fun elements to your card</p>
            </div>

            <Tabs defaultValue="emojis" className="w-full h-full flex flex-col">
                <div className="px-4 mt-2">
                    <TabsList className="w-full grid w-full grid-cols-2">
                        <TabsTrigger value="emojis">Emojis</TabsTrigger>
                        <TabsTrigger value="stickers">Stickers</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="emojis" className="flex-1 overflow-hidden mt-2 border-none p-0 data-[state=active]:flex">
                    <div className="w-full h-full sticker-picker-wrapper">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                            width="100%"
                            height="100%"
                            previewConfig={{ showPreview: false }}
                            lazyLoadEmojis={true}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="stickers" className="flex-1 overflow-hidden mt-2 border-none">
                    <ScrollArea className="h-full w-full px-4">
                        <div className="pb-20 space-y-6">
                            {STICKER_PACKS.map((pack) => (
                                <div key={pack.name} className="space-y-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground">{pack.name}</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {pack.stickers.map((stickerUrl, index) => (
                                            <button
                                                key={index}
                                                className="aspect-square relative hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-muted"
                                                onClick={() => onStickerClick(stickerUrl)}
                                            >
                                                <img
                                                    src={stickerUrl}
                                                    alt={`Sticker ${index}`}
                                                    className="w-full h-full object-contain pointer-events-none"
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
};
