"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditor } from "./editor-context";

interface DrawingCanvasProps {
    width: number;
    height: number;
    zoom?: number; // Optional, but we use bounding rect for robustness
}

export const DrawingCanvas = ({ width, height, zoom = 1 }: DrawingCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isDrawing, brushColor, brushSize, brushType, addElement, currentFace } = useEditor();
    const [isDrawingState, setIsDrawingState] = useState(false);
    const isDrawingRef = useRef(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Helper to get coordinates relative to canvas internal size
    const getCoordinates = (e: React.MouseEvent | MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Calculate scale factor between visual size and internal size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const pos = getCoordinates(e);
        setIsDrawingState(true);
        isDrawingRef.current = true;
        setLastPos(pos);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawingState || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const currentPos = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = brushColor;

        if (brushType === "pencil") {
            ctx.lineWidth = brushSize;
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
        } else if (brushType === "marker") {
            ctx.lineWidth = brushSize * 1.5;
            ctx.globalAlpha = 0.8;
            // Markers are usually additive but here we just dampen opacity
            ctx.globalCompositeOperation = "source-over";
        } else if (brushType === "highlighter") {
            ctx.lineWidth = brushSize * 4;
            ctx.globalAlpha = 0.4;
            // For drawing on the temp canvas, source-over allows building up color (darker on overlap)
            ctx.globalCompositeOperation = "source-over";
            // Note: real highlighter effect requires mix-blend-mode on the element, handled in saveDrawing
            ctx.lineCap = "square"; // Highlighters often square? But round is smoother.
        } else if (brushType === "eraser") {
            ctx.lineWidth = brushSize * 2;
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "destination-out";
        }

        ctx.stroke();

        setLastPos(currentPos);
    };

    const stopDrawing = () => {
        if (!isDrawingRef.current) return;
        setIsDrawingState(false);
        isDrawingRef.current = false;
        saveDrawing();
    };

    const saveDrawing = () => {
        if (!canvasRef.current) return;
        // Check if canvas is empty? (optimization)

        const dataUrl = canvasRef.current.toDataURL("image/png");

        // Determine blend mode
        const blendMode = brushType === "highlighter" ? "multiply" : "normal";

        // Create an image element from the drawing
        addElement("draw", dataUrl, { x: 0, y: 0, width, height, face: currentFace, mixBlendMode: blendMode });

        // Clear canvas for next drawing
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, width, height);
    };

    // Handle global mouse up to stop drawing if cursor leaves canvas
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDrawingRef.current) {
                isDrawingRef.current = false;
                setIsDrawingState(false);
                // Save drawing inline to avoid stale closure on saveDrawing
                if (canvasRef.current) {
                    const dataUrl = canvasRef.current.toDataURL("image/png");
                    const blendMode = brushType === "highlighter" ? "multiply" : "normal";
                    addElement("draw", dataUrl, { x: 0, y: 0, width, height, face: currentFace, mixBlendMode: blendMode });
                    const ctx = canvasRef.current.getContext("2d");
                    ctx?.clearRect(0, 0, width, height);
                }
            }
        };
        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }, [brushType, width, height, currentFace, addElement]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 z-50 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
};
