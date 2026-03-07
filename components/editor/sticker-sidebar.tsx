"use client";

import React, { useState, useEffect } from "react";
import { useEditor } from "./editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";



export const StickerSidebar = () => {
    const { addElement } = useEditor();
    const { theme } = useTheme();
    const [search, setSearch] = useState("");
    const [stickers, setStickers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchGiphy = async (query: string, isLoadMore = false, signal?: AbortSignal) => {
        const currentOffset = isLoadMore ? offset + 20 : 0;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setOffset(0);
        }

        setError(null);
        try {
            const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}&offset=${currentOffset}&limit=20`, {
                signal
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch stickers");
            }

            if (data.data) {
                if (isLoadMore) {
                    setStickers(prev => [...prev, ...data.data]);
                } else {
                    setStickers(data.data);
                }
                setOffset(currentOffset);
                const totalCount = data.pagination?.total_count || 0;
                setHasMore(totalCount > currentOffset + 20);
            } else {
                setError("No stickers found");
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Giphy Fetch Error:", err);
                // Handle different error types
                if (err.message.includes("configured")) {
                    setError("GIPHY API key missing on server");
                } else if (err.message.includes("limit")) {
                    setError("Too many requests. Please try again later.");
                } else {
                    setError("Connection error. Please try again.");
                }
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetchGiphy(search, false, controller.signal);
        }, 500);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [search]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchGiphy(search, true);
        }
    };

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
        <div className="flex flex-col h-full w-full bg-zinc-950 border-r border-white/5">
            <Tabs defaultValue="stickers" className="w-full h-full flex flex-col">
                <div className="px-4 py-2 border-b border-border/40">
                    <TabsList className="w-full grid grid-cols-2 bg-white/5 border border-white/5">
                        <TabsTrigger value="stickers" className="text-xs uppercase font-bold tracking-tight data-[state=active]:text-purple-400">Stickers</TabsTrigger>
                        <TabsTrigger value="emojis" className="text-xs uppercase font-bold tracking-tight data-[state=active]:text-purple-400">Emojis</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="stickers" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col bg-zinc-950">
                    <div className="p-3 border-b border-white/5 bg-zinc-900/50">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                            <Input
                                placeholder="Search GIPHY Stickers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-zinc-950 border-white/10 rounded-xl text-xs h-9 focus-visible:ring-1 focus-visible:ring-purple-500 transition-all text-zinc-100 placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 w-full bg-zinc-950">
                        <div className="p-3 grid grid-cols-3 gap-2 pb-20">
                            {loading ? (
                                <div className="col-span-3 py-10 flex flex-col items-center gap-2 text-zinc-400">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Searching...</span>
                                </div>
                            ) : error ? (
                                <div className="col-span-3 py-10 text-center text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                                    {error}
                                </div>
                            ) : (
                                <>
                                    {stickers
                                        .filter(s => s.images?.fixed_height?.url && s.images?.fixed_height_small?.url)
                                        .map((sticker) => (
                                            <button
                                                key={sticker.id}
                                                className="aspect-square relative hover:scale-105 transition-all p-1 rounded-xl hover:bg-white/5 shadow-sm border border-transparent hover:border-white/10 active:scale-95 overflow-hidden"
                                                onClick={() => onStickerClick(sticker.images.fixed_height.url)}
                                            >
                                                <img
                                                    src={sticker.images.fixed_height_small.url}
                                                    alt={sticker.title}
                                                    className="w-full h-full object-contain pointer-events-none"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    {hasMore && (
                                        <div className="col-span-3 py-6 flex justify-center border-t border-white/5 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-purple-400 hover:bg-white/5 border-white/10 h-9 px-4 rounded-xl"
                                            >
                                                {loadingMore ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                                {loadingMore ? "Loading..." : "Load More Stickers"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="emojis" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col bg-zinc-950">
                    <div className="w-full h-full emoji-picker-container bg-zinc-950">
                        <style jsx global>{`
                            .emoji-picker-container aside.EmojiPickerReact {
                                border: none !important;
                                background-color: transparent !important;
                                --epr-bg-color: transparent !important;
                                --epr-category-label-bg-color: #09090b !important;
                                --epr-picker-border-color: transparent !important;
                                --epr-search-input-bg-color: #18181b !important;
                                --epr-highlight-color: #a855f7 !important;
                            }
                            .emoji-picker-container aside.EmojiPickerReact .epr-header-overlay {
                                background-color: #09090b !important;
                            }
                        `}</style>
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                            theme={Theme.DARK}
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
