"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { EditorElement, ElementType, CardFace, CardMode, DrawingTool, CardPage, Project } from "./types";

const generateId = () => Math.random().toString(36).substr(2, 9);

interface EditorContextType {
    // Multi-Card Support
    cards: CardPage[];
    setCards: React.Dispatch<React.SetStateAction<CardPage[]>>;
    activeCardId: string | null;
    addCard: () => void;
    activateCard: (id: string) => void;
    removeCard: (id: string) => void;
    duplicateCard: (id: string) => void;
    setCardFace: (cardId: string, face: CardFace) => void;

    // Legacy (Proxied to Active Card)
    elements: EditorElement[];
    addElement: (type: ElementType, content: string, style?: Partial<EditorElement>) => void;
    updateElement: (id: string, updates: Partial<EditorElement>) => void;
    removeElement: (id: string) => void;
    selectElement: (id: string | null) => void;
    selectedElementId: string | null;
    selectedElement: EditorElement | undefined;

    backgroundColor: string;
    setBackgroundColor: (color: string) => void;

    // New Features
    currentFace: CardFace; // Keeps compatibility, but derived from active card
    setCurrentFace: (face: CardFace) => void; // Proxies to active card
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
    brushType: DrawingTool;
    setBrushType: (tool: DrawingTool) => void;

    // Zoom
    zoom: number;
    setZoom: (zoom: number) => void;

    // History
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // Projects (Local Storage & File)
    projects: Project[];
    currentProjectId: string | null;
    createNewProject: () => void;
    saveProjectAs: (name: string) => void;
    saveCurrentProject: () => void;
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    exportProjectAsJSON: () => void;
    importProjectFromJSON: (file: File) => void;
    downloadAsImage: () => void;
    setCelebration: (cardId: string, type: "none" | "confetti" | "fireworks" | "floating-emoji", emoji?: string) => void;
    setAudio: (cardId: string, src: string | undefined) => void;

