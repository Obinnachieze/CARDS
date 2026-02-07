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
    interactive?: boolean; // If true, clicking toggles open/close
}

export const CardWrapper = ({
    frontContent,
    insideLeftContent,
    insideRightContent,
    backContent,
    interactive = true
}: CardWrapperProps) => {
    const { cardMode, currentFace, setCurrentFace, backgroundColor } = useEditor();

    const isFoldable = cardMode === "foldable";
    // Define "isOpen" based on whether we are looking at the inside
    const isOpen = currentFace === "inside-left" || currentFace === "inside-right";

    // Dimensions
    const width = 450;
    const height = 600;

    const handleFaceClick = (targetFace: "front" | "inside-left" | "inside-right" | "back") => {
        if (!interactive) return;
        if (targetFace === "front") {
            setCurrentFace("inside-right"); // Open
        } else if (targetFace === "inside-right" || targetFace === "inside-left") {
            setCurrentFace("front"); // Close
        }
    };

    if (!isFoldable) {
        return (
            <div className="relative flex items-center justify-center w-full h-full p-8">
                <div className="relative w-[500px] h-[350px] bg-red-100 flex items-center justify-center shadow-md">
                    <div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center text-gray-400">
                        Envelope Preview (Coming Soon)
                    </div>
                </div>
            </div>
        )
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
                initial={{ width: 450 }}
                animate={{
                    width: isOpen ? 900 : 450
                }}
                transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
            >
                {/* RIGHT SIDE (Inside Right) - Pinned to Right */}
                <div
                    className="absolute right-0 top-0 z-0 overflow-hidden border border-gray-200 rounded-r-md bg-white"
                    style={{ width, height, backgroundColor }}
                    onClick={() => handleFaceClick("inside-right")}
                >
                    {insideRightContent}
                    {!interactive && isOpen && (
                        <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">Inside Right</div>
                    )}
                </div>

                {/* LEFT SIDE (Front Cover) - Pinned to Right, Rotates Left */}
                <motion.div
                    className="absolute right-0 top-0 z-10 transform-style-3d origin-left"
                    style={{ width, height }}
                    animate={{
                        rotateY: isOpen ? -180 : 0,
                    }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
                >
                    {/* FRONT FACE (Visible when Closed/0deg) */}
                    <div
                        className="absolute inset-0 backface-hidden bg-white cursor-pointer rounded-r-md overflow-hidden border border-gray-200"
                        style={{ backgroundColor }}
                        onClick={() => handleFaceClick("front")}
                    >
                        {frontContent}
                        {!interactive && !isOpen && (
                            <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">Front</div>
                        )}
                    </div>

                    {/* INSIDE LEFT FACE (Visible when Open/-180deg) */}
                    <div
                        className="absolute inset-0 backface-hidden rotate-y-180 bg-white border-l border-gray-200 rounded-l-md overflow-hidden"
                        style={{ backgroundColor }}
                        onClick={() => handleFaceClick("inside-left")}
                    >
                        {insideLeftContent}
                        {!interactive && isOpen && (
                            <div className="absolute top-2 left-2 text-xs text-gray-300 pointer-events-none">Inside Left</div>
                        )}
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};
