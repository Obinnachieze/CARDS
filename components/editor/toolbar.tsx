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
    Type, Image as ImageIcon, Smile, Shapes,
    Palette, LayoutTemplate, Pencil, Upload, PenTool, Highlighter, Eraser,
    MousePointer2, Move, ChevronLeft, Search, Trash2, AlignLeft, AlignCenter, AlignRight, Loader2,
    FolderOpen, Save, Download, FilePlus, Star
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { fetchGoogleFonts, loadFont, GoogleFont } from "@/lib/google-fonts";
import { ColorPicker, colors } from "./color-picker";
import { EffectsSidebar } from "./effects-sidebar";
import { Sparkles } from "lucide-react";
import { MusicSidebar, MusicIcon } from "./music-sidebar";
import { StickerSidebar } from "./sticker-sidebar";

const ShapeButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
        className="aspect-square bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg flex items-center justify-center p-2 transition-colors group"
        onClick={onClick}
        title={title}
    >
        <div className="w-full h-full text-gray-800 group-hover:text-black transition-colors">
            {children}
        </div>
    </button>
);


// Fallback fonts if API fails or while loading
const fallbackFonts = [
    "Inter", "Playfair Display", "Roboto", "Lato", "Montserrat", "Open Sans",
    "Dancing Script", "Pacifico", "Great Vibes", "Caveat"
];

import { templates } from "./templates";


const SidebarTab = ({ icon, label, active, onClick, onMouseEnter }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, onMouseEnter?: () => void }) => (
    <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
            "flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1 transition-colors relative group rounded-xl",
            active ? "text-purple-600 bg-purple-50" : "text-gray-500 hover:text-purple-600 hover:bg-purple-50/50"
        )}
    >
        <div className={cn("mb-0.5", active ? "text-purple-600" : "")}>{icon}</div>
        <span className="text-[9px] font-medium leading-tight">{label}</span>
        {active && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600 rounded-t-full" />}
    </button>
);




