"use client";

import React, { useRef } from "react";
import { useEditor } from "./editor-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CardWrapper } from "./card-wrapper";
import { EditorElement } from "./types";
import { DrawingCanvas } from "./drawing-canvas";

export const Canvas = () => {
    const { elements, updateElement, selectElement, selectedElementId, currentFace, isDrawing } = useEditor();

    // Helper to render a list of elements
    const renderElements = (faceElements: EditorElement[]) => {
        return (
            <>
                {faceElements.map((el) => (
                    <motion.div
                        key={el.id}
                        drag={!isDrawing} // Disable drag when drawing
                        dragMomentum={false}
                        onDragEnd={(_, info) => {
                            updateElement(el.id, {
                                x: el.x + info.offset.x,
                                y: el.y + info.offset.y
                            });
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDrawing) selectElement(el.id);
                        }}
                        className={cn(
                            "absolute cursor-move hover:ring-1 ring-blue-400 p-2",
                            selectedElementId === el.id && "ring-2 ring-blue-600",
                            isDrawing && "pointer-events-none" // Pass through events when drawing
                        )}
                        style={{
                            left: el.x,
                            top: el.y,
                            fontSize: el.fontSize,
                            fontFamily: el.fontFamily,
                            color: el.color,
                            transform: `rotate(${el.rotation}deg)`,
                            zIndex: el.type === "image" ? 0 : 10 // Text on top of images usually
                        }}
                    >
                        {el.type === "text" && (
                            <p className="whitespace-pre-wrap select-none">
                                {el.content}
                            </p>
                        )}
                        {el.type === "emoji" && (
                            <span className="select-none" style={{ fontSize: el.fontSize }}>{el.content}</span>
                        )}
                        {el.type === "image" && (
                            <img
                                src={el.content}
                                alt="element"
                                className="w-full h-full object-contain pointer-events-none select-none"
                                style={{ width: el.width, height: el.height }}
                            />
                        )}
                        {el.type === "draw" && (
                            // Drawings are just images effectively
                            <img
                                src={el.content}
                                alt="drawing"
                                className="w-full h-full object-contain pointer-events-none select-none"
                                style={{ width: el.width, height: el.height }}
                            />
                        )}
                    </motion.div>
                ))}
                {/* Render Drawing Canvas if this is the current face and drawing is enabled */}
                {isDrawing && currentFace === (faceElements.length > 0 ? faceElements[0].face : currentFace) && (
                    <DrawingCanvas width={600} height={800} />
                )}
            </>
        );
    };

    const frontElements = elements.filter(el => el.face === "front");
    const insideLeftElements = elements.filter(el => el.face === "inside-left");
    const insideRightElements = elements.filter(el => el.face === "inside-right");

    // Helper to wrap the drawing canvas logic correctly
    const renderFace = (faceName: string, elementsList: EditorElement[]) => {
        const isActive = currentFace === faceName;
        return (
            <div className="relative w-full h-full">
                {renderElements(elementsList)}
                {/* Drawing canvas should be on top if active */}
                {isActive && isDrawing && <DrawingCanvas width={600} height={800} />}
            </div>
        );
    }

    return (
        <div
            className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden relative"
            onClick={() => selectElement(null)}
        >
            <CardWrapper
                frontContent={renderFace("front", frontElements)}
                insideLeftContent={renderFace("inside-left", insideLeftElements)}
                insideRightContent={renderFace("inside-right", insideRightElements)}
            />
        </div>
    );
};
