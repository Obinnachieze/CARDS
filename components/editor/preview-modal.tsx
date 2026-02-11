"use client";

import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CardWrapper } from "./card-wrapper";
import { useEditor } from "./editor-context";
import { EditorElement } from "./types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PreviewModal = ({ isOpen, onClose }: PreviewModalProps) => {
    const { cards, activeCardId, cardMode } = useEditor();

    // Get the active card data
    const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

    if (!activeCard) return null;

    // Filter elements for the specific card
    const getElements = (face: "front" | "inside-left" | "inside-right" | "back") =>
        activeCard.elements.filter(el => el.face === face);

    // Reuse the rendering logic with proper scaling
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
                                {/* Add other shapes if needed for preview, simplistic for now */}
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

    const cardIsOpen = activeCard.currentFace === "inside-left" || activeCard.currentFace === "inside-right" || activeCard.currentFace === "back";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full bg-black/80 border-0 shadow-none flex items-center justify-center p-0 overflow-hidden outline-none backdrop-blur-sm">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                    aria-label="Close Preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="M6 6 18 18" />
                    </svg>
                </button>

                {/* 
                    Scaling Wrapper:
                    - Mobile: Scale down significantly (0.42) to fit 900px wide card
                    - Tablet: Scale 0.7 
                    - Desktop: Scale 1.0 (or fit)
                */}
                <div
                    className="relative flex items-center justify-center transition-transform duration-300 ease-in-out"
                    style={{
                        transform: "scale(var(--preview-scale))",
                        "--preview-scale": "0.42", // Mobile default
                    } as React.CSSProperties}
                >
                    {/* Responsive overrides via style injection or just use standard css classes if we can map them */}
                    <style jsx global>{`
                        @media (min-width: 640px) { :root { --preview-scale: 0.6; } }
                        @media (min-width: 1024px) { :root { --preview-scale: 0.85; } }
                        @media (min-width: 1280px) { :root { --preview-scale: 1; } }
                    `}</style>

                    <div className="w-full h-full flex items-center justify-center pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <CardWrapper
                            frontContent={renderFace(getElements("front"))}
                            insideLeftContent={renderFace(getElements("inside-left"))}
                            insideRightContent={renderFace(getElements("inside-right"))}
                            backContent={renderFace(getElements("back"))}
                            interactive={true}
                            isOpen={cardIsOpen}
                            backgroundColor={activeCard.backgroundColor}
                            audioSrc={activeCard.audioSrc}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
