"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditor } from "./editor-context";

export const DrawingCanvas = ({ width, height }: { width: number; height: number }) => {
    const { isDrawing, brushColor, brushSize, addElement, currentFace } = useEditor();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPainting, setIsPainting] = useState(false);

    // Initial setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = brushColor;
        }
    }, [width, height]);

    // Update brush style
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = brushColor;
        }
    }, [brushColor, brushSize]);

    const startPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const coordinates = getCoordinates(e);
        if (!coordinates) return;

        setIsPainting(true);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(coordinates.x, coordinates.y);
        }
    };

    const paint = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isPainting) return;
        const coordinates = getCoordinates(e);
        if (!coordinates) return;

        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.lineTo(coordinates.x, coordinates.y);
            ctx.stroke();
        }
    };

    const endPaint = () => {
        if (!isPainting) return;
        setIsPainting(false);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.closePath();
            // Here we could save the drawing as an image element
            saveDrawing();
        }
    };

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const saveDrawing = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL("image/png");
        // Create an image element from the drawing
        addElement("image", dataUrl, { x: 0, y: 0, width, height, face: currentFace });
        // Clear canvas for next drawing
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, width, height);
    };

    if (!isDrawing) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-50 pointer-events-auto cursor-crosshair"
            onMouseDown={startPaint}
            onMouseMove={paint}
            onMouseUp={endPaint}
            onMouseLeave={endPaint}
        />
    );
};