    activeTool: import("./types").EditorTab | null;
    setActiveTool: (tool: import("./types").EditorTab | null) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider = ({
    children,
    initialElements = [],
    initialBackgroundColor = "#ffffff",
    initialCardMode = "foldable"
}: {
    children: React.ReactNode;
    initialElements?: EditorElement[];
    initialBackgroundColor?: string;
    initialCardMode?: CardMode;
}) => {
    // Initial State setup
    const initialCardId = generateId();
    const [cards, setCards] = useState<CardPage[]>([{
        id: initialCardId,
        elements: initialElements,
        backgroundColor: initialBackgroundColor,
        currentFace: "front"
    }]);
    const [activeCardId, setActiveCardId] = useState<string | null>(initialCardId);

    // Derived State
    const activeCard = cards.find(c => c.id === activeCardId) || cards[0];
    const elements = activeCard.elements;
    const backgroundColor = activeCard.backgroundColor;
    const currentFace = activeCard.currentFace;

    // History State (Per Card or Global? Global is simpler for now)
    // We will track the entire `cards` array in history.
    const [past, setPast] = useState<CardPage[][]>([]);
    const [future, setFuture] = useState<CardPage[][]>([]);

    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // Global Settings
    const [cardMode, setCardMode] = useState<CardMode>(initialCardMode);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [currentFont, setCurrentFont] = useState("Inter");
    const [brushType, setBrushType] = useState<DrawingTool>("pencil");
    const [zoom, setZoom] = useState(0.75);

    // Projects State
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    // UI State
    const [activeTool, setActiveTool] = useState<import("./types").EditorTab | null>(null);

    // Load projects from local storage on mount
    useEffect(() => {
        const storedProjects = localStorage.getItem("card-projects");
        if (storedProjects) {
            try {
                setProjects(JSON.parse(storedProjects));
            } catch (e) {
                console.error("Failed to parse projects", e);
            }
        }
    }, []);

    const createNewProject = useCallback(() => {
        setCards([{ id: "card-1", elements: [], backgroundColor: "#ffffff", currentFace: "front" }]);
        setCardMode("postcard");
        setCurrentProjectId(null);
        setActiveCardId("card-1");
        setPast([]);
        setFuture([]);
    }, []);

    const saveProjectAs = useCallback((name: string) => {
        const newId = generateId();
        const newProject: Project = {
            id: newId,
            name,
            updatedAt: Date.now(),
            cards,
            cardMode
        };
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        setCurrentProjectId(newId);
        localStorage.setItem("card-projects", JSON.stringify(updatedProjects));
    }, [cards, cardMode, projects]);

    const saveCurrentProject = useCallback(() => {
        if (!currentProjectId) return;

        const updatedProjects = projects.map(p =>
            p.id === currentProjectId
                ? { ...p, cards, cardMode, updatedAt: Date.now() }
                : p
        );
        setProjects(updatedProjects);
        localStorage.setItem("card-projects", JSON.stringify(updatedProjects));
    }, [cards, cardMode, projects, currentProjectId]);

    const exportProjectAsJSON = useCallback(() => {
        const projectData = {
            version: "1.0",
            timestamp: Date.now(),
            cards,
            cardMode
        };
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `card-project-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [cards, cardMode]);

    const importProjectFromJSON = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json.cards && json.cardMode) {
                    setCards(json.cards);
                    setCardMode(json.cardMode);
                    setCurrentProjectId(null); // Imported projects are "new"/unsaved until saved
                    setActiveCardId(json.cards[0]?.id || null);
                    setPast([]);
                    setFuture([]);
                } else {
                    alert("Invalid project file format");
                }
            } catch (error) {
                console.error("Failed to parse project file", error);
                alert("Failed to parse project file");
            }
        };
        reader.readAsText(file);
    }, []);

    const downloadAsImage = useCallback(async () => {
        // Dynamically import html2canvas to avoid SSR issues
        const html2canvas = (await import("html2canvas")).default;

        // Select the canvas/card element. 
        // We need a reliable way to select the card. We can add an ID to the CardWrapper or a container.
        // For now, let's assume there's an element with ID "card-canvas-container"
        const element = document.getElementById("card-canvas-container");

        if (!element) {
            console.error("Card container not found");
            return;
        }

        try {
            const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `card-design-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to generate image", error);
        }
    }, []);

    const saveHistory = useCallback(() => {
        setPast(prev => [...prev, cards]);
        setFuture([]);
    }, [cards]);

    const loadProject = useCallback((id: string) => {
        const project = projects.find(p => p.id === id);
        if (project) {
            setCards(project.cards);
            setCardMode(project.cardMode);
            setCurrentProjectId(project.id);
            setActiveCardId(project.cards[0]?.id || null);
            saveHistory(); // Optional: Save "Load" as a history step? checking this might break undo/redo stack
            // Better to clear history on new project load
            setPast([]);
            setFuture([]);
        }
    }, [projects, saveHistory]);