export const Toolbar = () => {
    const {
        addElement,
        activeCardId,
        cards,
        setCards,
        addCard,
        selectedElement,
        updateElement,
        removeElement,
        undo,
        redo,
        saveProjectAs,
        projects,
        loadProject,
        deleteProject,
        setBackgroundColor,
        backgroundColor,
        currentFont,
        setCurrentFont,
        cardMode,
        setCardMode,
        isDrawing,
        setIsDrawing,
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        brushType,
        setBrushType,
        setCelebration,
        activeTool: activeTab,
        setActiveTool: setActiveTab,
        isSettingsOpen,
        setIsSettingsOpen
    } = useEditor();

    // const [activeTab, setActiveTab] = useState<Tab | "projects" | null>("templates"); // Removed local state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Google Fonts State
    const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
    const [fontSearch, setFontSearch] = useState("");
    const [isLoadingFonts, setIsLoadingFonts] = useState(false);
    const [fontError, setFontError] = useState<string | null>(null);

    // loadTemplate logic removed - moved to SettingsSidebar

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
        } else if (selectedElement?.type === "line" || selectedElement?.type === "shape") {
            setActiveTab("elements");
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

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleUploadClick = () => {
        setActiveTab(null);
        setIsSettingsOpen(false);
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col md:flex-col z-40 relative shrink-0">
            {/* Universal Bottom Dock */}
            <div className="fixed bottom-2 left-1/2 -translate-x-1/2 h-14 bg-white/95 backdrop-blur-md border border-gray-200/60 flex items-center justify-around px-2 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl w-[calc(100%-16px)] max-w-lg md:max-w-4xl md:h-12 md:px-4">
                <SidebarTab icon={<LayoutTemplate size={20} />} label="Color" active={activeTab === "design"} onClick={() => { setIsSettingsOpen(false); setActiveTab(activeTab === "design" ? null : "design"); }} />
                <SidebarTab icon={<Type size={20} />} label="Text" active={activeTab === "text"} onClick={() => { setIsSettingsOpen(false); if (activeTab !== "text") { addElement("text", "Your text here", { fontSize: 24 }); setActiveTab("text"); } else { setActiveTab(null); } }} />
                <SidebarTab icon={<Smile size={20} />} label="Emojis" active={activeTab === "elements"} onClick={() => { setIsSettingsOpen(false); setActiveTab(activeTab === "elements" ? null : "elements"); }} />
                <SidebarTab icon={<Upload size={20} />} label="Uploads" active={false} onClick={handleUploadClick} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <SidebarTab icon={<Highlighter size={20} />} label="Draw" active={activeTab === "draw"} onClick={() => { setIsSettingsOpen(false); setActiveTab(activeTab === "draw" ? null : "draw"); }} />
                <SidebarTab icon={<Sparkles size={20} />} label="Effects" active={activeTab === "effects"} onClick={() => { setIsSettingsOpen(false); setActiveTab(activeTab === "effects" ? null : "effects"); }} />
                <SidebarTab icon={<MusicIcon size={20} />} label="Audio" active={activeTab === "music"} onClick={() => { setIsSettingsOpen(false); setActiveTab(activeTab === "music" ? null : "music"); }} />
            </div>

            {/* Sliding Panel */}
            <div
                className={cn(
                    "fixed bg-white shadow-xl transform transition-all duration-300 ease-in-out z-40 overflow-hidden flex flex-col rounded-2xl",
                    // Floating panel centered above the dock
                    "bottom-[76px] left-2 right-2 max-h-[50vh] md:max-h-[70vh] md:bottom-[76px]",
                    "md:left-1/2 md:-translate-x-1/2 md:right-auto",
                    activeTab && ["draw", "effects", "music"].includes(activeTab) ? "md:w-fit" : "md:w-96",
                    activeTab ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                )}
            >                        {activeTab && activeTab !== "music" && (
                <>
                    <div className="flex items-center justify-between p-2 md:hidden">
                        <div className="w-8" />
                        <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closePanel}>
                            <ChevronLeft size={14} className="-rotate-90" />
                        </Button>
                    </div>

                    {/* Content Layout */}
                    <div className="flex overflow-hidden">

                        <ScrollArea className="p-4 bg-white max-h-[inherit] w-full">
                            {/* Panel Content Based on Tab */}

                            {activeTab === "text" && (
                                <div className="space-y-3">
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
                                                        className="h-12 justify-start px-3 overflow-hidden hover:bg-gray-50 bg-white shadow-sm border-0 w-full text-left font-normal group relative"
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
                            )}

                            {activeTab === "elements" && (
                                <div>
                                    <EmojiPicker
                                        onEmojiClick={(emojiData: EmojiClickData) => {
                                            addElement("text", emojiData.emoji, { fontSize: 48 });
                                        }}
                                        width="100%"
                                        height={250}
                                        skinTonesDisabled
                                        searchPlaceHolder="Search emojis..."
                                    />
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

                            {/* Projects and Templates moved to SettingsSidebar */}

                            {activeTab === "draw" && (
                                <div className="flex items-center gap-2 flex-wrap p-2">
                                    <button
                                        className={cn("p-3 rounded-xl transition-all", !isDrawing ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                        onClick={() => setIsDrawing(false)}
                                        title="Select / Move"
                                    >
                                        <MousePointer2 size={20} />
                                    </button>
                                    <button
                                        className={cn("p-3 rounded-xl transition-all", isDrawing && brushType === "pencil" ? "bg-red-500 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                        onClick={() => { setBrushType("pencil"); setIsDrawing(true); }}
                                        title="Pencil"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        className={cn("p-3 rounded-xl transition-all", isDrawing && brushType === "marker" ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                        onClick={() => { setBrushType("marker"); setIsDrawing(true); }}
                                        title="Marker"
                                    >
                                        <PenTool size={20} />
                                    </button>
                                    <button
                                        className={cn("p-3 rounded-xl transition-all", isDrawing && brushType === "highlighter" ? "bg-yellow-500 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                        onClick={() => { setBrushType("highlighter"); setIsDrawing(true); }}
                                        title="Highlighter"
                                    >
                                        <Highlighter size={20} />
                                    </button>
                                    <button
                                        className={cn("p-3 rounded-xl transition-all", isDrawing && brushType === "eraser" ? "bg-gray-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                        onClick={() => { setBrushType("eraser"); setIsDrawing(true); }}
                                        title="Eraser"
                                    >
                                        <Eraser size={20} />
                                    </button>
                                </div>
                            )}
                            {activeTab === "design" && (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label>Background Color</Label>
                                        <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                                    </div>
                                </div>
                            )}

                            {/* Templates section moved to SettingsSidebar */}

                            {activeTab === "effects" && (
                                <EffectsSidebar />
                            )}

                        </ScrollArea>
                    </div>
                </>
            )
                }

                {
                    activeTab === "stickers" && (
                        <div className="flex flex-col w-full">
                            <div className="flex-1 overflow-hidden">
                                <StickerSidebar />
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === "music" && (
                        <div className="flex flex-col w-full">
                            <div className="flex-1 overflow-hidden">
                                <MusicSidebar />
                            </div>
                        </div>
                    )
                }
            </div >
            {/* End Sliding Panel */}
        </div >
    );
};


