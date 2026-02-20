"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { EditorElement, ElementType, CardFace, CardMode, DrawingTool, CardPage, Project, EditorTab } from "./types";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";


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
    workspaceProjects: Project[];
    activeWorkspaceIndex: number;
    currentProjectId: string | null;
    createNewProject: () => void;
    saveProjectAs: (name: string) => Promise<void>;
    saveCurrentProject: () => Promise<void>;
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    clearAllProjects: () => Promise<void>;
    exportProjectAsJSON: () => void;
    importProjectFromJSON: (file: File) => void;
    downloadAsImage: () => void;

    // Workspace Management
    switchToWorkspaceProject: (index: number) => void;
    removeWorkspaceProject: (index: number) => void;

    setCelebration: (cardId: string, type: "none" | "confetti" | "fireworks" | "floating-emoji", emoji?: string) => void;
    setAudio: (cardId: string, src: string | undefined) => void;

    activeTool: EditorTab | null;
    setActiveTool: (tool: EditorTab | null) => void;

    // Project Name for Sidebar Sync
    projectName: string;
    setProjectName: (name: string) => void;

    // Auth
    user: User | null;

    // Settings Sidebar
    isSettingsOpen: boolean;
    setIsSettingsOpen: (open: boolean) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider = ({
    children,

    initialElements = [],
    initialBackgroundColor = "#ffffff",
    initialCardMode = "foldable",
    initialProjectId = null,
    initialCards = null
}: {
    children: React.ReactNode;
    initialElements?: EditorElement[];
    initialBackgroundColor?: string;
    initialCardMode?: CardMode;
    initialProjectId?: string | null;
    initialCards?: CardPage[] | null;
}) => {
    // Initial State setup
    const initialCardId = generateId();
    const [cards, setCards] = useState<CardPage[]>(initialCards || [{
        id: initialCardId,
        elements: initialElements,
        backgroundColor: initialBackgroundColor,
        currentFace: "front"
    }]);
    const [activeCardId, setActiveCardId] = useState<string | null>(initialCards ? initialCards[0].id : initialCardId);

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
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProjectId);
    const [projects, setProjects] = useState<Project[]>([]);
    const [workspaceProjects, setWorkspaceProjects] = useState<Project[]>([]);
    const [activeWorkspaceIndex, setActiveWorkspaceIndex] = useState(0);

    // UI State
    const [activeTool, setActiveTool] = useState<import("./types").EditorTab | null>(null);
    const [projectName, setProjectName] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Ref for debouncing auto-save
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Ref to prevent infinite loops during state swapping
    const isSwappingRef = useRef(false);

    // Update workspace record whenever active project state changes
    useEffect(() => {
        if (isSwappingRef.current) return;

        setWorkspaceProjects(prev => {
            const updated = [...prev];
            if (updated[activeWorkspaceIndex]) {
                updated[activeWorkspaceIndex] = {
                    ...updated[activeWorkspaceIndex],
                    name: projectName,
                    cardMode: cardMode,
                    cards: cards,
                    updatedAt: Date.now()
                };
            }
            return updated;
        });
    }, [projectName, cardMode, cards, activeWorkspaceIndex]);

    // Initial Auth Load and Workspace Setup
    useEffect(() => {
        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Initialize workspace if empty
            setWorkspaceProjects([{
                id: generateId(),
                name: "",
                updatedAt: Date.now(),
                cards: [{ id: "card-1", elements: [], backgroundColor: "#ffffff", currentFace: "front" }],
                cardMode: "postcard"
            }]);
        };

        setup();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        const storedProjects = localStorage.getItem("card-projects");
        if (storedProjects) {
            try {
                const parsed = JSON.parse(storedProjects);
                setProjects(parsed);

                // If we have a project ID in the URL, load it now
                const projectIdFromUrl = searchParams.get("project");
                if (projectIdFromUrl) {
                    const project = parsed.find((p: any) => p.id === projectIdFromUrl);
                    if (project) {
                        setCards(project.cards);
                        setCardMode(project.cardMode);
                        setCurrentProjectId(project.id);
                        setProjectName(project.name);
                        setActiveCardId(project.cards[0]?.id || null);
                    }
                }
            } catch (e) {
                console.error("Failed to parse projects", e);
            }
        }
    }, [searchParams]);

    const createNewProject = useCallback(() => {
        const newProject: Project = {
            id: generateId(),
            name: "",
            updatedAt: Date.now(),
            cards: [{ id: "card-1", elements: [], backgroundColor: "#ffffff", currentFace: "front" }],
            cardMode: "postcard"
        };

        setWorkspaceProjects(prev => [...prev, newProject]);
        setActiveWorkspaceIndex(prev => prev + 1);

        // Load the new project state
        setCards(newProject.cards);
        setCardMode(newProject.cardMode);
        setCurrentProjectId(null);
        setProjectName("");
        setActiveCardId("card-1");
        setPast([]);
        setFuture([]);
    }, []);

    const switchToWorkspaceProject = useCallback((index: number) => {
        const project = workspaceProjects[index];
        if (!project) return;

        isSwappingRef.current = true;
        setActiveWorkspaceIndex(index);
        setCards(project.cards);
        setCardMode(project.cardMode);
        setCurrentProjectId(project.id.startsWith("local-") ? null : project.id);
        setProjectName(project.name);
        setActiveCardId(project.cards[0]?.id || null);
        setPast([]);
        setFuture([]);

        // Brief timeout to let effects finish before re-enabling sync
        setTimeout(() => {
            isSwappingRef.current = false;
        }, 100);
    }, [workspaceProjects]);

    const removeWorkspaceProject = useCallback((index: number) => {
        setWorkspaceProjects(prev => {
            if (prev.length <= 1) return prev;
            const updated = prev.filter((_, i) => i !== index);
            if (activeWorkspaceIndex >= updated.length) {
                switchToWorkspaceProject(updated.length - 1);
            } else if (activeWorkspaceIndex === index) {
                switchToWorkspaceProject(Math.max(0, index - 1));
            }
            return updated;
        });
    }, [activeWorkspaceIndex, switchToWorkspaceProject]);

    const saveProjectAs = useCallback(async (name: string) => {
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
        setProjectName(name); // Sync name state
        localStorage.setItem("card-projects", JSON.stringify(updatedProjects));

        // Save to Supabase
        const supabase = createClient();
        try {
            await supabase.from('projects').insert({
                id: newId,
                user_id: user?.id, // Track owner
                name: name,
                cards: cards,
                card_mode: cardMode,
                updated_at: new Date().toISOString(),
                is_public: true // Default to public for sharing
            });
        } catch (error: any) {
            console.error("Failed to save to Supabase:", error.message || error);
            throw error;
        }

        // Redirect to project URL
        router.push(`/create/${cardMode}?project=${newId}`);
    }, [cards, cardMode, projects, user, router]);

    const saveCurrentProject = useCallback(async () => {
        if (!currentProjectId) return;

        const project = projects.find(p => p.id === currentProjectId);
        const currentName = projectName || project?.name || "Untitled Project";

        const updatedProjects = projects.map(p =>
            p.id === currentProjectId
                ? { ...p, cards, cardMode, name: currentName, updatedAt: Date.now() }
                : p
        );
        setProjects(updatedProjects);
        localStorage.setItem("card-projects", JSON.stringify(updatedProjects));

        // Save to Supabase (only if logged in)
        if (!user) return;

        const supabaseClient = createClient();
        try {
            const { error } = await supabaseClient.from('projects').upsert({
                id: currentProjectId,
                user_id: user.id, // Ensure user_id is set
                name: currentName,
                cards: cards,
                card_mode: cardMode,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            console.log("Auto-saved to cloud");
        } catch (error: any) {
            console.error("Failed to save to Supabase (Auto-save):", error.message || JSON.stringify(error));
        }
    }, [cards, cardMode, projects, currentProjectId, user, projectName]);

    // Auto-save logic
    useEffect(() => {
        if (currentProjectId && user) {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

            autoSaveTimerRef.current = setTimeout(() => {
                saveCurrentProject();
            }, 3000); // 3 second debounce
        }

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [cards, cardMode, saveCurrentProject, currentProjectId, user]);

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
            setFuture([]);

            // Update URL to match current project
            router.push(`/create/${project.cardMode}?project=${project.id}`);
        }
    }, [projects, saveHistory, router]);

    const deleteProject = useCallback((id: string) => {
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
        localStorage.setItem("card-projects", JSON.stringify(updatedProjects));
    }, [projects]);

    const clearAllProjects = useCallback(async () => {
        // Clear local storage and state
        setProjects([]);
        localStorage.removeItem("card-projects");

        // Reset Workspace (Rooms) to initial state
        const initialRoomId = generateId();
        const initialRoom: Project = {
            id: initialRoomId,
            name: "",
            updatedAt: Date.now(),
            cards: [{ id: "card-1", elements: [], backgroundColor: "#ffffff", currentFace: "front" }],
            cardMode: "postcard"
        };

        setWorkspaceProjects([initialRoom]);
        setActiveWorkspaceIndex(0);

        // Reset Active State
        setCards(initialRoom.cards);
        setCardMode(initialRoom.cardMode);
        setCurrentProjectId(null);
        setProjectName("");
        setActiveCardId("card-1");
        setPast([]);
        setFuture([]);

        // Clear URL project parameter
        router.push(`/create/postcard`);

        // Delete all projects from Supabase if user is logged in
        if (user) {
            const supabaseClient = createClient();
            try {
                const { error } = await supabaseClient
                    .from('projects')
                    .delete()
                    .eq('user_id', user.id);
                if (error) throw error;
                console.log("Cleared cloud projects entirely");
            } catch (error: any) {
                console.error("Failed to clear cloud projects:", error.message);
            }
        }
    }, [user, router]);




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

        // Requirement: New page resets save state to show input
        setCurrentProjectId(null);
        setProjectName("");
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
            workspaceProjects,
            activeWorkspaceIndex,
            currentProjectId,
            createNewProject,
            saveProjectAs,
            saveCurrentProject,
            loadProject,
            deleteProject,
            clearAllProjects,
            exportProjectAsJSON,
            importProjectFromJSON,
            downloadAsImage,

            switchToWorkspaceProject,
            removeWorkspaceProject,

            setCelebration,
            setAudio,
            activeTool,
            setActiveTool,
            projectName,
            setProjectName,
            user,
            isSettingsOpen, setIsSettingsOpen
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



