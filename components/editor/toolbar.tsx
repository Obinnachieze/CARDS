"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Type, Image as ImageIcon, Smile,
    Palette, LayoutTemplate, Pencil, Upload,
    MousePointer2, Move, CreditCard, Mail
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const fonts = [
    "Inter", "Playfair Display", "Roboto", "Lato", "Montserrat", "Open Sans",
    "Dancing Script", "Pacifico", "Great Vibes", "Caveat"
];

const colors = [
    "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f43f5e"
];

type Tab = "templates" | "text" | "elements" | "uploads" | "draw" | "settings";

export const Toolbar = () => {
    const {
        addElement,
        selectedElement,
        updateElement,
        removeElement,
        setBackgroundColor,
        backgroundColor,
        cardMode,
        setCardMode,
        currentFace,
        setCurrentFace,
        isDrawing,
        setIsDrawing,
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        currentFont,
        setCurrentFont
    } = useEditor();

    const [activeTab, setActiveTab] = useState<Tab>("text");
    const [textInput, setTextInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleAddText = () => {
        if (!textInput.trim()) return;
        addElement("text", textInput, { x: 50, y: 50 });
        setTextInput("");
    };

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

    return (
        <div className="flex h-full bg-white border-r w-80">
            {/* Icons Sidebar */}
            <div className="flex flex-col items-center w-20 py-4 bg-gray-50 border-r gap-4">
                <SidebarTab icon={<LayoutTemplate size={24} />} label="Templates" active={activeTab === "templates"} onClick={() => setActiveTab("templates")} />
                <SidebarTab icon={<Type size={24} />} label="Text" active={activeTab === "text"} onClick={() => setActiveTab("text")} />
                <SidebarTab icon={<Smile size={24} />} label="Elements" active={activeTab === "elements"} onClick={() => setActiveTab("elements")} />
                <SidebarTab icon={<Upload size={24} />} label="Uploads" active={activeTab === "uploads"} onClick={() => setActiveTab("uploads")} />
                <SidebarTab icon={<Pencil size={24} />} label="Draw" active={activeTab === "draw"} onClick={() => setActiveTab("draw")} />
                <SidebarTab icon={<Palette size={24} />} label="Design" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "text" && (
                    <div className="flex flex-col gap-6">
                        <h3 className="font-semibold text-lg">Add Text</h3>
                        <div className="flex gap-2">
                            <Input
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Enter text..."
                                onKeyDown={(e) => e.key === "Enter" && handleAddText()}
                            />
                            <Button onClick={handleAddText}>Add</Button>
                        </div>

                        <div className="space-y-4">
                            <Label>Font Family</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {fonts.map(font => (
                                    <Button
                                        key={font}
                                        variant={currentFont === font ? "default" : "outline"}
                                        className="h-10 justify-start px-2 overflow-hidden"
                                        style={{ fontFamily: font }}
                                        onClick={() => {
                                            setCurrentFont(font);
                                            if (selectedElement) {
                                                updateElement(selectedElement.id, { fontFamily: font });
                                            }
                                        }}
                                    >
                                        <span className="truncate">{font}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {selectedElement && selectedElement.type === "text" && (
                            <div className="space-y-4 pt-4 border-t">
                                <Label>Edit Selection</Label>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Content</Label>
                                    <Input
                                        value={selectedElement.content}
                                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Size</Label>
                                    <Slider
                                        value={[selectedElement.fontSize || 24]}
                                        min={12}
                                        max={100}
                                        step={1}
                                        onValueChange={(vals) => updateElement(selectedElement.id, { fontSize: vals[0] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Color</Label>
                                    <ColorPicker
                                        color={selectedElement.color || "#000000"}
                                        onChange={(color) => updateElement(selectedElement.id, { color })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "elements" && (
                    <div className="flex flex-col gap-6">
                        <h3 className="font-semibold text-lg">Elements</h3>
                        <Button
                            variant="outline"
                            className="h-12 justify-start gap-2"
                            onClick={() => setShowEmojiPicker(true)}
                        >
                            <Smile size={20} /> Add Emoji
                        </Button>
                        {showEmojiPicker && (
                            <div className="absolute z-50 left-20 top-20 shadow-xl">
                                <EmojiPicker onEmojiClick={handleAddEmoji} />
                                <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={() => setShowEmojiPicker(false)}>Close</Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "uploads" && (
                    <div className="flex flex-col gap-6">
                        <h3 className="font-semibold text-lg">Uploads</h3>
                        <Label htmlFor="image-upload" className="cursor-pointer border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition">
                            <Upload size={32} className="text-muted-foreground" />
                            <span className="text-sm font-medium">Click to upload image</span>
                            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </Label>
                    </div>
                )}

                {activeTab === "draw" && (
                    <div className="flex flex-col gap-6">
                        <h3 className="font-semibold text-lg">Drawing</h3>
                        <div className="flex items-center gap-2">
                            <Label>Enable Drawing</Label>
                            <Button
                                variant={isDrawing ? "default" : "outline"}
                                onClick={() => setIsDrawing(!isDrawing)}
                            >
                                {isDrawing ? "On" : "Off"}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <Label>Brush Color</Label>
                            <ColorPicker color={brushColor} onChange={setBrushColor} />
                        </div>

                        <div className="space-y-4">
                            <Label>Brush Size: {brushSize}px</Label>
                            <Slider
                                value={[brushSize]}
                                min={1}
                                max={20}
                                step={1}
                                onValueChange={(vals) => setBrushSize(vals[0])}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="flex flex-col gap-6">
                        <h3 className="font-semibold text-lg">Card Settings</h3>

                        <div className="space-y-2">
                            <Label>Card Format</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={cardMode === "foldable" ? "default" : "outline"}
                                    onClick={() => setCardMode("foldable")}
                                    className="flex flex-col h-20 gap-2"
                                >
                                    <CreditCard size={24} />
                                    <span>Foldable</span>
                                </Button>
                                <Button
                                    variant={cardMode === "envelope" ? "default" : "outline"}
                                    onClick={() => setCardMode("envelope")}
                                    className="flex flex-col h-20 gap-2"
                                >
                                    <Mail size={24} />
                                    <span>Envelope</span>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Background Color</Label>
                            <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                        </div>
                    </div>
                )}

                {activeTab === "templates" && (
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">Templates</h3>
                        <p className="text-muted-foreground text-sm">Select a starting point...</p>
                        {/* Placeholder for template thumbnails */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="aspect-[3/4] bg-yellow-100 rounded cursor-pointer hover:ring-2 ring-blue-500 flex items-center justify-center text-xs text-center font-bold text-yellow-600 p-2">Birthday</div>
                            <div className="aspect-[3/4] bg-pink-100 rounded cursor-pointer hover:ring-2 ring-blue-500 flex items-center justify-center text-xs text-center font-bold text-pink-600 p-2">Wedding</div>
                            <div className="aspect-[3/4] bg-red-100 rounded cursor-pointer hover:ring-2 ring-blue-500 flex items-center justify-center text-xs text-center font-bold text-red-600 p-2">Holiday</div>
                        </div>
                    </div>
                )}

                {/* Global Delete Button if selection exists */}
                {selectedElement && (
                    <Button
                        variant="destructive"
                        className="mt-8 w-full"
                        onClick={() => removeElement(selectedElement.id)}
                    >
                        Delete Selected Element
                    </Button>
                )}
            </div>
        </div>
    );
};

const SidebarTab = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg w-16 h-16 transition-colors",
            active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"
        )}
    >
        {icon}
        <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
);

const ColorPicker = ({ color, onChange }: { color: string, onChange: (c: string) => void }) => (
    <div className="grid grid-cols-6 gap-2">
        {colors.map((c) => (
            <button
                key={c}
                className={cn(
                    "w-8 h-8 rounded-full border transition-transform hover:scale-110",
                    color === c && "ring-2 ring-black"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
                title={c}
            />
        ))}
        <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-full overflow-hidden border-0 p-0"
        />
    </div>
);
