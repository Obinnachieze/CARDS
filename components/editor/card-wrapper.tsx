"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "./editor-context";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
    frontContent: React.ReactNode;
    insideLeftContent: React.ReactNode;
    insideRightContent: React.ReactNode;
    backContent?: React.ReactNode;
    interactive?: boolean;
    isOpen?: boolean;
    audioSrc?: string;
    onOpenChange?: (isOpen: boolean) => void;
}

export const CardWrapper = ({
    frontContent,
    insideLeftContent,
    insideRightContent,
    backContent,
    interactive = true,
    isOpen: externalIsOpen,
    backgroundColor,
    audioSrc,
    onOpenChange
}: CardWrapperProps & { backgroundColor: string }) => {
    const { cardMode, setCurrentFace, currentFace } = useEditor();

    const isFoldable = cardMode === "foldable";
    const isEnvelope = cardMode === "envelope";

    // Internal state for when interactive mode is used without external control
    const [internalIsOpen, setInternalIsOpen] = React.useState(false);

    // Use external state if provided, otherwise internal
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    // Audio Playback Logic
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    React.useEffect(() => {
        if (!audioSrc) return;

        // Create audio element if it doesn't exist
        if (!audioRef.current) {
            audioRef.current = new Audio(audioSrc);
            audioRef.current.loop = true; // Loop background music
        } else if (audioRef.current.src !== audioSrc) {
            // Update src if changed
            audioRef.current.src = audioSrc;
        }

        if (isOpen) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio playback failed (autoplay policy?):", error);
                });
            }
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset to start
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isOpen, audioSrc]);

    // Dimensions
    const width = 300;
    const height = 400;

    const handleFaceClick = (targetFace: "front" | "inside-left" | "inside-right" | "back") => {
        if (!interactive) return;
        if (targetFace === "front") {
            if (isEnvelope) {
                setCurrentFace("inside-right");
            } else {
                setCurrentFace("inside-right");
            }
            onOpenChange?.(true);
        } else if (targetFace === "inside-right" || targetFace === "inside-left") {
            setCurrentFace("front");
            onOpenChange?.(false);
        }
    };

    if (cardMode === "postcard") {
        return (
            <div className="perspective-1000 flex items-center justify-center w-full h-full p-10">
                <motion.div
                    className="relative bg-transparent"
                    style={{
                        width: 480,
                        height: 320,
                        transformStyle: "preserve-3d"
                    }}
                    animate={{ rotateY: (currentFace === "back" || isOpen) ? 180 : 0 }}
                    transition={{
                        duration: 1.0,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                >
                    {/* Front Face */}
                    <div
                        className={cn(
                            "absolute inset-0 bg-white shadow-lg overflow-hidden border border-gray-200",
                            currentFace === "front" ? "z-10 pointer-events-auto" : "z-0 pointer-events-none"
                        )}
                        style={{
                            backgroundColor,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "translateZ(1px)" // Push forward slightly to avoid z-fighting
                        }}
                        onClick={() => { if (interactive) { setCurrentFace("back"); onOpenChange?.(true); } }}
                    >
                        {frontContent}
                        {!interactive && (
                            <div className="absolute top-2 right-2 text-xs text-gray-400 pointer-events-none">Click to Flip</div>
                        )}
                    </div>

                    {/* Back Face */}
                    <div
                        className={cn(
                            "absolute inset-0 bg-white shadow-lg overflow-hidden border border-gray-200",
                            currentFace === "back" ? "z-10 pointer-events-auto" : "z-0 pointer-events-none"
                        )}
                        style={{
                            backgroundColor,
                            transform: "rotateY(180deg) translateZ(1px)", // Push 'forward' relative to its own face direction
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                        }}
                        onClick={() => { if (interactive) { setCurrentFace("front"); onOpenChange?.(false); } }}
                    >
                        {/* Optional Postcard Dividers/Stamp Area */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-8 right-8 w-20 h-24 border-2 border-gray-400" />
                            <div className="absolute top-[50%] left-[50%] w-[1px] h-[80%] bg-gray-400 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        {backContent}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (cardMode === "envelope") {
        return (
            <div className="perspective-1000 flex items-center justify-center w-full h-full p-10">
                <div className="relative w-[480px] h-[320px] bg-transparent group">
                    {/* 1. Base (Back of Envelope) */}
                    <div
                        className="absolute inset-0 bg-white shadow-xl rounded-md"
                        style={{ backgroundColor: backgroundColor || "#f5f5f5" }}
                    />

                    {/* 2. Card Insert (Slides Up) */}
                    <motion.div
                        className="absolute left-6 right-6 bottom-4 h-[280px] bg-white shadow-sm border border-gray-100 flex items-center justify-center p-8 text-center overflow-hidden"
                        initial={{ y: 0 }}
                        animate={{
                            y: isOpen ? -150 : 0,
                            zIndex: 5 // Logic: Render order handles visual depth. When sliding up, it stays behind z-10 pockets.
                        }}
                        transition={{
                            delay: isOpen ? 0.2 : 0, // Wait for flap to start opening
                            duration: 0.8,
                            type: "spring", stiffness: 40, damping: 15
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Optional: Click card to maybe open fully?
                        }}
                    >
                        {/* Scale down content slightly to fit insert */}
                        <div className="w-full h-full origin-top transform scale-95">
                            {frontContent}
                        </div>
                    </motion.div>

                    {/* 3. Pocket (The "V" shape layers) */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {/* Left Triangle */}
                        <div
                            className="absolute top-0 bottom-0 left-0 w-1/2"
                            style={{
                                backgroundColor: backgroundColor || "#f5f5f5",
                                filter: "brightness(0.97)",
                                clipPath: "polygon(0 0, 100% 50%, 0 100%)"
                            }}
                        />
                        {/* Right Triangle */}
                        <div
                            className="absolute top-0 bottom-0 right-0 w-1/2"
                            style={{
                                backgroundColor: backgroundColor || "#f5f5f5",
                                filter: "brightness(0.95)", // Slightly darker for depth
                                clipPath: "polygon(100% 0, 100% 100%, 0 50%)"
                            }}
                        />
                        {/* Bottom Triangle */}
                        <div
                            className="absolute bottom-0 inset-x-0 h-3/5" // Taller to cover card bottom
                            style={{
                                backgroundColor: backgroundColor || "#f5f5f5",
                                filter: "brightness(0.92)",
                                clipPath: "polygon(0 100%, 50% 0, 100% 100%)"
                            }}
                        />
                    </div>

                    {/* 4. Top Flap (The lid) */}
                    <motion.div
                        onClick={() => interactive && handleFaceClick("front")}
                        className={cn(
                            "absolute top-0 inset-x-0 h-1/2 z-20 origin-top",
                            !interactive && "pointer-events-none" // Allow clicks to pass through to insert in Editor
                        )}
                        style={{
                            borderRadius: "2px",
                            transformStyle: "preserve-3d"
                        }}
                        animate={{
                            rotateX: isOpen ? 180 : 0,
                            zIndex: isOpen ? 1 : 20 // Drop z-index when open to go behind card
                        }}
                        transition={{
                            rotateX: { duration: 0.6, type: "spring", stiffness: 60, damping: 14 },
                            zIndex: { delay: isOpen ? 0.3 : 0 } // Wait for rotation to drop z-index
                        }}
                    >
                        {/* Outer Flap (Closed state visible) */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundColor: backgroundColor || "#f5f5f5",
                                clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                                backfaceVisibility: "hidden",
                                filter: "brightness(1.02)",
                            }}
                        />
                        {/* Inner Flap (Open state visible) */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundColor: backgroundColor || "#f5f5f5",
                                clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                                transform: "rotateX(180deg)",
                                backfaceVisibility: "hidden",
                                filter: "brightness(0.85)", // Darker inside shadow
                                pointerEvents: "none"
                            }}
                        />
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!isFoldable) {
        return (
            <div className="relative flex items-center justify-center w-full h-full p-8">
                <div className="relative w-[500px] h-[350px] bg-red-100 flex items-center justify-center shadow-md">
                    <div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center text-gray-400">
                        Mode Not Supported: {cardMode}
                    </div>
                </div>
            </div>
        );
    }

    // FOLDABLE MODE - Centered Expansion
    // Wrapper animates Width: 450 -> 900.
    // Content is pinned to Right.
    // Front Cover rotates -180deg (Left) to reveal Inside Left.

    return (
        <div className="perspective-1000 flex items-center justify-center w-full h-full p-10">
            <motion.div
                className="relative transform-style-3d bg-transparent"
                style={{ height }}
                initial={{ width: 300 }}
                animate={{
                    width: isOpen ? 600 : 300
                }}
                transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {/* RIGHT SIDE (Inside Right) - Pinned to Right */}
                <div
                    className="absolute right-0 top-0 z-0 overflow-hidden border border-gray-200 rounded-r-md bg-white"
                    style={{
                        width,
                        height,
                        backgroundColor,
                        transform: "translateZ(-1px)"
                    }}
                    onClick={() => handleFaceClick("inside-right")}
                >
                    {insideRightContent}
                    {!interactive && isOpen && (
                        <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">Inside Right</div>
                    )}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/20 pointer-events-none"
                        animate={{ opacity: isOpen ? 0.6 : 0 }}
                    />
                </div>

                {/* LEFT SIDE (Front Cover) - Pinned to Right, Rotates Left */}
                {/* LEFT SIDE (Front Cover) - Pinned to Right, Rotates Left */}
                <motion.div
                    className="absolute right-0 top-0 z-10 origin-left"
                    style={{
                        width,
                        height,
                        transformStyle: "preserve-3d"
                    }}
                    animate={{
                        rotateY: isOpen ? -180 : 0,
                    }}
                    transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {/* SPINE (Thickness at the hinge) */}
                    <div
                        className="absolute left-0 top-0 bottom-0"
                        style={{
                            width: "4px",
                            backgroundColor: backgroundColor, // Match card color
                            filter: "brightness(0.85)", // Darken for 3D effect
                            transform: "rotateY(90deg) translateZ(-2px)", // Center on the edge
                            // Removed backfaceVisibility: hidden so it's visible from both sides of the fold
                        }}
                    />

                    {/* FRONT FACE (Visible when Closed/0deg) */}
                    <div
                        className="absolute inset-0 bg-white cursor-pointer rounded-r-md overflow-hidden border border-gray-200"
                        style={{
                            backgroundColor,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "translateZ(1px)"
                        }}
                        onClick={() => handleFaceClick("front")}
                    >
                        {frontContent}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none"
                            animate={{ opacity: isOpen ? 0 : 0 }}
                        />
                        <motion.div
                            className="absolute inset-0 bg-black/20 pointer-events-none"
                            animate={{ opacity: isOpen ? 0.3 : 0 }}
                        />
                        {!interactive && !isOpen && (
                            <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">Front</div>
                        )}
                    </div>

                    {/* INSIDE LEFT FACE (Visible when Open/-180deg) */}
                    <div
                        className="absolute inset-0 bg-white cursor-pointer rounded-l-md overflow-hidden border border-gray-200"
                        style={{
                            backgroundColor,
                            transform: "rotateY(180deg) translateZ(1px)",
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden"
                        }}
                        onClick={() => handleFaceClick("inside-left")}
                    >
                        {insideLeftContent}
                        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                        {!interactive && isOpen && (
                            <div className="absolute top-2 left-2 text-xs text-gray-300 pointer-events-none">Inside Left</div>
                        )}
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};
