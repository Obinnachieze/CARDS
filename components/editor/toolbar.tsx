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
            "flex flex-col items-center justify-center w-auto md:w-full min-w-[60px] md:min-w-0 py-1 md:py-3 transition-colors relative group rounded-xl mx-0 md:mx-2 px-1 md:px-0",
            active ? "text-purple-600 bg-purple-50" : "text-gray-500 hover:text-purple-600 hover:bg-purple-50/50"
        )}
    >
        <div className={cn("mb-1", active ? "text-purple-600" : "")}>{icon}</div>
        <span className="text-[10px] font-medium hidden md:block">{label}</span>
        {/* Mobile active indicator (top border) */}
        {active && <div className="absolute top-0 left-2 right-2 h-1 bg-purple-600 rounded-b-full md:hidden" />}
        {/* Desktop active indicator (left border) */}
        {active && <div className="absolute left-0 top-3 bottom-3 w-1 bg-purple-600 rounded-r-full hidden md:block" />}
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
        setActiveTool: setActiveTab
    } = useEditor();

    // const [activeTab, setActiveTab] = useState<Tab | "projects" | null>("templates"); // Removed local state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Google Fonts State
    const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
    const [fontSearch, setFontSearch] = useState("");
    const [isLoadingFonts, setIsLoadingFonts] = useState(false);
    const [fontError, setFontError] = useState<string | null>(null);

    const loadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template && activeCardId) {
            const templateCard = template.cards[0];

            setCards(prev => prev.map(card => {
                if (card.id === activeCardId) {
                    return {
                        ...card,
                        elements: templateCard.elements.map(el => ({ ...el })),
                        backgroundColor: templateCard.backgroundColor,
                        celebration: templateCard.celebration
                    };
                }
                return card;
            }));
        }
    };

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

    return (
        <div className="flex md:h-full z-40 relative shrink-0 md:shrink-0">
            {/* Mobile FAB */}
            {/* Mobile FAB - Disappears when panel is open */}
            <button
                className={cn(
                    "md:hidden fixed bottom-6 left-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg z-50 flex items-center justify-center text-white hover:bg-purple-700 transition-all duration-300 active:scale-95",
                    activeTab ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
                )}
                onClick={() => setActiveTab("templates")}
            >
                <div className="text-3xl font-light">+</div>
            </button>

            {/* Dark Icon Rail - Desktop Only */}
            <div id="sidebar-tools" className="hidden md:flex flex-col items-center w-[72px] py-4 bg-transparent text-gray-600 gap-2 z-50">
                <SidebarTab icon={<FolderOpen size={20} />} label="Projects" active={activeTab === "projects"} onClick={() => setActiveTab(activeTab === "projects" ? null : "projects")} onMouseEnter={() => setActiveTab("projects")} />
                <div id="sidebar-templates">
                    <SidebarTab icon={<LayoutTemplate size={20} />} label="Templates" active={activeTab === "templates"} onClick={() => setActiveTab(activeTab === "templates" ? null : "templates")} onMouseEnter={() => setActiveTab("templates")} />
                </div>
                <SidebarTab icon={<LayoutTemplate size={20} />} label="Design" active={activeTab === "design"} onClick={() => setActiveTab(activeTab === "design" ? null : "design")} onMouseEnter={() => setActiveTab("design")} />
                <SidebarTab icon={<Type size={20} />} label="Text" active={activeTab === "text"} onClick={() => setActiveTab(activeTab === "text" ? null : "text")} onMouseEnter={() => setActiveTab("text")} />
                <SidebarTab icon={<Smile size={20} />} label="Elements" active={activeTab === "elements"} onClick={() => setActiveTab(activeTab === "elements" ? null : "elements")} onMouseEnter={() => setActiveTab("elements")} />
                <SidebarTab icon={<Upload size={20} />} label="Uploads" active={activeTab === "uploads"} onClick={() => setActiveTab(activeTab === "uploads" ? null : "uploads")} onMouseEnter={() => setActiveTab("uploads")} />
                <SidebarTab icon={<Pencil size={20} />} label="Draw" active={activeTab === "draw"} onClick={() => setActiveTab(activeTab === "draw" ? null : "draw")} onMouseEnter={() => setActiveTab("draw")} />
                <SidebarTab icon={<Sparkles size={20} />} label="Effects" active={activeTab === "effects"} onClick={() => setActiveTab(activeTab === "effects" ? null : "effects")} onMouseEnter={() => setActiveTab("effects")} />
                <SidebarTab icon={<MusicIcon size={20} />} label="Audio" active={activeTab === "music"} onClick={() => setActiveTab(activeTab === "music" ? null : "music")} onMouseEnter={() => setActiveTab("music")} />
            </div>

            {/* Sliding Panel */}
            <div
                className={cn(
                    "fixed md:absolute bg-white shadow-xl transform transition-all duration-300 ease-in-out z-40 overflow-hidden flex flex-col",
                    // Mobile: Bottom Sheet, fixed above bottom bar
                    "bottom-0 left-0 right-0 h-[50vh] rounded-t-2xl md:rounded-none",
                    activeTab ? "translate-y-0" : "translate-y-full md:translate-y-0",
                    // Desktop: Side Panel, full height
                    "md:top-0 md:bottom-0 md:left-[72px] md:w-80 md:h-full md:shadow-2xl md:translate-y-0",
                    activeTab ? "md:translate-x-0" : "md:-translate-x-full"
                )}
            >                        {activeTab && activeTab !== "music" && (
                <>
                    <div className="flex items-center justify-between p-3 border-b border-gray-100 md:hidden">
                        <div className="w-8" />
                        <div className="w-12 h-1 bg-gray-200 rounded-full" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
                            <ChevronLeft size={16} className="-rotate-90" />
                        </Button>
                    </div>

                    <div className="hidden md:flex items-center justify-between p-4 shadow-sm mb-1">
                        <h3 className="font-semibold text-sm capitalize">{activeTab}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
                            <ChevronLeft size={16} />
                        </Button>
                    </div>

                    {/* Sidebar + Content Layout */}
                    <div className="flex h-full overflow-hidden">
                        {/* Mobile Sidebar (Vertical List) */}
                        <div className="w-[72px] bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-2 overflow-y-auto no-scrollbar shrink-0 md:hidden">
                            <SidebarTab icon={<LayoutTemplate size={20} />} label="Templates" active={activeTab === "templates"} onClick={() => setActiveTab("templates")} />
                            <SidebarTab icon={<Type size={20} />} label="Text" active={activeTab === "text"} onClick={() => setActiveTab("text")} />
                            <SidebarTab icon={<Smile size={20} />} label="Elements" active={activeTab === "elements"} onClick={() => setActiveTab("elements")} />
                            <SidebarTab icon={<Upload size={20} />} label="Uploads" active={activeTab === "uploads"} onClick={() => setActiveTab("uploads")} />
                            <SidebarTab icon={<Palette size={20} />} label="Design" active={activeTab === "design"} onClick={() => setActiveTab("design")} />
                            <SidebarTab icon={<Pencil size={20} />} label="Draw" active={activeTab === "draw"} onClick={() => setActiveTab("draw")} />
                            <SidebarTab icon={<Sparkles size={20} />} label="Effects" active={activeTab === "effects"} onClick={() => setActiveTab("effects")} />
                            <SidebarTab icon={<MusicIcon size={20} />} label="Audio" active={activeTab === "music"} onClick={() => setActiveTab("music")} />
                            <SidebarTab icon={<Star size={20} />} label="Stickers" active={activeTab === "stickers"} onClick={() => setActiveTab("stickers")} />
                            <div className="h-10" /> {/* Spacer */}
                        </div>

                        <ScrollArea className="flex-1 p-4 bg-white">
                            {/* Panel Content Based on Tab */}

                            {activeTab === "text" && (
                                <div className="space-y-6">
                                    {/* Edit Selected Text */}
                                    {selectedElement?.type === "text" && (
                                        <div className="bg-purple-50 p-4 rounded-lg shadow-sm space-y-4 mb-6">
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
                                                <div className="shadow-sm rounded-md p-2 text-sm bg-white truncate">
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
                                </div>
                            )}

                            {activeTab === "elements" && (
                                <div className="space-y-6">
                                    {/* Properties moved to Contextual Toolbar */}
                                    <div className="bg-gray-100 p-2 rounded-md flex gap-2">
                                        <Search size={16} className="text-gray-400 mt-1" />
                                        <input className="bg-transparent text-sm w-full outline-none" placeholder="Search elements" />
                                    </div>

                                    {/* Lines Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold text-xs text-gray-500 uppercase tracking-wider">Lines</Label>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                className="h-16 bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg border-0 flex items-center justify-center px-4 transition-colors"
                                                onClick={() => addElement("line", "", { width: 100, height: 4, lineStyle: "solid", color: "black" })}
                                                title="Solid Line"
                                            >
                                                <div className="w-full h-[2px] bg-black" />
                                            </button>
                                            <button
                                                className="h-16 bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg border-0 flex items-center justify-center px-4 transition-colors"
                                                onClick={() => addElement("line", "", { width: 100, height: 4, lineStyle: "dashed", color: "black" })}
                                                title="Dashed Line"
                                            >
                                                <div className="w-full h-0 border-t-2 border-dashed border-black" />
                                            </button>
                                            <button
                                                className="h-16 bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg border-0 flex items-center justify-center px-4 transition-colors"
                                                onClick={() => addElement("line", "", { width: 100, height: 4, lineStyle: "dotted", color: "black" })}
                                                title="Dotted Line"
                                            >
                                                <div className="w-full h-0 border-t-2 border-dotted border-black" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Shapes Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold text-xs text-gray-500 uppercase tracking-wider">Shapes</Label>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "rect", color: "black" })} title="Rectangle">
                                                <div className="w-full h-full bg-current" />
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "circle", color: "black" })} title="Circle">
                                                <div className="w-full h-full bg-current rounded-full" />
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "triangle", color: "black" })} title="Triangle">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><path d="M50 0 L100 100 L0 100 Z" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "triangle-right", color: "black" })} title="Right Triangle">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><path d="M0 0 L0 100 L100 100 Z" /></svg>
                                            </ShapeButton>

                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "diamond", color: "black" })} title="Diamond">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="50 0 100 50 50 100 0 50" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "pentagon", color: "black" })} title="Pentagon">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="50 0 100 38 82 100 18 100 0 38" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "hexagon", color: "black" })} title="Hexagon">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="50 0 95 25 95 75 50 100 5 75 5 25" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "octagon", color: "black" })} title="Octagon">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="30 0 70 0 100 30 100 70 70 100 30 100 0 70 0 30" /></svg>
                                            </ShapeButton>

                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "star", color: "black" })} title="Star">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="50 0 61 35 98 35 68 57 79 91 50 70 21 91 32 57 2 35 39 35" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "star-4", color: "black" })} title="4-Point Star">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="50 0 65 35 100 50 65 65 50 100 35 65 0 50 35 35" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "star-8", color: "black" })} title="8-Point Star">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="50 0 61 22 85 15 78 39 100 50 78 61 85 85 61 78 50 100 39 78 15 85 22 61 0 50 22 39 15 15 39 22" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "heart", color: "black" })} title="Heart">
                                                <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                            </ShapeButton>

                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "arrow-right", color: "black" })} title="Arrow Right">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="0 30 60 30 60 0 100 50 60 100 60 70 0 70" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 100, shapeType: "arrow-left", color: "black" })} title="Arrow Left">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><polygon points="100 30 40 30 40 0 0 50 40 100 40 70 100 70" /></svg>
                                            </ShapeButton>
                                            <ShapeButton onClick={() => addElement("shape", "", { width: 100, height: 60, shapeType: "cloud", color: "black" })} title="Cloud">
                                                <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
                                            </ShapeButton>
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

                            {activeTab === "projects" && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="font-bold text-xs text-gray-500 uppercase tracking-wider">Current Project</Label>
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                id="project-name"
                                                placeholder="Project Name"
                                                className="h-10"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        saveProjectAs(e.currentTarget.value || "Untitled Project");
                                                        e.currentTarget.value = "";
                                                    }
                                                }}
                                            />
                                            <Button
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                                                onClick={() => {
                                                    const input = document.getElementById("project-name") as HTMLInputElement;
                                                    saveProjectAs(input?.value || "Untitled Project");
                                                    if (input) input.value = "";
                                                }}
                                            >
                                                <Save size={16} />
                                                Save Project
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t pt-4">
                                        <Label className="font-bold text-xs text-gray-500 uppercase tracking-wider">Saved Projects</Label>
                                        {projects.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 text-xs">
                                                No saved projects yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {projects.map((project) => (
                                                    <div key={project.id} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-white border rounded-lg shadow-sm transition-all">
                                                        <div className="flex flex-col cursor-pointer flex-1" onClick={() => loadProject(project.id)}>
                                                            <span className="font-medium text-sm text-gray-700 group-hover:text-purple-700">{project.name}</span>
                                                            <span className="text-[10px] text-gray-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteProject(project.id);
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "draw" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Drawing Tools</Label>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                className={cn(
                                                    "flex items-center p-3 rounded-xl transition-all group relative overflow-hidden gap-3 text-left w-full",
                                                    !isDrawing ? "bg-purple-50 shadow-md ring-1 ring-purple-200" : "bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-100"
                                                )}
                                                onClick={() => setIsDrawing(false)}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0", !isDrawing && "bg-purple-600 text-white")}>
                                                    <MousePointer2 size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-gray-800">Select / Move</span>
                                                    <span className="text-[10px] text-gray-500">Interact with elements</span>
                                                </div>
                                                {!isDrawing && <div className="absolute left-0 top-3 bottom-3 w-1 bg-purple-600 rounded-r-full" />}
                                            </button>

                                            <button
                                                className={cn(
                                                    "flex items-center p-3 rounded-xl transition-all group relative overflow-hidden gap-3 text-left w-full",
                                                    isDrawing && brushType === "pencil" ? "bg-red-50 shadow-md ring-1 ring-red-200" : "bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-100"
                                                )}
                                                onClick={() => {
                                                    setBrushType("pencil");
                                                    setIsDrawing(true);
                                                }}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-red-100 text-red-600 shrink-0", isDrawing && brushType === "pencil" && "bg-red-500 text-white")}>
                                                    <Pencil size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-gray-800">Pencil</span>
                                                    <span className="text-[10px] text-gray-500">Fine detail lines</span>
                                                </div>
                                                {isDrawing && brushType === "pencil" && <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r-full" />}
                                            </button>

                                            <button
                                                className={cn(
                                                    "flex items-center p-3 rounded-xl transition-all group relative overflow-hidden gap-3 text-left w-full",
                                                    isDrawing && brushType === "marker" ? "bg-blue-50 shadow-md ring-1 ring-blue-200" : "bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-100"
                                                )}
                                                onClick={() => {
                                                    setBrushType("marker");
                                                    setIsDrawing(true);
                                                }}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0", isDrawing && brushType === "marker" && "bg-blue-500 text-white")}>
                                                    <PenTool size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-gray-800">Marker</span>
                                                    <span className="text-[10px] text-gray-500">Bold, solid strokes</span>
                                                </div>
                                                {isDrawing && brushType === "marker" && <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full" />}
                                            </button>

                                            <button
                                                className={cn(
                                                    "flex items-center p-3 rounded-xl transition-all group relative overflow-hidden gap-3 text-left w-full",
                                                    isDrawing && brushType === "highlighter" ? "bg-yellow-50 shadow-md ring-1 ring-yellow-200" : "bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-100"
                                                )}
                                                onClick={() => {
                                                    setBrushType("highlighter");
                                                    setIsDrawing(true);
                                                }}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-yellow-100 text-yellow-600 shrink-0", isDrawing && brushType === "highlighter" && "bg-yellow-500 text-white")}>
                                                    <Highlighter size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-gray-800">Highlighter</span>
                                                    <span className="text-[10px] text-gray-500">Transparent overlay</span>
                                                </div>
                                                {isDrawing && brushType === "highlighter" && <div className="absolute left-0 top-3 bottom-3 w-1 bg-yellow-500 rounded-r-full" />}
                                            </button>

                                            <button
                                                className={cn(
                                                    "flex items-center p-3 rounded-xl transition-all group relative overflow-hidden gap-3 text-left w-full",
                                                    isDrawing && brushType === "eraser" ? "bg-gray-100 shadow-md ring-1 ring-gray-200" : "bg-white hover:bg-gray-50 hover:shadow-sm border border-gray-100"
                                                )}
                                                onClick={() => {
                                                    setBrushType("eraser");
                                                    setIsDrawing(true);
                                                }}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-gray-100 text-gray-600 shrink-0", isDrawing && brushType === "eraser" && "bg-gray-600 text-white")}>
                                                    <Eraser size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-gray-800">Eraser</span>
                                                    <span className="text-[10px] text-gray-500">Remove drawings</span>
                                                </div>
                                                {isDrawing && brushType === "eraser" && <div className="absolute left-0 top-3 bottom-3 w-1 bg-gray-600 rounded-r-full" />}
                                            </button>
                                        </div>
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
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="font-bold text-xs text-gray-500 uppercase tracking-wider">Templates</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {templates.map(template => (
                                                <button
                                                    key={template.id}
                                                    className="group relative aspect-3/4 bg-gray-100 rounded-xl overflow-hidden border hover:border-purple-400 hover:shadow-md transition-all text-left"
                                                    onClick={() => loadTemplate(template.id)}
                                                >
                                                    <div
                                                        className="absolute inset-0 w-full h-full"
                                                        style={{ background: template.thumbnail.startsWith("#") ? template.thumbnail : template.thumbnail }}
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                        <span className="text-white text-xs font-medium truncate w-full block">
                                                            {template.name}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <Label className="font-bold text-xs text-gray-500 uppercase tracking-wider">Card Format</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                className={cn(
                                                    "aspect-video rounded-md border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                                    cardMode === "foldable"
                                                        ? "border-purple-600 bg-purple-50 text-purple-700"
                                                        : "border-gray-200 bg-white hover:border-purple-300 text-gray-600"
                                                )}
                                                onClick={() => setCardMode("foldable")}
                                            >
                                                <LayoutTemplate size={24} />
                                                <span className="text-xs font-medium">Foldable</span>
                                            </button>
                                            <button
                                                className={cn(
                                                    "aspect-video rounded-md border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                                    cardMode === "envelope"
                                                        ? "border-amber-600 bg-amber-50 text-amber-700"
                                                        : "border-gray-200 bg-white hover:border-amber-300 text-gray-600"
                                                )}
                                                onClick={() => setCardMode("envelope")}
                                            >
                                                <div className="w-6 h-4 border-2 border-current rounded-sm relative">
                                                    <div className="absolute top-0 left-0 right-0 h-2 border-b-2 border-current transform origin-top scale-y-100" />
                                                </div>
                                                <span className="text-xs font-medium">Envelope</span>
                                            </button>
                                            <button
                                                className={cn(
                                                    "aspect-video rounded-md border-2 flex flex-col items-center justify-center gap-2 transition-all",
                                                    cardMode === "postcard"
                                                        ? "border-teal-600 bg-teal-50 text-teal-700"
                                                        : "border-gray-200 bg-white hover:border-teal-300 text-gray-600"
                                                )}
                                                onClick={() => setCardMode("postcard")}
                                            >
                                                <div className="w-6 h-4 border-2 border-current rounded-sm relative" />
                                                <span className="text-xs font-medium">Postcard</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </ScrollArea>
                    </div>
                </>
            )}

                {activeTab === "stickers" && (
                    <div className="flex h-full flex-col w-full">
                        <div className="flex items-center justify-between p-4 shadow-sm mb-1 bg-white">
                            <h3 className="font-semibold text-sm capitalize">Stickers</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden h-full">
                            <StickerSidebar />
                        </div>
                    </div>
                )}

                {activeTab === "music" && (
                    <div className="flex h-full flex-col w-full">
                        <div className="flex items-center justify-between p-4 shadow-sm mb-1 bg-white">
                            <h3 className="font-semibold text-sm capitalize">Music & Audio</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden h-full">
                            <MusicSidebar />
                        </div>
                    </div>
                )}
            </div>
            {/* End Sliding Panel */}
        </div >
    );
};


