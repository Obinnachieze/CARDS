"use client";

import React, { useState, useEffect } from "react";
import { useEditor } from "./editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "dc6zaTOxFJmzC"; // Default beta key if not provided
const RATE_LIMIT_COUNT = 100;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

export const StickerSidebar = () => {
    const { addElement } = useEditor();
    const { theme } = useTheme();
    const [search, setSearch] = useState("");
    const [stickers, setStickers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rateLimitReached, setRateLimitReached] = useState(false);

    // Rate limiting check
    const checkRateLimit = () => {
        const now = Date.now();
        const stored = localStorage.getItem("giphy_rate_limit");
        const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

        if (now > data.resetTime) {
            data.count = 0;
            data.resetTime = now + RATE_LIMIT_WINDOW_MS;
        }

        if (data.count >= RATE_LIMIT_COUNT) {
            setRateLimitReached(true);
            return false;
        }

        data.count += 1;
        localStorage.setItem("giphy_rate_limit", JSON.stringify(data));
        setRateLimitReached(false);
        return true;
    };

    const fetchGiphy = async (query: string, type: "stickers" | "gifs" = "stickers") => {
        if (!checkRateLimit()) return;

        setLoading(true);
        setError(null);
        try {
            const endpoint = query
                ? `https://api.giphy.com/v1/${type}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
                : `https://api.giphy.com/v1/${type}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;

            const res = await fetch(endpoint);
            const data = await res.json();
            if (data.data) {
                setStickers(data.data);
            } else {
                setError("Failed to fetch from Giphy");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGiphy(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        addElement("text", emojiData.emoji, {
            fontSize: 64,
            width: 80,
            height: 80,
        });
    };

    const onStickerClick = (url: string) => {
        addElement("image", url, {
            width: 150,
            height: 150,
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950">
            <Tabs defaultValue="stickers" className="w-full h-full flex flex-col">
                <div className="px-4 py-2 border-b border-border/40">
                    <TabsList className="w-full grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 border border-border/40">
                        <TabsTrigger value="stickers" className="text-xs uppercase font-bold tracking-tight">Stickers</TabsTrigger>
                        <TabsTrigger value="emojis" className="text-xs uppercase font-bold tracking-tight">Emojis</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="stickers" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col">
                    <div className="p-3 border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-500 transition-colors" />
                            <Input
                                placeholder="Search GIPHY Stickers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs h-9 focus-visible:ring-1 focus-visible:ring-purple-500 transition-all"
                            />
                        </div>
                        {rateLimitReached && (
                            <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg flex items-center gap-2 border border-amber-100 dark:border-amber-900/40">
                                <AlertCircle size={12} />
                                GIPHY limit reached (100/hr). Try again later.
                            </div>
                        )}
                    </div>

                    <ScrollArea className="flex-1 w-full bg-zinc-50/30 dark:bg-zinc-950/30">
                        <div className="p-3 grid grid-cols-3 gap-2">
                            {loading ? (
                                <div className="col-span-3 py-10 flex flex-col items-center gap-2 text-zinc-400">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Searching...</span>
                                </div>
                            ) : error ? (
                                <div className="col-span-3 py-10 text-center text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                                    {error}
                                </div>
                            ) : stickers.length === 0 ? (
                                <div className="col-span-3 py-10 text-center text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                                    No stickers found
                                </div>
                            ) : (
                                stickers.map((sticker) => (
                                    <button
                                        key={sticker.id}
                                        className="aspect-square relative hover:scale-105 transition-all p-1 rounded-xl hover:bg-white dark:hover:bg-zinc-900 shadow-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 active:scale-95 overflow-hidden"
                                        onClick={() => onStickerClick(sticker.images.fixed_height.url)}
                                    >
                                        <img
                                            src={sticker.images.fixed_height_small.url}
                                            alt={sticker.title}
                                            className="w-full h-full object-contain pointer-events-none"
                                            loading="lazy"
                                        />
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="emojis" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col">
                    <div className="w-full h-full emoji-picker-container bg-zinc-50/30 dark:bg-zinc-950/30">
                        <style jsx global>{`
                            .emoji-picker-container aside.EmojiPickerReact {
                                border: none !important;
                                background-color: transparent !important;
                                --epr-bg-color: transparent !important;
                                --epr-category-label-bg-color: transparent !important;
                                --epr-picker-border-color: transparent !important;
                            }
                        `}</style>
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                            width="100%"
                            height="100%"
                            previewConfig={{ showPreview: false }}
                            lazyLoadEmojis={true}
                            suggestedEmojisMode={undefined}
                            searchPlaceHolder="Search emojis..."
                            reactionsDefaultOpen={false}
                            skinTonesDisabled
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
