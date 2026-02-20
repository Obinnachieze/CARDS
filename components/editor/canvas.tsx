"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditorElement, CardFace } from "./types";

import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "./card-wrapper";
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
                    width={300}
                    height={400}
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

    // Only render the active card
    const card = activeCard;
    if (!card) return <div className="flex-1 bg-[#f0f0f3]" />;

    const currentCardIsOpen = isOpen(card.currentFace);

    return (
        <div
            className="flex-1 bg-[#f0f0f3] overflow-hidden relative flex flex-col items-center justify-center pb-24"
            onClick={() => selectElement(null)}
        >
            <div
                id="card-canvas-container"
                className={cn(
                    "w-full h-full flex flex-col items-center justify-center transition-all duration-300 scale-[0.85] md:scale-[0.9]",
                    activeTool ? "origin-top scale-[0.5] -translate-y-[10vh] md:scale-[0.85] md:translate-y-0" : ""
                )}
            >
                <motion.div
                    key={card.id}
                    className="relative group perspective-[2000px]"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center'
                    }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        activateCard(card.id);
                    }}
                >
                    <div className="transition-all duration-200 rounded-xl">
                        <CardWrapper
                            frontContent={getFaceContent("front", card.elements)}
                            insideLeftContent={getFaceContent("inside-left", card.elements)}
                            insideRightContent={getFaceContent("inside-right", card.elements)}
                            backContent={getFaceContent("back", card.elements)}
                            interactive={false}
                            isOpen={currentCardIsOpen}
                            backgroundColor={card.backgroundColor}
                            audioSrc={card.audioSrc}
                        />
                        {/* Floating Emoji Overlay */}
                        {showFloating && card.celebration === "floating-emoji" && (
                            <FloatingParticles emoji={card.celebrationEmoji || "🎈"} count={15} />
                        )}
                    </div>

                    {/* Open/Close Button - always visible below card */}
                    <div className="flex justify-center mt-4 md:mt-6">
                        <Button
                            variant="default"
                            size="sm"
                            className={cn(
                                "rounded-full h-9 md:h-10 px-5 md:px-6 gap-2 font-semibold transition-all hover:scale-105 text-sm",
                                currentCardIsOpen ? "bg-white text-gray-900 border hover:bg-gray-100" : "bg-purple-600 hover:bg-purple-700 text-white"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (cardMode === "postcard") {
                                    setCardFace(card.id, card.currentFace === "back" ? "front" : "back");
                                } else {
                                    setCardFace(card.id, currentCardIsOpen ? "front" : "inside-right");
                                }
                            }}
                        >
                            {currentCardIsOpen ? <><X size={16} /> Close</> : <><BookOpen size={16} /> Open</>}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
