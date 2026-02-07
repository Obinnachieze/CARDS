"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    Type, Image as ImageIcon, Smile,
    Palette, LayoutTemplate, Pencil, Upload,
    MousePointer2, Move, ChevronLeft, Search, Trash2, AlignLeft, AlignCenter, AlignRight, Loader2
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { fetchGoogleFonts, loadFont, GoogleFont } from "@/lib/google-fonts";

const colors = [
    "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f43f5e"
];

// Fallback fonts if API fails or while loading
const fallbackFonts = [
    "Inter", "Playfair Display", "Roboto", "Lato", "Montserrat", "Open Sans",
    "Dancing Script", "Pacifico", "Great Vibes", "Caveat"
];

type Tab = "templates" | "text" | "elements" | "uploads" | "draw" | "design";

export const Toolbar = () => {
    const {
        addElement,
        selectedElement,
        updateElement,
        removeElement,
        setBackgroundColor,
        backgroundColor,
        isDrawing,
        setIsDrawing,
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        currentFont,
        setCurrentFont
    } = useEditor();

    const [activeTab, setActiveTab] = useState<Tab | null>("templates");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Google Fonts State
    const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
    const [fontSearch, setFontSearch] = useState("");
    const [isLoadingFonts, setIsLoadingFonts] = useState(false);
    const [fontError, setFontError] = useState<string | null>(null);

    // Fetch fonts on mount
    useEffect(() => {
        const loadFonts = async () => {
            setIsLoadingFonts(true);
            setFontError(null);
            const { items, error } = await fetchGoogleFonts();
            if (error) {
                console.error("Font loading error:", error);
                setFontError(error);
            }
            if (items && items.length > 0) {
                setGoogleFonts(items);
            }
            setIsLoadingFonts(false);
        };
        loadFonts();
    }, []);

    // Filtered fonts
    const filteredFonts = useMemo(() => {
        if (!googleFonts.length) return fallbackFonts;
        const search = fontSearch.toLowerCase();
        return googleFonts
            .filter(f => f.family.toLowerCase().includes(search))
            .slice(0, 50); // Limit to top 50 matches for performance
    }, [googleFonts, fontSearch]);

    // Handle font selection
    const handleFontSelect = (family: string) => {
        loadFont(family);
        if (selectedElement) {
            updateElement(selectedElement.id, { fontFamily: family });
        } else {
            addElement("text", family, { fontFamily: family, fontSize: 32 });
        }
    };

    // Auto-load current font of selected element if needed
    useEffect(() => {
        if (selectedElement?.fontFamily) {
            loadFont(selectedElement.fontFamily);
        }
    }, [selectedElement?.fontFamily]);


    useEffect(() => {
        if (selectedElement?.type === "text") {
            setActiveTab("text");
        }
    }, [selectedElement?.id]);

    const handleAddEmoji = (emojiData: EmojiClickData) => {
        addElement("emoji", emojiData.emoji, { x: 50, y: 50 });
        setShowEmojiPicker(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    addElement("image", event.target.result as string, { x: 50, y: 50 });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const closePanel = () => setActiveTab(null);

    return (
        <div className="flex h-full z-40 relative">
            {/* Dark Icon Rail */}
            <div className="flex flex-col items-center w-[72px] py-4 bg-[#0e1318] text-white gap-2 z-50">
                <SidebarTab icon={<LayoutTemplate size={20} />} label="Design" active={activeTab === "design"} onClick={() => setActiveTab(activeTab === "design" ? null : "design")} />
                <SidebarTab icon={<LayoutTemplate size={20} />} label="Templates" active={activeTab === "templates"} onClick={() => setActiveTab(activeTab === "templates" ? null : "templates")} />
                <SidebarTab icon={<Type size={20} />} label="Text" active={activeTab === "text"} onClick={() => setActiveTab(activeTab === "text" ? null : "text")} />
                <SidebarTab icon={<Smile size={20} />} label="Elements" active={activeTab === "elements"} onClick={() => setActiveTab(activeTab === "elements" ? null : "elements")} />
                <SidebarTab icon={<Upload size={20} />} label="Uploads" active={activeTab === "uploads"} onClick={() => setActiveTab(activeTab === "uploads" ? null : "uploads")} />
                <SidebarTab icon={<Pencil size={20} />} label="Draw" active={activeTab === "draw"} onClick={() => setActiveTab(activeTab === "draw" ? null : "draw")} />
            </div>

            {/* Sliding Panel */}
            <div
                className={cn(
                    "absolute left-[72px] top-0 bottom-0 w-80 bg-white border-r shadow-xl transform transition-transform duration-300 ease-in-out z-40 overflow-hidden flex flex-col",
                    activeTab ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {activeTab && (
                    <>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-sm capitalize">{activeTab}</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            {/* Panel Content Based on Tab */}

                            {activeTab === "text" && (
                                <div className="space-y-6">
                                    {/* Edit Selected Text */}
                                    {selectedElement?.type === "text" && (
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4 mb-6">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-purple-900 font-semibold">Edit Text</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:bg-red-100"
                                                    onClick={() => removeElement(selectedElement.id)}
                                                    title="Delete Element"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>

                                            <Textarea
                                                value={selectedElement.content}
                                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                                className="bg-white"
                                            />

                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Font Size</Label>
                                                <Slider
                                                    value={[selectedElement.fontSize || 16]}
                                                    min={8}
                                                    max={120}
                                                    step={1}
                                                    onValueChange={(val) => updateElement(selectedElement.id, { fontSize: val[0] })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Color</Label>
                                                <ColorPicker color={selectedElement.color || "#000000"} onChange={(c) => updateElement(selectedElement.id, { color: c })} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Font Family</Label>
                                                {/* Using filtered list for dropdown too? Or simpler one? 
                                                     Let's stick to the list below for selection, or add a search here.
                                                     For now, simple select showing current + fallbacks + favorites? 
                                                     Actually, standard behavior is clicking the list below applies it.
                                                     The select here might be redundant if we have the list.
                                                     I'll render the current font name here.
                                                 */}
                                                <div className="border rounded-md p-2 text-sm bg-white truncate">
                                                    {selectedElement.fontFamily || "Inter"}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Add Text</Label>
                                        <Button className="w-full justify-start h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg" onClick={() => addElement("text", "Add a heading", { fontSize: 32, fontWeight: "bold" })}>
                                            Add a heading
                                        </Button>
                                        <Button className="w-full justify-start h-10 bg-gray-100 hover:bg-gray-200 text-black font-semibold text-base" onClick={() => addElement("text", "Add a subheading", { fontSize: 24, fontWeight: "semibold" })}>
                                            Add a subheading
                                        </Button>
                                        <Button className="w-full justify-start h-8 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm" onClick={() => addElement("text", "Add a little bit of body text", { fontSize: 16 })}>
                                            Add a little bit of body text
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                                Fonts ({googleFonts.length > 0 ? googleFonts.length : fallbackFonts.length})
                                            </Label>
                                            {isLoadingFonts && <Loader2 className="animate-spin text-purple-600" size={14} />}
                                        </div>

                                        <div className="bg-gray-100 p-2 rounded-md flex flex-col gap-2 sticky top-0 z-10">
                                            <div className="flex gap-2 items-center">
                                                <Search size={16} className="text-gray-400" />
                                                <input
                                                    className="bg-transparent text-sm w-full outline-none"
                                                    placeholder="Type to search fonts..."
                                                    value={fontSearch}
                                                    onChange={(e) => setFontSearch(e.target.value)}
                                                />
                                            </div>
                                            {fontError && (
                                                <div className="text-[10px] text-red-500 bg-red-50 p-1 rounded border border-red-100 break-words">
                                                    {fontError}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 min-h-[100px]">
                                            {filteredFonts.length === 0 ? (
                                                <div className="text-center py-8 text-gray-400 text-xs text-balance px-4">
                                                    No fonts found matching "{fontSearch}". <br />Try "Roboto", "Open Sans", "Lato"...
                                                </div>
                                            ) : (
                                                filteredFonts.map((font, index) => {
                                                    const familyName = typeof font === 'string' ? font : font.family;
                                                    // Auto-load visible fonts (top 10)
                                                    if (index < 10) loadFont(familyName);

                                                    return (
                                                        <Button
                                                            key={familyName}
                                                            variant="outline"
                                                            className="h-12 justify-start px-3 overflow-hidden hover:bg-gray-50 bg-white border-gray-200 w-full text-left font-normal group relative"
                                                            onClick={() => handleFontSelect(familyName)}
                                                            onMouseEnter={() => loadFont(familyName)}
                                                        >
                                                            <span className="truncate text-lg group-hover:text-purple-600 transition-colors" style={{ fontFamily: familyName }}>{familyName}</span>
                                                            {/* <div className="absolute right-2 opacity-0 group-hover:opacity-100 text-xs text-gray-400 bg-white px-1">Apply</div> */}
                                                        </Button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "elements" && (
                                <div className="space-y-6">
                                    <div className="bg-gray-100 p-2 rounded-md flex gap-2">
                                        <Search size={16} className="text-gray-400 mt-1" />
                                        <input className="bg-transparent text-sm w-full outline-none" placeholder="Search elements" />
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 h-10"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <Smile size={18} /> {showEmojiPicker ? "Close Emoji Picker" : "Open Emoji Picker"}
                                    </Button>
                                    {showEmojiPicker && (
                                        <div className="border rounded-lg shadow-sm">
                                            <EmojiPicker onEmojiClick={handleAddEmoji} width="100%" height={350} />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Shapes</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="aspect-square bg-gray-200 rounded-sm cursor-pointer hover:bg-gray-300" onClick={() => addElement("text", "", { width: 100, height: 100, backgroundColor: "#000" })} />
                                            <div className="aspect-square bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300" />
                                            <div className="aspect-square bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300" />
                                            <div className="aspect-square border-2 border-gray-400 rounded-sm cursor-pointer hover:bg-gray-100" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "uploads" && (
                                <div className="space-y-6">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                        <Label htmlFor="image-upload" className="cursor-pointer w-full h-full flex items-center justify-center gap-2 text-white">
                                            <Upload size={18} />
                                            Upload files
                                            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </Label>
                                    </Button>

                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                                        <p>No uploads yet</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "draw" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label>Drawing Mode</Label>
                                        <Button
                                            size="sm"
                                            variant={isDrawing ? "default" : "secondary"}
                                            onClick={() => setIsDrawing(!isDrawing)}
                                            className={isDrawing ? "bg-purple-600 hover:bg-purple-700" : ""}
                                        >
                                            {isDrawing ? "Active" : "Disabled"}
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Brush Color</Label>
                                        <ColorPicker color={brushColor} onChange={setBrushColor} />
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Brush Size: {brushSize}px</Label>
                                        <Slider
                                            value={[brushSize]}
                                            min={1}
                                            max={50}
                                            step={1}
                                            onValueChange={(vals) => setBrushSize(vals[0])}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "design" && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Background Color</Label>
                                        <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                                    </div>
                                </div>
                            )}

                            {activeTab === "templates" && (
                                <div className="space-y-4">
                                    <div className="bg-gray-100 p-2 rounded-md flex gap-2">
                                        <Search size={16} className="text-gray-400 mt-1" />
                                        <input className="bg-transparent text-sm w-full outline-none" placeholder="Search templates" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Birthday", "Wedding", "Party", "Thank You"].map((t, i) => (
                                            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-md hover:ring-2 ring-purple-500 cursor-pointer flex items-center justify-center text-xs text-gray-500 font-medium">
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </ScrollArea>
                    </>
                )}
            </div>

        </div>
    );
};

const SidebarTab = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center w-full py-3 transition-colors relative group",
            active ? "text-white bg-gray-800" : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}
    >
        <div className={cn("mb-1", active ? "text-purple-400" : "")}>{icon}</div>
        <span className="text-[10px] font-medium">{label}</span>
        {active && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500" />}
    </button>
);

const ColorPicker = ({ color, onChange }: { color: string, onChange: (c: string) => void }) => (
    <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
            <button
                key={c}
                className={cn(
                    "w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110",
                    color === c && "ring-2 ring-offset-1 ring-purple-600"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
                title={c}
            />
        ))}
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gradient-to-br from-red-500 via-green-500 to-blue-500">
            <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
        </div>

    </div>
);
