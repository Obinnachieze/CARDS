"use client";

import { useState } from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Upload, Play, Pause, X } from "lucide-react";
import { cn } from "@/lib/utils";

const presetAudios = [
    { title: "Happy Birthday", src: "/music/happy-birthday.mp3", category: "Celebration" }, // Placeholder paths
    { title: "Romantic Piano", src: "/music/romantic.mp3", category: "Love" },
    { title: "Upbeat Pop", src: "/music/upbeat.mp3", category: "Fun" },
    { title: "Holiday Bells", src: "/music/bells.mp3", category: "Holidays" },
];

export const MusicIcon = Music;

// Note: In a real app, these would need to be actual files in public/music or hosted URLs.
// For now, we'll allow users to input a URL or simulate selection.

export function MusicSidebar() {
    const { cards, activeCardId, setAudio } = useEditor();
    const activeCard = cards.find((c) => c.id === activeCardId);
    const currentAudio = activeCard?.audioSrc;

    const [customUrl, setCustomUrl] = useState("");
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

    const handleSelectAudio = (src: string) => {
        if (activeCardId) {
            setAudio(activeCardId, src);
        }
    };

    const handleRemoveAudio = () => {
        if (activeCardId) {
            setAudio(activeCardId, undefined);
        }
    };

    const handleCustomUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customUrl && activeCardId) {
            setAudio(activeCardId, customUrl);
            setCustomUrl("");
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-600" />
                    Music & Audio
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Add background music to your card.
                </p>
            </div>

            <ScrollArea className="flex-1 p-4">
                {currentAudio && (
                    <div className="mb-6 p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <Label className="text-xs font-bold text-purple-900 uppercase mb-2 block">
                            Current Audio
                        </Label>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Music className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="text-sm truncate text-purple-700">
                                    {presetAudios.find(a => a.src === currentAudio)?.title || "Custom Audio"}
                                </span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={handleRemoveAudio}
                                title="Remove Audio"
                            >
                                <X size={14} />
                            </Button>
                        </div>
                        <audio controls className="w-full mt-2 h-8" src={currentAudio} />
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <Label className="text-sm font-medium mb-3 block">From Library</Label>
                        <div className="grid gap-2">
                            {presetAudios.map((audio) => (
                                <button
                                    key={audio.src}
                                    onClick={() => handleSelectAudio(audio.src)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                                        currentAudio === audio.src
                                            ? "border-purple-600 bg-purple-50"
                                            : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                                    )}
                                >
                                    <div>
                                        <div className="font-medium text-sm">{audio.title}</div>
                                        <div className="text-xs text-gray-500">{audio.category}</div>
                                    </div>
                                    {currentAudio === audio.src && (
                                        <div className="text-xs text-purple-600 font-bold px-2 py-1 bg-white rounded-md">
                                            Selected
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-3 block">Custom URL</Label>
                        <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                            <Input
                                placeholder="https://example.com/song.mp3"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                className="text-xs"
                            />
                            <Button type="submit" size="icon" variant="outline">
                                <Upload size={14} />
                            </Button>
                        </form>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Supported formats: MP3, WAV, OGG. Ensure you have rights to use the audio.
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
