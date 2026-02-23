"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Music, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/use-debounce";

interface Track {
    id: string;
    name: string;
    artist: string;
    albumArt: string;
    previewUrl: string;
    hasPreview: boolean;
}

interface SpotifySearchProps {
    onSelect: (track: Track) => void;
}

export function SpotifySearch({ onSelect }: SpotifySearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery.trim().length > 2) {
            handleSearch(debouncedQuery);
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    const handleSearch = async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.tracks) {
                setResults(data.tracks);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 bg-white border-purple-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-purple-400">
                        <Music className="w-6 h-6 animate-bounce" />
                    </div>
                ) : results.length > 0 ? (
                    results.map((track) => (
                        <button
                            key={track.id}
                            onClick={() => track.hasPreview && onSelect(track)}
                            disabled={!track.hasPreview}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-xl transition-all text-left group border border-transparent",
                                track.hasPreview
                                    ? "hover:bg-purple-50 hover:border-purple-100"
                                    : "opacity-60 cursor-not-allowed filter grayscale-[0.5]"
                            )}
                        >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                <img src={track.albumArt} alt={track.name} className="w-full h-full object-cover" />
                                {track.hasPreview && (
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-5 h-5 text-white fill-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-purple-900 truncate">{track.name}</div>
                                <div className="text-xs text-purple-600 truncate flex items-center justify-between gap-1">
                                    <span className="truncate">{track.artist}</span>
                                    {!track.hasPreview && (
                                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 font-bold uppercase tracking-tighter">
                                            No Audio
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                ) : query && !loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                        No songs found for "{query}"
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-xs">
                        Enter a song title or artist to begin
                    </div>
                )}
            </div>
        </div>
    );
}