    const deleteProject = useCallback((id: string) => {
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
        localStorage.setItem("card-projects", JSON.stringify(updatedProjects));
    }, [projects]);




    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture(prev => [cards, ...prev]);
        setCards(previous);
        setPast(newPast);
    }, [past, cards]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, cards]);
        setCards(next);
        setFuture(newFuture);
    }, [future, cards]);

    // Card Management
    const addCard = useCallback(() => {
        saveHistory();
        const newCard: CardPage = {
            id: generateId(),
            elements: [],
            backgroundColor: "#ffffff",
            currentFace: "front"
        };
        setCards(prev => [...prev, newCard]);
        setActiveCardId(newCard.id);
    }, [saveHistory]);

    const removeCard = useCallback((id: string) => {
        saveHistory();
        setCards(prev => {
            const newCards = prev.filter(c => c.id !== id);
            return newCards.length > 0 ? newCards : [{ id: generateId(), elements: [], backgroundColor: "#ffffff", currentFace: "front" }]; // Prevent empty
        });
        if (activeCardId === id) {
            setActiveCardId(null); // Or select nearest? Canvas will handle re-selection or default
        }
    }, [activeCardId, saveHistory]);

    const duplicateCard = useCallback((id: string) => {
        saveHistory();
        const cardToDuplicate = cards.find(c => c.id === id);
        if (!cardToDuplicate) return;

        const newCard: CardPage = {
            ...cardToDuplicate,
            id: generateId(),
            elements: cardToDuplicate.elements.map(el => ({ ...el, id: generateId() })) // Deep clone ID refresh
        };
        // Insert after original
        const index = cards.findIndex(c => c.id === id);
        const newCards = [...cards];
        newCards.splice(index + 1, 0, newCard);
        setCards(newCards);
        setActiveCardId(newCard.id);
    }, [cards, saveHistory]);

    const activateCard = (id: string) => setActiveCardId(id);

    const setCardFace = useCallback((cardId: string, face: CardFace) => {
        // Don't save history for simple face flips? Or yes?
        // Let's NOT save history for UI toggles to avoid undo spam, unless requested.
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, currentFace: face } : c));
    }, []);

    const setCurrentFace = useCallback((face: CardFace) => {
        if (activeCardId) {
            setCardFace(activeCardId, face);
        }
    }, [activeCardId, setCardFace]);

    // Element Management (Proxies to Active Card)
    const setBackgroundColor = useCallback((color: string) => {
        if (!activeCardId) return;
        saveHistory();
        setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, backgroundColor: color } : c));
    }, [activeCardId, saveHistory]);

    const addElement = useCallback((type: ElementType, content: string, style?: Partial<EditorElement>) => {
        if (!activeCardId) return;
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
        setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, elements: [...c.elements, newElement] } : c));
        setSelectedElementId(newElement.id);
    }, [activeCardId, currentFace, currentFont, saveHistory]);

    const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
        // Assume saving history logic handled elsewhere or accepted debounce
        setCards(prev => prev.map(c => {
            if (c.elements.some(el => el.id === id)) {
                return {
                    ...c,
                    elements: c.elements.map(el => el.id === id ? { ...el, ...updates } : el)
                };
            }
            return c;
        }));
    }, []);

    const removeElement = useCallback((id: string) => {
        saveHistory();
        setCards(prev => prev.map(c => ({
            ...c,
            elements: c.elements.filter(el => el.id !== id)
        })));
        if (selectedElementId === id) setSelectedElementId(null);
    }, [selectedElementId, saveHistory]);


    const selectElement = (id: string | null) => {
        setSelectedElementId(id);
        // If selecting an element, ensure its card is active? 
        // Iterate to find card.
        if (id) {
            const card = cards.find(c => c.elements.some(el => el.id === id));
            if (card && card.id !== activeCardId) setActiveCardId(card.id);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    const setCelebration = useCallback((cardId: string, type: "none" | "confetti" | "fireworks" | "floating-emoji", emoji?: string) => {
        setCards(prev => prev.map(card => {
            if (card.id === cardId) {
                return { ...card, celebration: type, ...(emoji !== undefined ? { celebrationEmoji: emoji } : {}) };
            }
            return card;
        }));
    }, []);

    const setAudio = useCallback((cardId: string, src: string | undefined) => {
        setCards(prev => prev.map(card => {
            if (card.id === cardId) {
                return { ...card, audioSrc: src };
            }
            return card;
        }));
    }, []);

    return (
        <EditorContext.Provider value={{
            cards,
            setCards,
            activeCardId,
            addCard,
            removeCard,
            duplicateCard,
            activateCard,
            setCardFace, // Exported

            elements,
            addElement,
            updateElement,
            removeElement,
            selectElement,
            selectedElementId,
            selectedElement,
            backgroundColor,
            setBackgroundColor,

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
            brushType,
            setBrushType,
            zoom,
            setZoom,
            undo,
            redo,
            canUndo: past.length > 0,
            canRedo: future.length > 0,

            projects,
            currentProjectId,
            createNewProject,
            saveProjectAs,
            saveCurrentProject,
            loadProject,
            deleteProject,
            exportProjectAsJSON,
            importProjectFromJSON,
            downloadAsImage,
            setCelebration,
            setAudio,
            activeTool,
            setActiveTool
        }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) throw new Error("useEditor must be used within EditorProvider");
    return context;
};



