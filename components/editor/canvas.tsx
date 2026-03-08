"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { getCardDimensions } from "./utils";

export const Canvas = () => {
    const {
        cards, activeCardId, activateCard,
        updateElement, selectElement, selectedElementId, selectedElement,
        currentFace, setCurrentFace, isDrawing, zoom, setZoom,
        setCardFace, activeTool, brushColor, brushSize, brushType,
        addElement, removeElement, cardMode, cardOrientation
    } = useEditor();

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



    const { width: canvasW, height: canvasH } = getCardDimensions(cardMode, cardOrientation);

    const getFaceContent = (face: CardFace, cardElements: EditorElement[]) => {
        const faceElements = cardElements.filter(el => el.face === face);
        const isActive = currentFace === face;

        return (
            <div
                className={cn("relative w-full h-full overflow-hidden", isActive ? "z-10" : "z-0")}
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentFace !== face) setCurrentFace(face);
                }}
            >
                <FabricCanvas
                    width={canvasW}
                    height={canvasH}
                    elements={faceElements}
                    readOnly={!isActive} // Only active face is interactive
                    onUpdate={updateElement}
                    onSelect={selectElement}
                    onAdd={addElement}
                    onRemove={removeElement}
                    isDrawing={isActive && isDrawing}
                    brushColor={brushColor}
                    brushSize={brushSize}
                    brushType={brushType}
                    zoom={zoom}
                    backgroundColor={activeCard?.backgroundColor}
                />
            </div>
        );
    };

    // Only render the active card
    const card = activeCard;
    if (!card) return <div className="flex-1 bg-zinc-950" />;

    const currentCardIsOpen = isOpen(card.currentFace);

    // Swipe logic for mobile card navigation
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset the end distance
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = cards.findIndex(c => c.id === activeCardId);
            if (currentIndex === -1) return;

            if (isLeftSwipe) {
                // Swipe Left -> Show Newer Card (Next index)
                if (currentIndex < cards.length - 1) {
                    activateCard(cards[currentIndex + 1].id);
                }
            } else if (isRightSwipe) {
                // Swipe Right -> Show Older Card (Previous index)
                if (currentIndex > 0) {
                    activateCard(cards[currentIndex - 1].id);
                }
            }
        }
    };

    // Pinch-to-zoom for mobile
    const pinchStartDistance = useRef<number | null>(null);
    const pinchStartZoom = useRef<number>(1);

    const getTouchDistance = (touches: React.TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch start
            pinchStartDistance.current = getTouchDistance(e.touches);
            pinchStartZoom.current = zoom;
        } else if (e.touches.length === 1) {
            onTouchStart(e);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && pinchStartDistance.current !== null) {
            const currentDistance = getTouchDistance(e.touches);
            const scaleFactor = currentDistance / pinchStartDistance.current;
            const newZoom = Math.min(Math.max(pinchStartZoom.current * scaleFactor, 0.5), 3);
            setZoom(newZoom);
        } else if (e.touches.length === 1) {
            onTouchMove(e);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (pinchStartDistance.current !== null && e.touches.length < 2) {
            pinchStartDistance.current = null;
        }
        if (e.touches.length === 0) {
            onTouchEnd();
        }
    };

    return (
        <div
            className="h-screen w-full bg-linear-to-br from-[#09090b] via-[#130b1c] to-[#09090b] bg-fixed overflow-hidden relative flex flex-col items-center justify-center pb-32 md:pb-36 touch-none"
            onClick={() => selectElement(null)}
        >
            <div
                id="card-canvas-container"
                className={cn(
                    "w-full h-full flex flex-col items-center justify-center transition-all duration-300 transform-gpu scale-[0.85] md:scale-[0.9]",
                    activeTool ? "origin-top translate-y-4 md:translate-y-0" : ""
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <motion.div
                    key={card.id}
                    className="relative group perspective-[2000px] touch-pan-y"
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
                            id="face-toggle"
                            variant="default"
                            size="sm"
                            className={cn(
                                "rounded-full h-9 md:h-10 px-5 md:px-6 gap-2 font-semibold transition-all hover:scale-105 text-sm",
                                currentCardIsOpen ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 border-none"
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

            {/* Floating Zoom Controls - Essential for Mobile - Lifted slightly */}
            {/* Zoom controls - hidden on mobile, use pinch-to-zoom instead */}
            <div className="absolute right-4 bottom-32 md:bottom-16 z-50 hidden md:flex flex-col gap-2">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex flex-col gap-1 shadow-2xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
                        onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </Button>
                    <div className="h-px bg-white/5 mx-2" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
                        onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </Button>
                    <div className="h-px bg-white/5 mx-2" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
                        onClick={() => setZoom(1)}
                    >
                        <span className="text-[10px] font-bold">1:1</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
