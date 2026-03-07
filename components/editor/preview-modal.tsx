"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CardWrapper } from "./card-wrapper";
import { useEditor } from "./editor-context";
import { EditorElement } from "./types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { FloatingParticles } from "./floating-particles";
import { Play, Pause, Music } from "lucide-react";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PreviewModal = ({ isOpen, onClose }: PreviewModalProps) => {
    const { cards, activeCardId, cardMode } = useEditor();

    // Get the active card data
    const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

    // Track card open state for celebrations
    const [previewIsOpen, setPreviewIsOpen] = useState(false);
    const [showFloating, setShowFloating] = useState(false);

    const [playingPreview, setPlayingPreview] = useState<string | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const togglePreview = (url: string) => {
        if (playingPreview === url) {
            audioRef.current?.pause();
            setPlayingPreview(null);
        } else {
            setPlayingPreview(url);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        }
    };

    // Fire celebrations when the card is opened in preview
    useEffect(() => {
        if (!previewIsOpen || !activeCard?.celebration || activeCard.celebration === "none") {
            setShowFloating(false);
            return;
        }

        let interval: any = null;
        let timeout: any = null;

        if (activeCard.celebration === "confetti") {
            confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else if (activeCard.celebration === "fireworks") {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

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

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [previewIsOpen, activeCard?.celebration]);

    // Reset open state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPreviewIsOpen(false);
            setShowFloating(false);
        }
    }, [isOpen]);

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
                            zIndex: el.musicPreviewUrl ? 50 : (el.type === "image" ? 0 : 10)
                        }}
                    >
                        {el.type === "text" && (
                            <p className="whitespace-pre-wrap" style={{ fontFamily: el.fontFamily }}>{el.content}</p>
                        )}
                        {el.type === "emoji" && (
                            <span style={{ fontSize: el.fontSize }}>{el.content}</span>
                        )}
                        {(el.type === "image" || el.type === "draw") && (
                            <div
                                className={cn(
                                    "relative group",
                                    el.musicPreviewUrl && "cursor-pointer"
                                )}
                                onClick={el.musicPreviewUrl ? (e) => {
                                    e.stopPropagation();
                                    togglePreview(el.musicPreviewUrl!);
                                } : undefined}
                            >
                                <img
                                    src={el.content}
                                    alt="element"
                                    className={cn(
                                        "object-contain",
                                        el.musicPreviewUrl && "rounded-lg shadow-lg ring-2 ring-transparent group-hover:ring-green-400 transition-all"
                                    )}
                                    style={{ width: el.width, height: el.height, mixBlendMode: el.mixBlendMode as any, filter: el.filter }}
                                />
                                {el.musicPreviewUrl && (
                                    <div className={cn(
                                        "absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg transition-opacity",
                                        playingPreview === el.musicPreviewUrl ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg border-2 border-white/20">
                                            {playingPreview === el.musicPreviewUrl ? (
                                                <Pause className="w-5 h-5 fill-current" />
                                            ) : (
                                                <Play className="w-5 h-5 fill-current ml-0.5" />
                                            )}
                                        </div>
                                        {playingPreview === el.musicPreviewUrl && (
                                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full animate-bounce">
                                                <Music className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
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
                <audio ref={audioRef} onEnded={() => setPlayingPreview(null)} hidden />
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
            <DialogContent className="fixed left-0! top-0! inset-0 w-screen h-screen max-w-none max-h-none border-0 shadow-none flex items-center justify-center p-0 overflow-hidden outline-none bg-transparent translate-x-0! translate-y-0!"
                style={{
                    background: "linear-gradient(135deg, rgba(26, 5, 51, 0.45) 0%, rgba(13, 0, 21, 0.4) 20%, rgba(0, 0, 0, 0.35) 40%, rgba(5, 0, 13, 0.4) 60%, rgba(13, 0, 21, 0.4) 80%, rgba(26, 5, 51, 0.45) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
            >
                <DialogTitle className="sr-only">Card Preview</DialogTitle>
                {/* Smooth gradient glow overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(circle at 15% 15%, rgba(147, 51, 234, 0.1) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(126, 34, 206, 0.08) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(88, 28, 135, 0.04) 0%, transparent 60%)"
                }} />

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

                {/* Floating Emoji Overlay (above the card) */}
                {showFloating && activeCard.celebrationEmoji && (
                    <div className="absolute inset-0 z-40 pointer-events-none">
                        <FloatingParticles emoji={activeCard.celebrationEmoji} count={15} />
                    </div>
                )}

                <div
                    className="relative flex items-center justify-center transition-transform duration-300 ease-in-out"
                    data-open={cardIsOpen}
                    style={{
                        transform: "scale(var(--preview-scale)) translateX(var(--preview-translate-x, 0px))",
                        "--preview-scale": "1",
                    } as React.CSSProperties}
                >
                    <style jsx global>{`
                        @media (min-width: 640px) { :root { --preview-scale: 1; } }
                        @media (min-width: 1024px) { :root { --preview-scale: 1; } }
                        @media (min-width: 1280px) { :root { --preview-scale: 1; } }
                        
                        @media (max-width: 639px) {
                            [data-open="true"] {
                                --preview-translate-x: -150px;
                            }
                        }
                    `}</style>

                    <div
                        className="w-full h-full flex items-center justify-center pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardWrapper
                            frontContent={renderFace(getElements("front"))}
                            insideLeftContent={renderFace(getElements("inside-left"))}
                            insideRightContent={renderFace(getElements("inside-right"))}
                            backContent={renderFace(getElements("back"))}
                            interactive={true}
                            isOpen={cardIsOpen}
                            backgroundColor={activeCard.backgroundColor}
                            audioSrc={activeCard.audioSrc}
                            onOpenChange={(open) => setPreviewIsOpen(open)}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
