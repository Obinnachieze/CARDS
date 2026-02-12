"use client";

import React, { useState, useEffect } from "react";
import { CardWrapper } from "./card-wrapper";
import { useEditor } from "./editor-context";
import { EditorElement } from "./types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { FloatingParticles } from "./floating-particles";
import { Button } from "@/components/ui/button";
import { Pencil, Copy, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SharedCardViewProps {
    onEdit: () => void;
    canEdit: boolean; // true if owner, false if visitor
}

export const SharedCardView = ({ onEdit, canEdit }: SharedCardViewProps) => {
    const { cards, activeCardId, cardMode } = useEditor();

    // Get the active card data (default to first card)
    const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

    const [cardIsOpen, setCardIsOpen] = useState(false);
    const [showFloating, setShowFloating] = useState(false);
    const [scale, setScale] = useState(0.42); // Default mobile scale

    // Dynamic Scaling Logic
    useEffect(() => {
        const calculateScale = () => {
            const width = window.innerWidth;

            if (width < 640) { // Mobile
                if (cardMode === "foldable" && cardIsOpen) {
                    setScale(0.35); // Fit 900px wide open card
                } else if (cardMode === "foldable") {
                    setScale(0.65); // Fit 450px wide closed card
                } else {
                    setScale(0.55); // Fit 600px wide standard card
                }
            } else if (width < 1024) { // Tablet
                setScale(0.65);
            } else { // Desktop
                setScale(0.9);
            }
        };

        // Calculate initially and on resize
        calculateScale();
        window.addEventListener("resize", calculateScale);
        return () => window.removeEventListener("resize", calculateScale);
    }, [cardIsOpen, cardMode]);

    // Celebration logic (simplified from PreviewModal)
    useEffect(() => {
        if (!cardIsOpen || !activeCard?.celebration || activeCard.celebration === "none") {
            setShowFloating(false);
            return;
        }

        let interval: any = null;
        let timeout: any = null;

        if (activeCard.celebration === "confetti") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else if (activeCard.celebration === "floating-emoji") {
            setShowFloating(true);
            timeout = setTimeout(() => setShowFloating(false), 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [cardIsOpen, activeCard?.celebration]);

    if (!activeCard) return null;

    // Filter elements logic
    const getElements = (face: "front" | "inside-left" | "inside-right" | "back") =>
        activeCard.elements.filter(el => el.face === face);

    // Render elements logic (copied from PreviewModal for consistency)
    const renderPreviewElements = (faceElements: EditorElement[]) => {
        return (
            <>
                {faceElements.map((el) => (
                    <div
                        key={el.id}
                        className="absolute"
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
                            <p className="whitespace-pre-wrap" style={{ fontFamily: el.fontFamily }}>{el.content}</p>
                        )}
                        {el.type === "emoji" && (
                            <span style={{ fontSize: el.fontSize }}>{el.content}</span>
                        )}
                        {(el.type === "image" || el.type === "draw") && (
                            <img
                                src={el.content}
                                alt="element"
                                className="object-contain"
                                style={{ width: el.width, height: el.height, mixBlendMode: el.mixBlendMode as any, filter: el.filter }}
                            />
                        )}
                        {el.type === "line" && (
                            <div className="w-full flex items-center justify-center pointer-events-none" style={{ height: "100%" }}>
                                <div className="w-full" style={{ borderTopWidth: Math.max(1, el.height || 2), borderTopStyle: el.lineStyle || "solid", borderTopColor: el.color }} />
                            </div>
                        )}
                        {el.type === "shape" && (
                            <div className="w-full h-full pointer-events-none select-none" style={{ color: el.color }}>
                                {el.shapeType === "rect" && <div className="w-full h-full bg-current" />}
                                {el.shapeType === "circle" && <div className="w-full h-full bg-current rounded-full" />}
                                {el.shapeType === "heart" && (
                                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </>
        );
    };

    const renderFace = (elements: EditorElement[]) => (
        <div className="relative w-full h-full overflow-hidden pointer-events-none">
            {renderPreviewElements(elements)}
        </div>
    );

    return (
        <div className="relative w-full h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-purple-900/20 via-neutral-950 to-neutral-950 pointer-events-none" />

            {/* Header / Brand */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/" className="text-white font-bold text-xl flex items-center gap-2">
                    <span className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">V</span>
                    <span className="hidden sm:inline">VibePost</span>
                </Link>
            </div>

            {/* Floating Emoji Overlay */}
            {showFloating && activeCard.celebrationEmoji && (
                <div className="absolute inset-0 z-40 pointer-events-none">
                    <FloatingParticles emoji={activeCard.celebrationEmoji} count={15} />
                </div>
            )}

            {/* Card Container */}
            <div
                className="relative z-10 w-full max-w-4xl h-[60vh] sm:h-[70vh] flex items-center justify-center transition-transform duration-300"
                style={{
                    perspective: "2000px" // Ensure 3D perspective is active
                }}
            >
                <div
                    className="transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `scale(${scale})`,
                    }}
                >
                    <CardWrapper
                        frontContent={renderFace(getElements("front"))}
                        insideLeftContent={renderFace(getElements("inside-left"))}
                        insideRightContent={renderFace(getElements("inside-right"))}
                        backContent={renderFace(getElements("back"))}
                        interactive={true}
                        isOpen={cardIsOpen}
                        backgroundColor={activeCard.backgroundColor}
                        audioSrc={activeCard.audioSrc} // Pass audio source
                        onOpenChange={setCardIsOpen}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 z-20 flex flex-col sm:flex-row items-center gap-4"
            >
                <Button
                    onClick={onEdit}
                    size="lg"
                    className={cn(
                        "rounded-full px-8 py-6 text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-105",
                        canEdit ? "bg-white text-black hover:bg-gray-100" : "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                >
                    {canEdit ? (
                        <>
                            <Pencil className="w-5 h-5 mr-2" />
                            Edit This Card
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5 mr-2" />
                            Remix This Card
                        </>
                    )}
                </Button>

                {!canEdit && (
                    <Link href="/">
                        <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Card
                        </Button>
                    </Link>
                )}
            </motion.div>
        </div>
    );
};
