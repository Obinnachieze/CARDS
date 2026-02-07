"use client";

import React from "react";
import { motion } from "framer-motion";
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
        // Logic for interactive preview toggle
        if (targetFace === "front") {
            setCurrentFace("inside-right"); // Open to inside
        } else if (targetFace === "inside-right" || targetFace === "inside-left") {
            setCurrentFace("front"); // Close to front
        }
    };

    if (!isFoldable) {
        // ENVELOPE MODE (Simplified for now)
        return (
            <div className="relative flex items-center justify-center w-full h-full p-8">
                <div className="relative w-[500px] h-[350px] bg-red-100 flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center text-gray-400">
                        Envelope Preview (Coming Soon)
                    </div>
                </div>
            </div>
        )
    }

    // FOLDABLE MODE
    return (
        <div className="perspective-1000 flex items-center justify-center w-full h-full p-10">
            <div className="relative transform-style-3d transition-all duration-700 w-full h-full flex items-center justify-center">

                {/* LEFT SIDE (Front Cover + Inside Left) */}
                <motion.div
                    className="relative transform-style-3d origin-right z-10"
                    style={{ width, height }}
                    animate={{
                        rotateY: isOpen ? -180 : 0,
                    }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
                >
                    {/* FRONT FACE */}
                    <div
                        className="absolute inset-0 backface-hidden bg-white shadow-xl cursor-pointer rounded-r-md overflow-hidden"
                        style={{ backgroundColor }}
                        onClick={() => handleFaceClick("front")}
                    >
                        {frontContent}
                        {!interactive && !isOpen && (
                            <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">Front</div>
                        )}
                    </div>

                    {/* INSIDE LEFT FACE (Back of Front Cover) */}
                    <div
                        className="absolute inset-0 backface-hidden rotate-y-180 bg-white shadow-sm border-r border-gray-100 rounded-l-md overflow-hidden"
                        style={{ backgroundColor }}
                        onClick={() => handleFaceClick("inside-left")}
                    >
                        {insideLeftContent}
                        {!interactive && isOpen && (
                            <div className="absolute top-2 left-2 text-xs text-gray-300 pointer-events-none">Inside Left</div>
                        )}
                    </div>
                </motion.div>

                {/* RIGHT SIDE (Inside Right + Back Cover) */}
                {/* Ideally this would also be a motion div if we want to show the Back Cover by flipping the whole thing */}
                {/* For now, let's assume standard greeting card where Right side is static base */}
                <div
                    className="relative bg-white shadow-xl z-0 rounded-r-md overflow-hidden"
                    style={{ width, height, backgroundColor }}
                    onClick={() => handleFaceClick("inside-right")}
                >
                    {insideRightContent}
                    {!interactive && isOpen && (
                        <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">Inside Right</div>
                    )}
                </div>

            </div>
        </div>
    );
};
