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

    const addElement = useCallback((type: ElementType, content: string, style?: Partial<EditorElement>) => {
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
            face: currentFace, // Add to current face
            ...style,
        };
        setElements((prev) => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }, [currentFace, currentFont]);

    const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
        setElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
        );
    }, []);

    const removeElement = useCallback((id: string) => {
        setElements((prev) => prev.filter((el) => el.id !== id));
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
                updateElement,
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
