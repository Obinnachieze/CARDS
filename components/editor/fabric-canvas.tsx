"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { EditorElement } from "./types";

interface FabricCanvasProps {
    width: number;
    height: number;
    elements: EditorElement[];
    readOnly?: boolean;
    onUpdate?: (id: string, updates: Partial<EditorElement>) => void;
    onSelect?: (id: string | null) => void;
    isDrawing?: boolean;
    brushColor?: string;
    brushSize?: number;
    brushType?: string;
    zoom?: number;
}

export const FabricCanvas = ({
    width,
    height,
    elements,
    readOnly = false,
    onUpdate,
    onSelect,
    isDrawing = false,
    brushColor = "#000000",
    brushSize = 5,
    brushType = "pencil",
    zoom = 1,
}: FabricCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const isInternalUpdate = useRef(false);

    // Initialize Fabric Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width,
            height,
            selection: !readOnly,
            preserveObjectStacking: true,
            renderOnAddRemove: true,
        });

        fabricCanvasRef.current = canvas;

        // Selection Events
        canvas.on("selection:created", (e) => {
            if (e.selected && e.selected.length > 0) {
                // @ts-ignore - custom property
                onSelect?.(e.selected[0].id);
            }
        });

        canvas.on("selection:updated", (e) => {
            if (e.selected && e.selected.length > 0) {
                // @ts-ignore - custom property
                onSelect?.(e.selected[0].id);
            }
        });

        canvas.on("selection:cleared", () => {
            onSelect?.(null);
        });

        // Modification Events (Move, Scale, Rotate)
        canvas.on("object:modified", (e) => {
            const obj = e.target;
            if (!obj) return;

            // @ts-ignore - custom property
            const id = obj.id;
            if (!id) return;

            const updates: Partial<EditorElement> = {
                x: obj.left,
                y: obj.top,
                rotation: obj.angle,
                width: obj.width! * obj.scaleX!, // Bake scale into width/height? Or keep scale?
                height: obj.height! * obj.scaleY!,
                // scaleX: obj.scaleX, // If we want to keep scale separate
                // scaleY: obj.scaleY
            };

            // Using width/height updates for consistency with current model
            // Reset scale to 1 after modifying width/height if we want to avoid scale drift
            // But usually better to just store what fabric gives.
            // For text, fontSize scales.

            if (obj.type === 'textbox') {
                // @ts-ignore
                updates.fontSize = (obj as fabric.Textbox).fontSize! * obj.scaleX!;
                // @ts-ignore
                updates.width = obj.width! * obj.scaleX!; // Textbox width is line width
                // Reset scale so it doesn't compound
                obj.scaleX = 1;
                obj.scaleY = 1;
            }

            onUpdate?.(id, updates);
        });

        // Path Created (Unused if external drawing, but good to have)
        canvas.on("path:created", (e) => {
            // Handle drawing output if needed
            // For now, drawing is handled via adding objects
        });


        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, []); // Run once on mount

    // Update Dimensions
    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        fabricCanvasRef.current.setDimensions({ width, height });
    }, [width, height]);

    // Update ReadOnly
    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        fabricCanvasRef.current.interactive = !readOnly;
        fabricCanvasRef.current.selection = !readOnly;
        fabricCanvasRef.current.forEachObject((obj) => {
            obj.selectable = !readOnly;
            obj.evented = !readOnly;
        });
        fabricCanvasRef.current.requestRenderAll();
    }, [readOnly]);

    // Internal vs External Updates
    // We need to sync `elements` prop to canvas objects repeatedly
    // But avoid re-rendering if we just updated it ourselves?
    // Actually, React paradigm: props are source of truth.
    // So we should diff and update.

    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        const canvas = fabricCanvasRef.current;

        // Current objects map
        const currentObjects = new Map<string, fabric.Object>();
        canvas.getObjects().forEach((obj) => {
            // @ts-ignore
            if (obj.id) currentObjects.set(obj.id, obj);
        });

        elements.forEach((el) => {
            let obj = currentObjects.get(el.id);

            if (!obj) {
                // Create new object
                if (el.type === "text") {
                    obj = new fabric.Textbox(el.content, {
                        // @ts-ignore
                        id: el.id,
                        left: el.x,
                        top: el.y,
                        fontSize: el.fontSize,
                        fontFamily: el.fontFamily,
                        fill: el.color,
                        angle: el.rotation,
                        width: el.width, // Textbox needs width
                        selectable: !readOnly,
                    });
                } else if (el.type === "image" || el.type === "draw") {
                    fabric.Image.fromURL(el.content, (img) => {
                        img.set({
                            // @ts-ignore
                            id: el.id,
                            left: el.x,
                            top: el.y,
                            angle: el.rotation,
                            selectable: !readOnly,
                        });
                        // Scale image to fit width/height?
                        if (el.width && el.height) {
                            img.scaleToWidth(el.width);
                            img.scaleToHeight(el.height);
                        }
                        if (el.mixBlendMode) {
                            // @ts-ignore
                            img.globalCompositeOperation = el.mixBlendMode;
                        }
                        canvas.add(img);
                        canvas.renderAll();
                    });
                    return; // Async add
                } else if (el.type === "shape") {
                    if (el.shapeType === 'rect') {
                        obj = new fabric.Rect({
                            // @ts-ignore
                            id: el.id,
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            fill: el.color,
                            angle: el.rotation,
                            selectable: !readOnly
                        });
                    } else if (el.shapeType === 'circle') {
                        obj = new fabric.Circle({
                            // @ts-ignore
                            id: el.id,
                            left: el.x,
                            top: el.y,
                            radius: (el.width || 50) / 2, // Width is diameter
                            fill: el.color,
                            angle: el.rotation,
                            selectable: !readOnly
                        });
                    }
                    // Add supports for more shapes...
                }

                if (obj) {
                    canvas.add(obj);
                }
            } else {
                // Update existing object
                // Skip if currently being dragged/modified by user (to avoid jitter)
                if (canvas.getActiveObject() === obj) return;

                obj.set({
                    left: el.x,
                    top: el.y,
                    angle: el.rotation,
                    // Handle resizing logic if needed
                });

                if (el.type === 'text' && obj instanceof fabric.Textbox) {
                    if (obj.text !== el.content) obj.set('text', el.content);
                    if (obj.fill !== el.color) obj.set('fill', el.color);
                    if (obj.fontSize !== el.fontSize) obj.set('fontSize', el.fontSize);
                    if (obj.fontFamily !== el.fontFamily) obj.set('fontFamily', el.fontFamily);
                }

                if (el.type === 'shape') {
                    obj.set('fill', el.color);
                }

                obj.setCoords();
            }
        });

        // Remove deleted objects
        // currentObjects.forEach((obj, id) => {
        //     if (!elements.find(e => e.id === id)) {
        //         canvas.remove(obj);
        //     }
        // });
        // Correct implementation:
        const newIds = new Set(elements.map(e => e.id));
        currentObjects.forEach((obj, id) => {
            if (!newIds.has(id)) {
                canvas.remove(obj);
            }
        });

        canvas.requestRenderAll();

    }, [elements, readOnly]);


    // Drawing Mode Handlers
    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        const canvas = fabricCanvasRef.current;

        canvas.isDrawingMode = isDrawing;
        if (isDrawing) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = brushSize;

            if (brushType === 'marker') {
                canvas.freeDrawingBrush.width = brushSize * 3;
                // Alpha handling? Fabric brush has alpha in color hex usually
            }
        }
    }, [isDrawing, brushColor, brushSize, brushType]);


    return <canvas ref={canvasRef} />;
};
