"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditorElement, CardFace } from "./types";
import { DrawingCanvas } from "./drawing-canvas";
import { ZoomIn, ZoomOut, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "./card-wrapper";

export const Canvas = () => {
    const {
        elements,
        updateElement,
        selectElement,
        selectedElementId,
        currentFace,
        setCurrentFace,
        isDrawing,
        zoom,
        setZoom
    } = useEditor();

    // Helper to render a list of elements
    const renderElements = (faceElements: EditorElement[]) => {
        return (
            <>
                {faceElements.map((el) => (
                    <motion.div
                        key={el.id}
                        drag={!isDrawing} // Disable drag when drawing
                        dragMomentum={false}
                        onDragEnd={(_, info) => {
                            // Drag offset is in screen pixels. We need to adjust by zoom.
                            updateElement(el.id, {
                                x: el.x + info.offset.x / zoom,
                                y: el.y + info.offset.y / zoom
                            });
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDrawing) selectElement(el.id);
                        }}
                        className={cn(
                            "absolute cursor-move hover:ring-1 ring-blue-400/50",
                            selectedElementId === el.id && "ring-2 ring-blue-600",
                            isDrawing && "pointer-events-none"
                        )}
                        style={{
                            left: el.x,
                            top: el.y,
                            fontSize: el.fontSize,
                            fontFamily: el.fontFamily,
                            color: el.color,
                            transform: `rotate(${el.rotation}deg)`,
                            zIndex: el.type === "image" ? 0 : 10
                        }}
                    >
                        {el.type === "text" && (
                            <p className="whitespace-pre-wrap select-none" style={{ fontFamily: el.fontFamily }}>
                                {el.content}
                            </p>
                        )}
                        {el.type === "emoji" && (
                            <span className="select-none" style={{ fontSize: el.fontSize }}>{el.content}</span>
                        )}
                        {(el.type === "image" || el.type === "draw") && (
                            <img
                                src={el.content}
                                alt="element"
                                className="w-full h-full object-contain pointer-events-none select-none"
                                style={{ width: el.width, height: el.height }}
                            />
                        )}
                    </motion.div>
                ))}
            </>
        );
    };

    const getFaceContent = (face: CardFace) => {
        const faceElements = elements.filter(el => el.face === face);
        const isActive = currentFace === face;

        return (
            <div
                className={cn("relative w-full h-full overflow-hidden", isActive ? "z-10" : "z-0")}
                onClick={(e) => {
                    // If we click the face background, select it (deselect element)
                    e.stopPropagation();
                    selectElement(null);
                    if (currentFace !== face) setCurrentFace(face);
                }}
            >
                {renderElements(faceElements)}
                {/* Drawing Canvas overlay if active */}
                {isActive && isDrawing && <DrawingCanvas width={450} height={600} zoom={zoom} />}
            </div>
        );
    };

    const isOpen = currentFace === "inside-left" || currentFace === "inside-right";

    return (
        <div
            className="flex-1 bg-[#f0f0f3] overflow-hidden relative flex flex-col items-center justify-center"
            onClick={() => selectElement(null)}
        >
            {/* The Interactive Card */}
            <div
                className="transform transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
            >
                <CardWrapper
                    frontContent={getFaceContent("front")}
                    insideLeftContent={getFaceContent("inside-left")}
                    insideRightContent={getFaceContent("inside-right")}
                    interactive={false} // We control state manually mostly
                />
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-10 flex flex-col gap-4 items-center z-50 pointer-events-none">
                {/* Open/Close Toggle */}
                <Button
                    variant="default"
                    size="lg"
                    className={cn(
                        "rounded-full shadow-lg pointer-events-auto h-12 px-6 gap-2 font-semibold transition-all hover:scale-105",
                        isOpen ? "bg-white text-gray-900 border hover:bg-gray-100" : "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                    onClick={() => setCurrentFace(isOpen ? "front" : "inside-right")}
                >
                    {isOpen ? <><X size={18} /> Close Card</> : <><BookOpen size={18} /> Open Card</>}
                </Button>

                {/* Zoom Controls */}
                <div className="bg-white rounded-full shadow-lg flex items-center p-1.5 gap-2 pointer-events-auto border">
                    <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="rounded-full h-8 w-8 hover:bg-gray-100">
                        <ZoomOut size={16} />
                    </Button>
                    <span className="text-xs font-medium w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="rounded-full h-8 w-8 hover:bg-gray-100">
                        <ZoomIn size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
