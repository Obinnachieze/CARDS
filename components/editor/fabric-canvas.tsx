"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { EditorElement } from "./types";

const PENCIL_CURSOR = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE3IDNsNCA0TDcuNSAyMC41IDIgMjJsMS41LTUuNXoiLz48cGF0aCBkPSJNMTUgNmw0IDQiLz48L3N2Zz4=") 0 24, auto';
const ERASER_CURSOR = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTcgMTEgMiAyIDItMi0yIDJ6Ii8+PHBhdGggZD0iTTIwIDljLTIuMiAwLTQtMS44LTQtNHMtMS44LTQtNC00LTQgMS44LTQgNHMxLjggNCA0IDR6Ii8+PHBhdGggZD0iTTE4IDEzdjRjMCAxLjEtLjkgMi0yIDJ6Ii8+PC9zdmc+") 0 24, auto';
const MARKER_CURSOR = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTEyIDUgNyA3LTkgOWgtNGwtMi0yIDItMnoiLz48cGF0aCBkPSJtMTUgOCA0IDQiLz48L3N2Zz4=") 0 24, auto';
const HIGHLIGHTER_CURSOR = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTkgMTIgMiAybDktOWwtMi0yeiIvPjxwYXRoIGQ9Im0xNyA0IDIgMiIvPjxwYXRoIGQ9Im0xMSA4IDQgNCIvPjxwYXRoIGQ9Im0yIDExIDkgOSIvPjwvc3ZnZz4=") 0 24, auto';

interface FabricCanvasProps {
    width: number;
    height: number;
    elements: EditorElement[];
    readOnly?: boolean;
    onUpdate?: (id: string, updates: Partial<EditorElement>) => void;
    onSelect?: (id: string | null) => void;
    onAdd?: (type: any, content: any, style?: any) => void;
    onRemove?: (id: string) => void;
    isDrawing?: boolean;
    brushColor?: string;
    brushSize?: number;
    brushType?: string;
    zoom?: number;
    backgroundColor?: string;
}

