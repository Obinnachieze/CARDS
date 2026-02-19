"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditorElement, CardFace } from "./types";

import { ZoomIn, ZoomOut, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CardWrapper } from "./card-wrapper";
import { ContextualToolbar } from "./contextual-toolbar";
import { CardToolbar } from "./card-toolbar";
import { ChevronRight, ChevronLeft, Minus, Plus, Maximize, LayoutGrid, List } from "lucide-react";
import confetti from "canvas-confetti";
import { FloatingParticles } from "./floating-particles";
import { FabricCanvas } from "./fabric-canvas";

export const Canvas = () => {
    const {
        cards, activeCardId, activateCard,
        updateElement, selectElement, selectedElementId, selectedElement,
        currentFace, setCurrentFace, isDrawing, zoom, setZoom,
        setCardFace, activeTool, brushColor, brushSize, brushType
    } = useEditor();

    const { cardMode } = useEditor(); // Get cardMode separately or add to above

    const activeCard = cards.find(c => c.id === activeCardId);

    // Celebration Effect Trigger
    const isOpen = (face: CardFace) => face === "inside-left" || face === "inside-right" || face === "back";
    const cardIsOpen = activeCard ? isOpen(activeCard.currentFace) : false;

    // Track whether to show floating particles
    const [showFloating, setShowFloating] = React.useState(false);

    React.useEffect(() => {
        let interval: any = null;
        let timeout: any = null;

        if (cardIsOpen && activeCard?.celebration && activeCard.celebration !== "none") {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            if (activeCard.celebration === "confetti") {
                confetti({
                    particleCount: 60,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } else if (activeCard.celebration === "fireworks") {
                interval = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) { clearInterval(interval); return; }
                    const particleCount = 30 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 350);
            } else if (activeCard.celebration === "floating-emoji") {
                setShowFloating(true);
                timeout = setTimeout(() => setShowFloating(false), 5000);
            }
        } else {
            setShowFloating(false);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [cardIsOpen, activeCard?.celebration]);

    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const getFaceContent = (face: CardFace, cardElements: EditorElement[]) => {
        const faceElements = cardElements.filter(el => el.face === face);
        const isActive = currentFace === face;

        return (
            <div
                className={cn("relative w-full h-full overflow-hidden bg-white", isActive ? "z-10" : "z-0")}
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentFace !== face) setCurrentFace(face);
                }}
            >
                <FabricCanvas
                    width={450}
                    height={600}
                    elements={faceElements}
                    readOnly={!isActive} // Only active face is interactive
                    onUpdate={updateElement}
                    onSelect={selectElement}
                    isDrawing={isActive && isDrawing}
                    brushColor={brushColor}
                    brushSize={brushSize}
                    brushType={brushType}
                    zoom={zoom}
                />
            </div>
        );
    };

    return (
        <div
            className="flex-1 bg-[#f0f0f3] overflow-y-auto relative flex flex-col items-center"
            onClick={() => selectElement(null)}
        >
            <div
                id="card-canvas-container"
                className={cn(
                    "p-4 md:p-20 w-full transition-all duration-300 pb-32 md:pb-20",
                    activeTool ? "md:pb-20 origin-top scale-[0.6] -translate-y-[10vh] md:scale-100 md:translate-y-0" : "",
                    viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 justify-items-center" : "flex flex-col items-center gap-12 md:gap-24 items-center"
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
                                    audioSrc={card.audioSrc}
                                />
                                {/* Floating Emoji Overlay */}
                                {showFloating && card.id === activeCardId && card.celebration === "floating-emoji" && (
                                    <FloatingParticles emoji={card.celebrationEmoji || "🎈"} count={15} />
                                )}
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
            <div className="fixed bottom-6 right-6 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200/50 z-50 pointer-events-auto transition-all duration-300">
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

                <div className="hidden md:flex items-center gap-2 ml-2">
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
