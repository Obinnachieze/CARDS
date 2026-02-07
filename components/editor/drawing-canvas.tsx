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
    const { isDrawing, brushColor, brushSize, addElement, currentFace } = useEditor();
    const [isDrawingState, setIsDrawingState] = useState(false);
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
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        setLastPos(currentPos);
    };

    const stopDrawing = () => {
        if (!isDrawingState) return;
        setIsDrawingState(false);
        saveDrawing();
    };

    const saveDrawing = () => {
        if (!canvasRef.current) return;
        // Check if canvas is empty? (optimization)

        const dataUrl = canvasRef.current.toDataURL("image/png");
        // Create an image element from the drawing
        // We add it to the center or top-left? Top-left since it's a layer overlay
        addElement("draw", dataUrl, { x: 0, y: 0, width, height, face: currentFace });

        // Clear canvas for next drawing
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, width, height);
    };

    // Handle global mouse up to stop drawing if cursor leaves canvas
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDrawingState) stopDrawing();
        };
        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    }, [isDrawingState]);

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
