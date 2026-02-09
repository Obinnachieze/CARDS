"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditorElement, CardFace } from "./types";
import { DrawingCanvas } from "./drawing-canvas";
import { ZoomIn, ZoomOut, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CardWrapper } from "./card-wrapper";
import { ContextualToolbar } from "./contextual-toolbar";
import { CardToolbar } from "./card-toolbar";
import { ChevronRight, ChevronLeft, Minus, Plus, Maximize, LayoutGrid, List } from "lucide-react";

export const Canvas = () => {
    const {
        cards, activeCardId, activateCard,
        updateElement, selectElement, selectedElementId, selectedElement,
        currentFace, setCurrentFace, isDrawing, zoom, setZoom,
        setCardFace
    } = useEditor();

    const { cardMode } = useEditor(); // Get cardMode separately or add to above

    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
                                style={{ width: el.width, height: el.height, mixBlendMode: el.mixBlendMode as any }}
                            />
                        )}
                        {el.type === "line" && (
                            <div
                                className="w-full flex items-center justify-center pointer-events-none"
                                style={{ height: "100%" }}
                            >
                                <div
                                    className="w-full"
                                    style={{
                                        borderTopWidth: Math.max(1, el.height || 2),
                                        borderTopStyle: el.lineStyle || "solid",
                                        borderTopColor: el.color,
                                    }}
                                />
                            </div>
                        )}
                        {el.type === "shape" && (
                            <div className="w-full h-full pointer-events-none select-none" style={{ color: el.color }}>
                                {el.shapeType === "rect" && <div className="w-full h-full bg-current" />}
                                {el.shapeType === "circle" && <div className="w-full h-full bg-current rounded-full" />}
                                {el.shapeType === "triangle" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <path d="M50 0 L100 100 L0 100 Z" />
                                    </svg>
                                )}
                                {el.shapeType === "triangle-right" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <path d="M0 0 L0 100 L100 100 Z" />
                                    </svg>
                                )}
                                {el.shapeType === "star" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="50 0 61 35 98 35 68 57 79 91 50 70 21 91 32 57 2 35 39 35" />
                                    </svg>
                                )}
                                {el.shapeType === "star-4" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="50 0 65 35 100 50 65 65 50 100 35 65 0 50 35 35" />
                                    </svg>
                                )}
                                {el.shapeType === "star-8" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="50 0 61 22 85 15 78 39 100 50 78 61 85 85 61 78 50 100 39 78 15 85 22 61 0 50 22 39 15 15 39 22" />
                                    </svg>
                                )}
                                {el.shapeType === "pentagon" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="50 0 100 38 82 100 18 100 0 38" />
                                    </svg>
                                )}
                                {el.shapeType === "hexagon" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="50 0 95 25 95 75 50 100 5 75 5 25" />
                                    </svg>
                                )}
                                {el.shapeType === "octagon" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="30 0 70 0 100 30 100 70 70 100 30 100 0 70 0 30" />
                                    </svg>
                                )}
                                {el.shapeType === "diamond" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="50 0 100 50 50 100 0 50" />
                                    </svg>
                                )}
                                {el.shapeType === "heart" && (
                                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                )}
                                {el.shapeType === "arrow-right" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="0 30 60 30 60 0 100 50 60 100 60 70 0 70" />
                                    </svg>
                                )}
                                {el.shapeType === "arrow-left" && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <polygon points="100 30 40 30 40 0 0 50 40 100 40 70 100 70" />
                                    </svg>
                                )}
                                {el.shapeType === "cloud" && (
                                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current" preserveAspectRatio="none">
                                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </>
        );
    };

    const getFaceContent = (face: CardFace, cardElements: EditorElement[]) => {
        const faceElements = cardElements.filter(el => el.face === face);
        const isActive = currentFace === face;

        return (
            <div
                className={cn("relative w-full h-full overflow-hidden", isActive ? "z-10" : "z-0")}
                onClick={(e) => {
                    e.stopPropagation();
                    selectElement(null);
                    if (currentFace !== face) setCurrentFace(face);
                }}
            >
                {renderElements(faceElements)}
                {isActive && isDrawing && <DrawingCanvas width={450} height={600} zoom={zoom} />}
            </div>
        );
    };

    const isOpen = (face: CardFace) => face === "inside-left" || face === "inside-right" || face === "back";

    return (
        <div
            className="flex-1 bg-[#f0f0f3] overflow-y-auto relative flex flex-col items-center"
            onClick={() => selectElement(null)}
        >
            <div
                id="card-canvas-container"
                className={cn(
                    "p-20 w-full transition-all duration-300",
                    viewMode === "grid" ? "grid grid-cols-2 gap-12 justify-items-center" : "flex flex-col items-center gap-24 items-center"
                )}>
                {cards.map(card => {
                    const isCardActive = activeCardId === card.id;
                    const cardIsOpen = isOpen(card.currentFace);

                    return (
                        <div
                            key={card.id}
                            className="relative group transition-all duration-300 perspective-[2000px]"
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                activateCard(card.id);
                            }}
                        >
                            {/* Toolbars - Attached to Card */}
                            <div className={cn(
                                "absolute inset-0 pointer-events-none z-50 transition-opacity duration-200",
                                isCardActive ? "opacity-100" : "opacity-0"
                            )}>
                                <div className="w-full h-full relative">
                                    {isCardActive && selectedElement ? (
                                        <div className="pointer-events-auto"><ContextualToolbar /></div>
                                    ) : isCardActive ? (
                                        <div className="pointer-events-auto"><CardToolbar /></div>
                                    ) : null}
                                </div>
                            </div>

                            <div className={cn(
                                "transition-all duration-200 rounded-xl",
                                isCardActive ? "" : "opacity-90 hover:opacity-100"
                            )}>
                                <CardWrapper
                                    frontContent={getFaceContent("front", card.elements)}
                                    insideLeftContent={getFaceContent("inside-left", card.elements)}
                                    insideRightContent={getFaceContent("inside-right", card.elements)}
                                    backContent={getFaceContent("back", card.elements)}
                                    interactive={false}
                                    isOpen={cardIsOpen}
                                    backgroundColor={card.backgroundColor}
                                />
                            </div>

                            {/* Sticky Open/Close Button */}
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-50 w-max">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className={cn(
                                        "rounded-full h-10 px-6 gap-2 font-semibold transition-all hover:scale-105",
                                        cardIsOpen ? "bg-white text-gray-900 border hover:bg-gray-100" : "bg-purple-600 hover:bg-purple-700 text-white"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        activateCard(card.id);
                                        if (cardMode === "postcard") {
                                            setCardFace(card.id, card.currentFace === "back" ? "front" : "back");
                                        } else {
                                            setCardFace(card.id, cardIsOpen ? "front" : "inside-right");
                                        }
                                    }}
                                >
                                    {cardIsOpen ? <><X size={16} /> Close</> : <><BookOpen size={16} /> Open</>}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Control Bar - Canva Style */}
            <div className="fixed bottom-6 right-6 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200/50 z-50 pointer-events-auto">
                <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-0">
                    <span className="text-xs font-semibold text-gray-700 select-none">
                        Page {cards.findIndex(c => c.id === activeCardId) + 1} of {cards.length}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    title={viewMode === "grid" ? "List View" : "Grid View"}
                >
                    {viewMode === "grid" ? <List size={18} /> : <LayoutGrid size={18} />}
                </Button>

                <div className="flex items-center gap-2 ml-2">
                    <div className="w-24">
                        <Slider
                            value={[zoom]}
                            min={0.4}
                            max={1.0}
                            step={0.1}
                            onValueChange={([value]) => setZoom(value)}
                            className="cursor-pointer"
                        />
                    </div>
                    <span className="text-xs font-medium w-9 text-right text-gray-500 select-none tabular-nums">{Math.round(zoom * 100)}%</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500 ml-2"
                    onClick={() => {
                        const elem = document.documentElement;
                        if (!document.fullscreenElement) {
                            elem.requestFullscreen().catch(err => {
                                console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                            });
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                    title="Full Screen"
                >
                    <Maximize size={18} />
                </Button>
            </div>
        </div>
    );
};
