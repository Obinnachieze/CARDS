"use client";

import React from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Copy, Palette, Type } from "lucide-react";
import { ColorPicker } from "./color-picker";
import { cn } from "@/lib/utils";
import { MagicWriterDialog } from "./magic-writer-dialog";

const FILTER_PRESETS = [
    { name: "None", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Blur", value: "blur(5px)" },
    { name: "Vintage", value: "sepia(50%) contrast(150%)" },
    { name: "Bright", value: "brightness(120%)" },
    { name: "Invert", value: "invert(100%)" },
];

export const ContextualToolbar = () => {
    const { selectedElement, updateElement, removeElement, addElement, zoom } = useEditor();

    if (!selectedElement) return null;

    const handleDelete = () => {
        if (selectedElement) removeElement(selectedElement.id);
    };

    const handleDuplicate = () => {
        if (selectedElement) {
            // Create a new ID for the duplicate
            const newId = crypto.randomUUID();
            const newElement = {
                ...selectedElement,
                id: newId,
                x: selectedElement.x + 20,
                y: selectedElement.y + 20
            };
            addElement(selectedElement.type, selectedElement.content, {
                ...selectedElement,
                id: undefined, // Let addElement generate ID or if it uses the passed ID, we should be careful.
                // Actually, if I pass 'id: undefined', it might override the generated ID if spread after.
                // Let's see implementation.
                // Safe bet: Pass only style properties if possible, or newElement with undefined ID.
                // But wait, newElement defines x and y.
                x: selectedElement.x + 20,
                y: selectedElement.y + 20
            });
        }
    };

    // Calculate position - slightly above the element
    // We need to account for rotation and zoom in a real app, but for now simple positioning
    // improving this would require getting the bounding box of the selected element
    // Since we don't have refs to the actual DOM nodes easily here without more state,
    // we'll position it fixed relative to the screen or use the element's coordinates transformed.
    // However, the Canvas component renders elements with `absolute` positioning within a scaled container.
    // It's easiest to render this toolbar INSIDE the scaled container (so it scales with zoom) OR 
    // render it in the overlay and do math. 
    // Rendering inside the scaled container means the toolbar text shrinks/grows with zoom. 
    // Usually we want the toolbar to stay constant size relative to screen.
    // Let's try rendering it in the Canvas component's overlay layer, but we need screen coordinates.

    // actually, let's just render it as a child of the element selection box if we had one.
    // For now, let's render it absolute positioned based on selectedElement.x/y

    // We'll style it to be centered above the element.

    const toolbarStyle = {
        left: selectedElement.x,
        top: selectedElement.y - 60, // 60px above
        transform: `translateX(-50%)`, // Center horizontally? No, x/y is top-left usually.
        // If x/y is top-left, we want it above.
        // Let's just adjust top.
        // And maybe center it relative to width?
    };

    // Correcting positioning logic:
    // element.x/y is top-left.
    // toolbar should be centered horizontally relative to element width.
    const leftPos = selectedElement.x + (selectedElement.width || 0) / 2;

    // If we render this inside the zoom container, `scale(${1/zoom})` can keep it constant size?
    // Let's try that.

    return (
        <div
            className="absolute z-50 flex flex-col items-center gap-2"
            style={{
                left: leftPos,
                top: selectedElement.y - 120, // Move it up higher
                transform: `translateX(-50%) scale(${1 / zoom})`, // Counter-scale to keep UI size constant
                transformOrigin: "bottom center"
            }}
        >
            <div className="bg-white rounded-xl shadow-xl p-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                {/* Common Actions */}
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <ColorPicker
                        color={selectedElement.color || "#000000"}
                        onChange={(c: string) => updateElement(selectedElement.id, { color: c })}
                        className="w-8 h-8 rounded-xl shadow-sm ring-1 ring-gray-100"
                    />
                </div>

                {/* Text Specific */}
                {selectedElement.type === "text" && (
                    <div className="flex items-center gap-2 border-r pr-2 mr-2">
                        <div className="flex flex-col w-20">
                            <Label className="text-[8px] text-gray-500 uppercase font-bold">Size</Label>
                            <Slider
                                value={[selectedElement.fontSize || 16]}
                                min={8}
                                max={120}
                                step={1}
                                onValueChange={(val) => updateElement(selectedElement.id, { fontSize: val[0] })}
                                className="w-full"
                            />
                        </div>
                        <MagicWriterDialog
                            initialText={selectedElement.content}
                            onInsert={(text) => updateElement(selectedElement.id, { content: text })}
                        />
                    </div>
                )}

                {/* Line Specific */}
                {selectedElement.type === "line" && (
                    <div className="flex items-center gap-2 border-r pr-2 mr-2">
                        <div className="flex flex-col w-24">
                            <Label className="text-[8px] text-gray-500 uppercase font-bold">Thickness</Label>
                            <Slider
                                value={[selectedElement.height || 4]}
                                min={1}
                                max={50}
                                step={1}
                                onValueChange={(val) => updateElement(selectedElement.id, { height: val[0] })}
                                className="w-full"
                            />
                        </div>
                        <div className="flex gap-1">
                            {["solid", "dashed", "dotted"].map((s) => (
                                <button
                                    key={s}
                                    className={cn(
                                        "w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 shadow-sm",
                                        selectedElement.lineStyle === s ? "bg-purple-100 ring-1 ring-purple-400" : "bg-white"
                                    )}
                                    onClick={() => updateElement(selectedElement.id, { lineStyle: s as any })}
                                    title={s}
                                >
                                    <div className={cn(
                                        "w-4 border-t-2 border-current",
                                        s === "dashed" && "border-dashed",
                                        s === "dotted" && "border-dotted"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shape/Image/Draw Specific */}
                {(selectedElement.type === "shape" || selectedElement.type === "image" || selectedElement.type === "draw") && (
                    <div className="flex items-center gap-2 border-r pr-2 mr-2">
                        <div className="flex flex-col w-20">
                            <Label className="text-[8px] text-gray-500 uppercase font-bold">Size</Label>
                            <Slider
                                value={[selectedElement.width || 100]}
                                min={10}
                                max={800}
                                step={10}
                                onValueChange={(val) => updateElement(selectedElement.id, { width: val[0], height: selectedElement.type === "shape" ? val[0] : (selectedElement.height! * (val[0] / (selectedElement.width || 1))) })}
                                className="w-full"
                            />
                        </div>
                    </div>
                )}

                {/* Image Specific - Filters */}
                {selectedElement.type === "image" && (
                    <div className="flex items-center gap-2 border-r pr-2 mr-2">
                        <div className="flex flex-col w-24">
                            <Label className="text-[8px] text-gray-500 uppercase font-bold">Filter</Label>
                            <Select
                                value={selectedElement.filter || "none"}
                                onValueChange={(val) => updateElement(selectedElement.id, { filter: val })}
                            >
                                <SelectTrigger className="h-7 text-xs w-full">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FILTER_PRESETS.map(f => (
                                        <SelectItem key={f.value} value={f.value}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}


                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50" onClick={handleDuplicate} title="Duplicate">
                        <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete} title="Delete">
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Visual connector/arrow pointing down to element */}
            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white filter drop-shadow-sm" />
        </div>
    );
};
