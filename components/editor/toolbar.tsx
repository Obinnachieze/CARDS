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
    FolderOpen, Save, Download, FilePlus, Star, Plus
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


const SidebarTab = ({ icon, label, active, onClick, onMouseEnter }: { icon: React.ReactNode, label: string, active: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, onMouseEnter?: () => void }) => (
    <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
            "flex flex-col items-center justify-center min-w-[48px] md:w-14 h-12 md:h-14 transition-all duration-300 relative group rounded-xl md:rounded-2xl",
            active
                ? "text-purple-600 bg-purple-50/80 scale-105"
                : "text-zinc-500 hover:text-purple-600 hover:bg-purple-50/40 hover:scale-105 active:scale-95"
        )}
        title={label}
    >
        <div className={cn("transition-transform duration-300 group-hover:-translate-y-1 scale-100 md:scale-110", active ? "text-purple-600" : "")}>{icon}</div>
        <span className="hidden md:block text-[9px] font-bold opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity text-purple-600 tracking-wide">{label}</span>
        {active && <div className="absolute -bottom-0.5 md:bottom-auto md:left-0 md:top-1/2 md:-translate-y-1/2 left-1/2 -translate-x-1/2 md:translate-x-0 w-1 md:w-1 md:h-6 h-1 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.5)]" />}
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
        setIsSettingsOpen,
        createNewProject,
        workspaceProjects,
        activeWorkspaceIndex,
        switchToWorkspaceProject
    } = useEditor();

    // const [activeTab, setActiveTab] = useState<Tab | "projects" | null>("templates"); // Removed local state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleTabClick = (tab: string, e: React.MouseEvent<HTMLButtonElement>) => {
        setIsSettingsOpen(false);
        setActiveTab(activeTab === tab ? null : tab as any);
    };

    // Click-away listener
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking the dock or the panel itself
            if (target.closest('.dock-container') || target.closest('.sliding-panel')) return;
            setActiveTab(null);
        };
        if (activeTab) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeTab]);

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
        if (selectedElement?.type === "text" && activeTab !== "stickers") {
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
    const handleUploadClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        setActiveTab(null);
        setIsSettingsOpen(false);
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col md:flex-col z-40 relative shrink-0 md:w-20 bg-white/95 md:bg-zinc-50 md:border-r border-zinc-200">
            {/* Universal Bottom Dock / Left Sidebar */}
            <div className="fixed bottom-0 left-0 w-full md:static md:w-full md:h-full md:flex border-t md:border-t-0 border-white/20 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:shadow-none bg-white/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none transition-all dock-container">
                <div className="flex w-full items-center justify-start overflow-x-auto scrollbar-hide px-2 md:px-0 md:py-6 md:flex-col md:items-center md:justify-start md:overflow-visible gap-1 md:gap-3 h-14 md:h-full mx-auto">
                    {/* New Card Button - Mobile Only */}
                    <div className="flex items-center md:hidden shrink-0">
                        <SidebarTab
                            icon={<Plus size={22} />}
                            label="New"
                            active={false}
                            onClick={() => createNewProject()}
                        />
                        <div className="w-px h-6 bg-zinc-200/50 mx-1" />
                    </div>

                    <SidebarTab icon={<Palette size={22} />} label="Color" active={activeTab === "design"} onClick={(e) => handleTabClick("design", e)} />
                    <SidebarTab icon={<Type size={22} />} label="Text" active={activeTab === "text"} onClick={(e) => {
                        setIsSettingsOpen(false);
                        if (activeTab !== "text") {
                            addElement("text", "Your text here", { fontSize: 32, fontFamily: "Inter", color: "#000000" });
                            setActiveTab("text");
                        } else {
                            setActiveTab(null);
                        }
                    }} />
                    <SidebarTab icon={<Smile size={22} />} label="Stickers" active={activeTab === "stickers"} onClick={(e) => handleTabClick("stickers", e)} />
                    <SidebarTab icon={<Upload size={22} />} label="Uploads" active={activeTab === "uploads"} onClick={handleUploadClick} />
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <SidebarTab icon={<Highlighter size={22} />} label="Draw" active={activeTab === "draw"} onClick={(e) => handleTabClick("draw", e)} />
                    <SidebarTab icon={<Sparkles size={22} />} label="Effects" active={activeTab === "effects"} onClick={(e) => handleTabClick("effects", e)} />
                    <SidebarTab icon={<MusicIcon size={22} />} label="Audio" active={activeTab === "music"} onClick={(e) => handleTabClick("music", e)} />
                </div>
            </div>

            {/* Sliding Panel */}
            <div
                className={cn(
                    "fixed bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out z-40 overflow-hidden flex flex-col rounded-t-3xl md:rounded-none border border-white/20 md:border-y-0 md:border-r md:border-l-0 md:border-zinc-200 sliding-panel",
                    // Mobile: Pops up from bottom. Desktop: Slides out from left sidebar
                    "bottom-14 max-h-[50vh]",
                    "md:bottom-0 md:top-0 md:left-20 md:translate-y-0 md:h-full md:max-h-full",
                    activeTab && ["draw", "effects", "music", "text"].includes(activeTab)
                        ? "left-1/2 -translate-x-1/2 w-[300px] md:translate-x-0 md:w-[320px]"
                        : "left-4 right-4 md:right-auto md:w-[320px] lg:w-[400px]",
                    activeTab
                        ? "translate-y-0 md:translate-x-0 opacity-100"
                        : "translate-y-8 md:translate-y-0 md:-translate-x-full opacity-0 pointer-events-none"
                )}
            >
                {activeTab && (
                    <div className="flex items-center justify-between p-2 md:hidden">
                        <div className="w-8" />
                        <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closePanel}>
                            <ChevronLeft size={14} className="-rotate-90" />
                        </Button>
                    </div>
                )}

                {activeTab && !["music", "stickers"].includes(activeTab) && (
                    <>
                        {/* Content Layout */}
                        <div className="flex overflow-hidden h-full">

                            <ScrollArea className="p-4 bg-white max-h-[inherit] w-full h-full">
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
                                                <div className="text-[10px] text-red-500 bg-red-50 p-1 rounded border border-red-100 wrap-break-word">
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
                                                    const isActive = selectedElement?.fontFamily === familyName || (!selectedElement && currentFont === familyName);

                                                    return (
                                                        <Button
                                                            key={familyName}
                                                            variant="outline"
                                                            className={cn("h-12 justify-start px-3 overflow-hidden bg-white shadow-sm border-0 w-full text-left font-normal group relative transition-colors", isActive ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-700")}
                                                            onClick={() => handleFontSelect(familyName)}
                                                            onMouseEnter={() => loadFont(familyName)}
                                                        >
                                                            <span className={cn("truncate text-lg transition-colors", isActive ? "font-bold text-purple-700" : "group-hover:text-purple-600")} style={{ fontFamily: familyName }}>{familyName}</span>
                                                            {/* <div className="absolute right-2 opacity-0 group-hover:opacity-100 text-xs text-gray-400 bg-white px-1">Apply</div> */}
                                                        </Button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}



                                {activeTab === "uploads" && (
                                    <div className="space-y-6">
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl h-12 shadow-lg shadow-purple-900/10" onClick={() => fileInputRef.current?.click()}>
                                            <div className="flex items-center justify-center gap-2 text-white font-bold">
                                                <Upload size={18} />
                                                Upload Files
                                            </div>
                                        </Button>

                                        <div className="text-center py-10 text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
                                            <ImageIcon size={48} className="mx-auto mb-2 opacity-10" />
                                            <p className="text-[10px] uppercase font-bold tracking-widest">No uploads yet</p>
                                        </div>
                                    </div>
                                )}

                                {/* Projects and Templates moved to SettingsSidebar */}

                                {activeTab === "draw" && (
                                    <div className="flex items-center gap-2 p-2">
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


