"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardFace, CardMode } from "./types";
import { useEditor } from "./editor-context";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
    children: React.ReactNode; // The canvas content (will be filtered by face)
}

export const CardWrapper = ({ children }: CardWrapperProps) => {
    const { cardMode, currentFace, setCurrentFace, backgroundColor } = useEditor();

    const isFoldable = cardMode === "foldable";
    const isOpen = currentFace.startsWith("inside");

    // Dimensions for the card (A5 ish ratio)
    const width = 600;
    const height = 800;

    if (!isFoldable) {
        // ENVELOPE MODE
        return (
            <div className="relative flex items-center justify-center w-full h-full bg-gray-100 p-8 overflow-hidden">
                <div className="relative w-[700px] h-[500px] bg-red-100 flex items-center justify-center shadow-2xl">
                    {/* Envelope Body */}
                    <div className="absolute inset-0 bg-amber-200 z-10 clip-path-envelope" style={{ clipPath: "polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)" }} />

                    {/* The Card Sliding Out */}
                    <motion.div
                        className="absolute bg-white shadow-lg z-0"
                        style={{ width: 550, height: 400, backgroundColor }}
                        animate={{
                            y: isOpen ? -200 : 0,
                            zIndex: isOpen ? 20 : 0
                        }}
                        transition={{ duration: 1, type: "spring" }}
                        onClick={() => setCurrentFace(isOpen ? "front" : "inside-left")}
                    >
                        {/* Render all content here for now, or specific face */}
                        <div className="relative w-full h-full overflow-hidden">
                            {children}
                        </div>
                    </motion.div>

                    {/* Envelope Flap */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-1/2 bg-amber-300 z-20 origin-top"
                        style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
                        animate={{ rotateX: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        );
    }

    // FOLDABLE MODE
    return (
        <div className="perspective-1000 flex items-center justify-center w-full h-full bg-gray-200">
            <motion.div
                className="relative transform-style-3d transition-transform duration-700"
                style={{ width, height }}
                animate={{
                    rotateY: isOpen ? -180 : 0,
                    x: isOpen ? width / 2 : 0 // Shift to center the open spread
                }}
            >
                {/* FRONT COVER */}
                <div
                    className="absolute inset-0 backface-hidden bg-white shadow-xl cursor-pointer"
                    style={{ backgroundColor }}
                    onClick={() => setCurrentFace("inside-right")}
                >
                    {/* We need to filter children for 'front' face usually, but here we just render everything and rely on the canvas to filter */}
                    {/* Actually, the Canvas component calls this wrapper? Or this wrapper is inside Canvas? */}
                    {/* Better approach: This wrapper renders multiple 'CanvasFaces' */}
                    {/* But standard implementation is: Wrapper contains the visual structure, and slots for content */}

                    <div className="pointer-events-none text-center mt-10 text-gray-400">Front Cover</div>
                    {children}
                </div>

                {/* INSIDE LEFT (Back of cover) */}
                <div
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-white shadow-xl border-r border-gray-200"
                    style={{ backgroundColor }}
                >
                    <div className="pointer-events-none text-center mt-10 text-gray-400">Inside Left</div>
                    {/* Render Inside Left Content */}
                </div>
            </motion.div>

            {/* INSIDE RIGHT (Static back page) */}
            <motion.div
                className="absolute shadow-xl"
                style={{
                    width,
                    height,
                    x: isOpen ? width / 2 : 0, // Moves with the opening
                    zIndex: -1,
                    backgroundColor
                }}
            >
                <div
                    className="w-full h-full cursor-pointer"
                    onClick={() => setCurrentFace("front")}
                >
                    <div className="pointer-events-none text-center mt-10 text-gray-400">Inside Right (Main Message)</div>
                    {/* Render Inside Right Content */}
                    {/* Wait, if children is the filtered list of elements, we can't easily split them here unless we pass slots */}
                </div>
            </motion.div>
        </div>
    );
};
