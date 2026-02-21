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

    const fetchGiphy = async (query: string, isLoadMore = false) => {
        const currentOffset = isLoadMore ? offset + 20 : 0;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setOffset(0);
        }

        setError(null);
        try {
            const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}&offset=${currentOffset}&limit=20`);
            const data = await res.json();

            if (data.data) {
                if (isLoadMore) {
                    setStickers(prev => [...prev, ...data.data]);
                } else {
                    setStickers(data.data);
                }
                setOffset(currentOffset);
                setHasMore(data.pagination.total_count > currentOffset + 20);
            } else {
                setError("Failed to fetch stickers");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGiphy(search);
        }, 500);
        return () => clearTimeout(timer);
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
        <div className="flex flex-col h-full w-full bg-white">
            <Tabs defaultValue="stickers" className="w-full h-full flex flex-col">
                <div className="px-4 py-2 border-b border-border/40">
                    <TabsList className="w-full grid grid-cols-2 bg-zinc-100 border border-border/40">
                        <TabsTrigger value="stickers" className="text-xs uppercase font-bold tracking-tight data-[state=active]:text-purple-600">Stickers</TabsTrigger>
                        <TabsTrigger value="emojis" className="text-xs uppercase font-bold tracking-tight data-[state=active]:text-purple-600">Emojis</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="stickers" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col bg-white">
                    <div className="p-3 border-b border-border/40 bg-zinc-50/50">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-500 transition-colors" />
                            <Input
                                placeholder="Search GIPHY Stickers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white border-zinc-200 rounded-xl text-xs h-9 focus-visible:ring-1 focus-visible:ring-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 w-full bg-zinc-50/30">
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
                                    {stickers.map((sticker) => (
                                        <button
                                            key={sticker.id}
                                            className="aspect-square relative hover:scale-105 transition-all p-1 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-zinc-100 active:scale-95 overflow-hidden"
                                            onClick={() => onStickerClick(sticker.images.fixed_height.url)}
                                        >
                                            <img
                                                src={sticker.images.fixed_height_small.url}
                                                alt={sticker.title}
                                                className="w-full h-full object-contain pointer-events-none"
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error("Sticker load error:", sticker.id);
                                                    e.currentTarget.style.opacity = "0.3";
                                                }}
                                            />
                                        </button>
                                    ))}
                                    {hasMore && (
                                        <div className="col-span-3 py-6 flex justify-center border-t border-zinc-100 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-purple-600 hover:bg-zinc-50 border-zinc-200 h-9 px-4 rounded-xl"
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

                <TabsContent value="emojis" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col bg-white">
                    <div className="w-full h-full emoji-picker-container bg-white">
                        <style jsx global>{`
                            .emoji-picker-container aside.EmojiPickerReact {
                                border: none !important;
                                background-color: white !important;
                                --epr-bg-color: white !important;
                                --epr-category-label-bg-color: white !important;
                                --epr-picker-border-color: transparent !important;
                                --epr-search-input-bg-color: #f4f4f5 !important;
                            }
                            /* Force light mode styles for the picker even if system is dark */
                            .emoji-picker-container aside.EmojiPickerReact .epr-header-overlay {
                                background-color: white !important;
                            }
                        `}</style>
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                            theme={Theme.LIGHT}
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