export const FabricCanvas = ({
    width,
    height,
    elements,
    readOnly = false,
    onUpdate,
    onSelect,
    onAdd,
    onRemove,
    isDrawing = false,
    brushColor = "#000000",
    brushSize = 5,
    brushType = "pencil",
    zoom = 1,
    backgroundColor = "transparent",
}: FabricCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const isInternalUpdate = useRef(false);

    const onSelectRef = useRef(onSelect);
    const onUpdateRef = useRef(onUpdate);
    const onAddRef = useRef(onAdd);
    const onRemoveRef = useRef(onRemove);
    const readOnlyRef = useRef(readOnly);
    const isMounted = useRef(true);

    useEffect(() => {
        readOnlyRef.current = readOnly;
    }, [readOnly]);

    useEffect(() => {
        onSelectRef.current = onSelect;
        onUpdateRef.current = onUpdate;
        onAddRef.current = onAdd;
        onRemoveRef.current = onRemove;
    }, [onSelect, onUpdate, onAdd, onRemove]);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

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
                onSelectRef.current?.(e.selected[0].id);
            }
        });

        canvas.on("selection:updated", (e) => {
            if (e.selected && e.selected.length > 0) {
                // @ts-ignore - custom property
                onSelectRef.current?.(e.selected[0].id);
            }
        });

        canvas.on("selection:cleared", (e) => {
            onSelectRef.current?.(null);
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
            };

            if (obj.type === 'textbox') {
                // For textboxes, scale changes font size and box width
                const scaleX = obj.scaleX || 1;
                const scaleY = obj.scaleY || 1;
                const tb = obj as fabric.Textbox;

                updates.width = tb.width! * scaleX;
                updates.fontSize = tb.fontSize! * scaleY; // Use scaleY for font size to avoid distortion

                // Reset scale to 1 to bake in the transformations
                tb.set({
                    width: updates.width,
                    fontSize: updates.fontSize,
                    scaleX: 1,
                    scaleY: 1
                });
                // Re-calculate layout boundaries
                tb.setCoords();
            } else {
                updates.width = obj.width! * (obj.scaleX || 1);
                updates.height = obj.height! * (obj.scaleY || 1);
            }

            onUpdateRef.current?.(id, updates);
        });

        // Text Editing Events
        canvas.on("text:changed", (e) => {
            const obj = e.target;
            if (obj && obj.type === "textbox") {
                // @ts-ignore
                const id = obj.id;
                if (id && onUpdateRef.current) {
                    onUpdateRef.current(id, { content: (obj as fabric.Textbox).text });
                }
            }
        });

        canvas.on("text:editing:exited", (e) => {
            const obj = e.target;
            if (obj && obj.type === "textbox") {
                // @ts-ignore - custom property
                const id = obj.id;
                if (id && onUpdateRef.current) {
                    onUpdateRef.current(id, {
                        content: (obj as fabric.Textbox).text,
                        width: obj.width,
                        height: obj.height
                    });
                }
            }
        });

        // Hover Effects
        canvas.on("mouse:over", (e) => {
            if (e.target && !readOnlyRef.current) {
                if (e.target.type === "textbox") {
                    // Provide visual indication of draggability/editability
                    e.target.set({
                        borderColor: '#9333ea',
                        cornerColor: '#9333ea',
                        transparentCorners: false,
                        borderOpacityWhenMoving: 0.8,
                    });
                    canvas.renderAll();
                }
            }
        });

        canvas.on("mouse:out", (e) => {
            if (e.target && !readOnlyRef.current) {
                // Revert custom hover properties if needed, 
                // though mostly default active selection handles borders when clicked.
                canvas.renderAll();
            }
        });

        canvas.on("path:created", (e: any) => {
            if (!isMounted.current || readOnly) return;
            const pathObj = e.path as fabric.Path;
            if (pathObj) {
                // Determine if we need to remove the path from canvas immediately
                // because React state will re-render it. Best to remove it so we don't duplicate.
                canvas.remove(pathObj);

                onAddRef.current?.("draw", "", {
                    path: pathObj.path,
                    color: pathObj.stroke,
                    brushSize: pathObj.strokeWidth,
                    x: pathObj.left,
                    y: pathObj.top,
                    width: pathObj.width,
                    height: pathObj.height,
                    opacity: pathObj.opacity,
                    mixBlendMode: pathObj.globalCompositeOperation,
                });
            }
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
                    const textOptions: any = {
                        // @ts-ignore
                        id: el.id,
                        left: el.x,
                        top: el.y,
                        fontSize: el.fontSize,
                        fontFamily: el.fontFamily,
                        fill: el.color,
                        angle: el.rotation,
                        selectable: !readOnly,
                        padding: 8, // Adds breathing room for the border
                        editingBorderColor: '#9333ea',
                        cursorColor: '#9333ea',
                        transparentCorners: false,
                        cornerStyle: 'circle',
                        cornerColor: 'white',
                        cornerStrokeColor: '#9333ea',
                        borderColor: '#9333ea',
                        borderDashArray: [4, 4],
                        hoverCursor: 'grab',
                        moveCursor: 'grabbing',
                    };
                    if (el.width !== undefined) textOptions.width = el.width;

                    obj = new fabric.Textbox(el.content, textOptions);

                    // Auto-focus new text elements
                    if (!readOnly) {
                        setTimeout(() => {
                            try {
                                if (!isMounted.current || !fabricCanvasRef.current) return;
                                const canvasInstance = fabricCanvasRef.current;
                                canvasInstance.setActiveObject(obj as fabric.Object);
                                (obj as fabric.Textbox).enterEditing();
                                (obj as fabric.Textbox).selectAll();
                                canvasInstance.requestRenderAll();
                            } catch (e) {
                                console.error("Auto-focus failed:", e);
                            }
                        }, 50);
                    }
                } else if (el.type === "draw" && el.path) {
                    obj = new fabric.Path(el.path, {
                        // @ts-ignore
                        id: el.id,
                        left: el.x,
                        top: el.y,
                        stroke: el.color,
                        strokeWidth: el.brushSize || 5,
                        fill: '', // Paths are usually just strokes
                        opacity: el.opacity || 1,
                        globalCompositeOperation: el.mixBlendMode || 'source-over',
                        selectable: !readOnly,
                        angle: el.rotation || 0,
                    });
                } else if (el.type === "image" || (el.type === "draw" && !el.path)) {
                    fabric.Image.fromURL(el.content, (img) => {
                        if (!isMounted.current || !fabricCanvasRef.current) return;

                        img.set({
                            // @ts-ignore
                            id: el.id,
                            left: el.x,
                            top: el.y,
                            angle: el.rotation,
                            selectable: !readOnly,
                        });
                        // Scale image proportionally
                        if (el.width && el.height && img.width && img.height) {
                            const scale = Math.min(el.width / img.width, el.height / img.height);
                            img.set({ scaleX: scale, scaleY: scale });
                        }
                        if (el.mixBlendMode) {
                            // @ts-ignore
                            img.globalCompositeOperation = el.mixBlendMode;
                        }

                        // Add an error handler for the img element if possible
                        if (img.getElement()) {
                            img.getElement().onerror = () => {
                                console.error("Failed to load image element:", el.content);
                            };
                        }

                        canvas.add(img);
                        canvas.renderAll();
                    }, el.content ? { crossOrigin: 'anonymous' } : undefined);
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
                // Update existing object
                // Don't update from React state if the user is actively manipulating it
                if (canvas.getActiveObject() === obj) {
                    return;
                }

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
                    obj.set({
                        padding: 8,
                        editingBorderColor: '#9333ea',
                        cursorColor: '#9333ea',
                        transparentCorners: false,
                        cornerStyle: 'circle',
                        cornerColor: 'white',
                        cornerStrokeColor: '#9333ea',
                        borderColor: '#9333ea',
                        borderDashArray: [4, 4],
                        hoverCursor: 'grab',
                        moveCursor: 'grabbing',
                    });
                }

                if (el.type === 'shape') {
                    obj.set('fill', el.color);
                }

                if (el.type === 'draw') {
                    obj.set({
                        left: el.x,
                        top: el.y,
                        angle: el.rotation,
                        stroke: el.color,
                    })
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


    // Drawing Mode / Eraser Handlers
    // Keep stable references to avoid memory leaks
    const handleEraserRef = useRef<((e: fabric.IEvent) => void) | undefined>(undefined);
    const handleEraserMoveRef = useRef<((e: fabric.IEvent) => void) | undefined>(undefined);

    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        const canvas = fabricCanvasRef.current;

        // Reset state
        canvas.isDrawingMode = isDrawing && brushType !== "eraser";

        // Calculate current cursor
        let currentCursor = 'default';
        if (isDrawing) {
            if (brushType === 'eraser') currentCursor = ERASER_CURSOR;
            else if (brushType === 'pencil') currentCursor = PENCIL_CURSOR;
            else if (brushType === 'marker') currentCursor = MARKER_CURSOR;
            else if (brushType === 'highlighter') currentCursor = HIGHLIGHTER_CURSOR;
            else currentCursor = 'crosshair';
        }

        canvas.defaultCursor = currentCursor;
        canvas.hoverCursor = currentCursor;

        // Remove active eraser handlers if any
        if (handleEraserRef.current) {
            canvas.off('mouse:down', handleEraserRef.current);
            handleEraserRef.current = undefined;
        }
        if (handleEraserMoveRef.current) {
            canvas.off('mouse:move', handleEraserMoveRef.current);
            handleEraserMoveRef.current = undefined;
        }

        if (isDrawing && brushType === "eraser") {
            const handleEraser = (e: fabric.IEvent) => {
                if (!e.pointer) return;
                const pointer = e.pointer;
                const objects = canvas.getObjects();

                objects.forEach((obj) => {
                    if (obj.containsPoint(pointer)) {
                        // @ts-ignore
                        const id = obj.id;
                        if (id && onRemoveRef.current) {
                            onRemoveRef.current(id);
                        }
                    }
                });
            };

            const handleEraserMove = (e: fabric.IEvent) => {
                if (e.e && (e.e as MouseEvent).buttons === 1) handleEraser(e);
            };

            handleEraserRef.current = handleEraser;
            handleEraserMoveRef.current = handleEraserMove;

            canvas.on('mouse:down', handleEraser);
            canvas.on('mouse:move', handleEraserMove);

            return; // Exit early since eraser isn't standard drawing mode
        }

        if (isDrawing) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = brushSize;

            if (brushType === 'marker') {
                canvas.freeDrawingBrush.width = brushSize * 2.5;
            } else if (brushType === 'highlighter') {
                canvas.freeDrawingBrush.width = brushSize * 4;
                canvas.freeDrawingBrush.color = brushColor.length === 7 ? brushColor + '80' : brushColor;
            }
        }
    }, [isDrawing, brushColor, brushSize, brushType]);

    // Apply Zoom
    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        fabricCanvasRef.current.setZoom(zoom);
        // Ensure boundaries are preserved if scaling occurs (mostly visual)
    }, [zoom]);

    // Update Background Color
    useEffect(() => {
        if (!fabricCanvasRef.current) return;
        const canvas = fabricCanvasRef.current;
        canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
    }, [backgroundColor]);


    return <canvas ref={canvasRef} />;
};
