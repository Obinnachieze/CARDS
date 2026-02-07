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
    const { elements, currentFace, isDrawing } = useEditor();

    // Helper to render elements for a specific face (simplified for preview)
    // We duplicate this logic from Canvas but stripped of editing handlers
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
                            <p className="whitespace-pre-wrap">{el.content}</p>
                        )}
                        {el.type === "emoji" && (
                            <span style={{ fontSize: el.fontSize }}>{el.content}</span>
                        )}
                        {(el.type === "image" || el.type === "draw") && (
                            <img
                                src={el.content}
                                alt="element"
                                className="object-contain"
                                style={{ width: el.width, height: el.height }}
                            />
                        )}
                    </div>
                ))}
            </>
        );
    };

    const frontElements = elements.filter(el => el.face === "front");
    const insideLeftElements = elements.filter(el => el.face === "inside-left");
    const insideRightElements = elements.filter(el => el.face === "inside-right");

    const renderFace = (elements: EditorElement[]) => (
        <div className="relative w-full h-full overflow-hidden">
            {renderPreviewElements(elements)}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[80vw] max-h-[90vh] w-full h-full bg-transparent border-0 shadow-none flex items-center justify-center p-0">
                <div className="relative w-full h-full flex items-center justify-center pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <CardWrapper
                        frontContent={renderFace(frontElements)}
                        insideLeftContent={renderFace(insideLeftElements)}
                        insideRightContent={renderFace(insideRightElements)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
