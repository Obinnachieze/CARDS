"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { EditorElement, ElementType, CardFace, CardMode } from "./types";

const generateId = () => Math.random().toString(36).substr(2, 9);

interface EditorContextType {
    elements: EditorElement[];
    addElement: (type: ElementType, content: string, style?: Partial<EditorElement>) => void;
    updateElement: (id: string, updates: Partial<EditorElement>) => void;
    removeElement: (id: string) => void;
    selectElement: (id: string | null) => void;
    selectedElementId: string | null;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    selectedElement: EditorElement | undefined;

    // New Features
    currentFace: CardFace;
    setCurrentFace: (face: CardFace) => void;
    cardMode: CardMode;
    setCardMode: (mode: CardMode) => void;
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
    brushColor: string;
    setBrushColor: (color: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    currentFont: string;
    setCurrentFont: (font: string) => void;

    // Zoom
    zoom: number;
    setZoom: (zoom: number) => void;

    // History
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider = ({
    children,
    initialElements = [],
    initialBackgroundColor = "#ffffff"
}: {
    children: React.ReactNode;
    initialElements?: EditorElement[];
    initialBackgroundColor?: string;
}) => {
    // History State
    const [past, setPast] = useState<EditorElement[][]>([]);
    const [future, setFuture] = useState<EditorElement[][]>([]);

    const [elements, setElements] = useState<EditorElement[]>(initialElements);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);

    // New State
    const [currentFace, setCurrentFace] = useState<CardFace>("front");
    const [cardMode, setCardMode] = useState<CardMode>("foldable");
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [currentFont, setCurrentFont] = useState("Inter");
    const [zoom, setZoom] = useState(0.75);

    const saveHistory = useCallback(() => {
        setPast(prev => [...prev, elements]);
        setFuture([]);
    }, [elements]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture(prev => [elements, ...prev]);
        setElements(previous);
        setPast(newPast);
    }, [past, elements]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, elements]);
        setElements(next);
        setFuture(newFuture);
    }, [future, elements]);

    const addElement = useCallback((type: ElementType, content: string, style?: Partial<EditorElement>) => {
        saveHistory();
        const newElement: EditorElement = {
            id: generateId(),
            type,
            content,
            x: 100,
            y: 100,
            rotation: 0,
            fontSize: type === "emoji" ? 64 : 24,
            fontFamily: currentFont,
            color: type === "text" ? "#000000" : undefined,
            width: type === "image" ? 200 : undefined,
            height: type === "image" ? 200 : undefined,
            face: currentFace,
            ...style,
        };
        setElements((prev) => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }, [currentFace, currentFont, saveHistory]);

    const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
        // Optimization: For dragging (continuous updates), strictly we should save history on drag start, not every move. 
        // But for simplicity/robustness in this demo, let's just update. 
        // Real implementation would split "setElements" and "commitHistory".
        // For now, we won't autosave history on every drag frame (canvas handles that), 
        // but for other updates (text change, color change), we should.
        // We can add a flag to updateElement context or just assume distinct actions.
        // Let's rely on components calling saveHistory explicitly?? 
        // No, simpler to just save history here, BUT for drag it's bad.
        // Let's modify updateElement to take an option?

        // Actually, existing canvas calls updateElement on DragEnd. So that is one discrete action. Good.
        // Text input calls updateElement on change? Yes. That might spam history.
        // For now, we accept it might spam history on text input.

        // Better: check if updates effectively change anything?

        // Let's save history here.
        // saveHistory(); 
        // Wait, since we need `elements` state for saveHistory, and `updateElement` uses function update...
        // We can't easily access current `elements` inside the callback without dependency.
        // `saveHistory` depends on `elements`. So `updateElement` changes when `elements` changes.
        // This is fine.

        setElements((prev) => {
            // We need to save history of 'prev' before changing it.
            // But we can't invoke setPast here easily without causing loops if not careful.
            // Actually we can.

            // BUT, calling properties of state setter is not pure.
            // It's better to do:

            const next = prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
            if (next === prev) return prev;

            // We can't call setPast here because this is a reducer-like pure function ideally.
            return next;
        });
    }, []);

    // We need a wrapper for updateElement that handles History
    const updateElementWithHistory = useCallback((id: string, updates: Partial<EditorElement>) => {
        setElements(prev => {
            setPast(history => [...history, prev]);
            setFuture([]);
            return prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
        });
    }, []);


    const removeElement = useCallback((id: string) => {
        setElements(prev => {
            setPast(history => [...history, prev]);
            setFuture([]);
            return prev.filter((el) => el.id !== id);
        });
        if (selectedElementId === id) setSelectedElementId(null);
    }, [selectedElementId]);

    const selectElement = useCallback((id: string | null) => {
        setSelectedElementId(id);
    }, []);

    const selectedElement = elements.find((el) => el.id === selectedElementId);

    return (
        <EditorContext.Provider
            value={{
                elements,
                addElement,
                updateElement: updateElementWithHistory, // Use the history-aware version
                removeElement,
                selectElement,
                selectedElementId,
                backgroundColor,
                setBackgroundColor,
                selectedElement,
                currentFace,
                setCurrentFace,
                cardMode,
                setCardMode,
                isDrawing,
                setIsDrawing,
                brushColor,
                setBrushColor,
                brushSize,
                setBrushSize,
                currentFont,
                setCurrentFont,
                zoom,
                setZoom,
                undo,
                redo,
                canUndo: past.length > 0,
                canRedo: future.length > 0
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) throw new Error("useEditor must be used within an EditorProvider");
    return context;
};
