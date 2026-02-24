"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditor, EditorProvider } from "@/components/editor/editor-context";
import { Canvas } from "@/components/editor/canvas";
import { Toolbar } from "@/components/editor/toolbar";
import { Header } from "@/components/editor/header";
import { PreviewModal } from "@/components/editor/preview-modal";
import { OnboardingTour } from "@/components/editor/onboarding-tour";
import { EditorElement } from "@/components/editor/types";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

const getTemplate = (type: string) => {
    const template = {
        initialBackgroundColor: "#ffffff",
        initialElements: [] as EditorElement[],
        initialCardMode: "foldable" as "foldable" | "envelope" | "postcard"
    };

    const id = () => Math.random().toString(36).substr(2, 9);

    switch (type?.toLowerCase()) {
        case "birthday-neon":
        case "birthday":
            template.initialBackgroundColor = "#18181b"; // zinc-950
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Birthday!", x: 100, y: 150, fontSize: 48, rotation: 0, color: "#e879f9", face: "front", fontFamily: "Impact" }, // fuchsia-400
                { id: id(), type: "emoji", content: "🎈", x: 300, y: 50, fontSize: 80, rotation: -10, face: "front" },
                { id: id(), type: "emoji", content: "🎂", x: 80, y: 450, fontSize: 100, rotation: 10, face: "front" },
                { id: id(), type: "emoji", content: "✨", x: 120, y: 250, fontSize: 60, rotation: -15, face: "front" },
                { id: id(), type: "text", content: "Make a wish!", x: 150, y: 350, fontSize: 32, rotation: 0, color: "#000000", face: "inside-right", fontFamily: "Inter" }
            ];
            break;
        case "wedding-minimal":
        case "wedding":
            template.initialBackgroundColor = "#f5f5f4"; // stone-100
            template.initialElements = [
                { id: id(), type: "text", content: "You are invited", x: 120, y: 200, fontSize: 40, rotation: 0, color: "#292524", face: "front", fontFamily: "Playfair Display" }, // stone-800
                { id: id(), type: "emoji", content: "🕊️", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🤍", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🌿", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" }
            ];
            break;
        case "anniversary-gold":
        case "anniversary":
            template.initialBackgroundColor = "#451a03"; // amber-950
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Anniversary", x: 60, y: 200, fontSize: 46, rotation: 0, color: "#fbbf24", face: "front", fontFamily: "Playfair Display" }, // amber-400
                { id: id(), type: "emoji", content: "🥂", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "✨", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "💛", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" }
            ];
            break;
        case "love-sunset":
        case "love":
            template.initialBackgroundColor = "#e11d48"; // closest to rose-600 sunset vibe
            template.initialElements = [
                { id: id(), type: "text", content: "Love You", x: 120, y: 200, fontSize: 64, rotation: 0, color: "#ffffff", face: "front", fontFamily: "Dancing Script" },
                { id: id(), type: "emoji", content: "🌅", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "💖", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "💌", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" }
            ];
            break;
        case "thank-you-floral":
        case "thankyou":
            template.initialBackgroundColor = "#fff1f2"; // rose-50
            template.initialElements = [
                { id: id(), type: "text", content: "Thank You", x: 120, y: 200, fontSize: 56, rotation: 0, color: "#e11d48", face: "front", fontFamily: "Great Vibes" }, // rose-600
                { id: id(), type: "emoji", content: "🌸", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🌿", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🎀", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "party-midnight":
        case "party":
            template.initialBackgroundColor = "#1e1b4b"; // indigo-950
            template.initialElements = [
                { id: id(), type: "text", content: "Let's Party", x: 120, y: 200, fontSize: 48, rotation: 0, color: "#22d3ee", face: "front", fontFamily: "Inter" }, // cyan-400
                { id: id(), type: "emoji", content: "🪩", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🍸", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🥳", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "abstract-joy":
        case "justbecause":
            template.initialBackgroundColor = "#fde047"; // yellow-300
            template.initialElements = [
                { id: id(), type: "text", content: "Smile!", x: 150, y: 200, fontSize: 64, rotation: -5, color: "#000000", face: "front", fontFamily: "Inter" },
                { id: id(), type: "emoji", content: "😊", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🎨", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🌈", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "nature-forest":
        case "nature":
            template.initialBackgroundColor = "#064e3b"; // emerald-900
            template.initialElements = [
                { id: id(), type: "text", content: "Thinking of you", x: 80, y: 200, fontSize: 40, rotation: 0, color: "#d1fae5", face: "front", fontFamily: "Playfair Display" }, // emerald-100
                { id: id(), type: "emoji", content: "🌲", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🦌", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🍃", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "holiday-winter":
        case "holiday":
            template.initialBackgroundColor = "#ecfeff"; // cyan-50
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Holidays", x: 80, y: 200, fontSize: 48, rotation: 0, color: "#0e7490", face: "front", fontFamily: "Dancing Script" }, // cyan-700
                { id: id(), type: "emoji", content: "❄️", x: 300, y: 50, fontSize: 80, rotation: -10, face: "front" },
                { id: id(), type: "emoji", content: "⛄", x: 80, y: 450, fontSize: 100, rotation: 20, face: "front" },
                { id: id(), type: "emoji", content: "🎄", x: 120, y: 300, fontSize: 60, rotation: 20, face: "front" },
            ];
            break;
        case "adventure-peak":
        case "adventure":
            template.initialBackgroundColor = "#1e293b"; // slate-800
            template.initialElements = [
                { id: id(), type: "text", content: "Next Adventure", x: 60, y: 200, fontSize: 40, rotation: 0, color: "#e2e8f0", face: "front", fontFamily: "Impact" }, // slate-200
                { id: id(), type: "emoji", content: "⛰️", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🏕️", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🦅", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "graduation-classic":
        case "graduation":
            template.initialBackgroundColor = "#172554"; // blue-950
            template.initialElements = [
                { id: id(), type: "text", content: "Class of 2024", x: 100, y: 200, fontSize: 40, rotation: 0, color: "#eab308", face: "front", fontFamily: "Playfair Display" }, // yellow-500
                { id: id(), type: "emoji", content: "🎓", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "📜", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🌟", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "baby-shower-clouds":
        case "babyshower":
            template.initialBackgroundColor = "#e0f2fe"; // sky-100
            template.initialElements = [
                { id: id(), type: "text", content: "Oh Baby!", x: 150, y: 200, fontSize: 48, rotation: 0, color: "#38bdf8", face: "front", fontFamily: "Inter" }, // sky-400
                { id: id(), type: "emoji", content: "☁️", x: 300, y: 50, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "emoji", content: "🍼", x: 80, y: 450, fontSize: 100, rotation: 12, face: "front" },
                { id: id(), type: "emoji", content: "🧸", x: 120, y: 300, fontSize: 60, rotation: -12, face: "front" },
            ];
            break;
        case "envelope":
            template.initialCardMode = "envelope";
            template.initialBackgroundColor = "#f5f5f5"; // warm gray
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Birthday!", x: 100, y: 150, fontSize: 32, rotation: 0, color: "#000000", face: "inside-right", fontFamily: "Inter" },
                { id: id(), type: "emoji", content: "🎉", x: 200, y: 50, fontSize: 60, rotation: 0, face: "inside-right" },
            ];
            break;
        case "postcard":
            template.initialCardMode = "postcard";
            template.initialBackgroundColor = "#ffffff";
            template.initialElements = [
                { id: id(), type: "text", content: "Greetings from...", x: 50, y: 50, fontSize: 48, rotation: 0, color: "#000000", face: "front", fontFamily: "Impact" },
                { id: id(), type: "text", content: "Wish you were here!", x: 250, y: 200, fontSize: 32, rotation: -5, color: "#ef4444", face: "back", fontFamily: "Caveat" },
            ];
            break;
    }
    return template;
};

export default function CreateCardPage() {
    const params = useParams();
    const type = params?.type as string;
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const { initialElements, initialBackgroundColor, initialCardMode } = React.useMemo(() => getTemplate(type), [type]);

    return (
        <EditorProvider
            initialElements={initialElements}
            initialBackgroundColor={initialBackgroundColor}
            initialCardMode={initialCardMode}
        >
            <SwipeNavigationWrapper onPreview={() => setIsPreviewOpen(true)} />
            <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
            <OnboardingTour />
        </EditorProvider>
    );
}

function SwipeNavigationWrapper({ onPreview }: { onPreview: () => void }) {
    const {
        activeWorkspaceIndex,
        workspaceProjects,
        switchToWorkspaceProject
    } = useEditor();

    const [isMobile, setIsMobile] = useState(false);
    const prevIndexRef = React.useRef(activeWorkspaceIndex);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        prevIndexRef.current = activeWorkspaceIndex;
    }, [activeWorkspaceIndex]);

    const handleSwipe = (direction: number) => {
        const nextIndex = activeWorkspaceIndex + direction;
        if (nextIndex >= 0 && nextIndex < workspaceProjects.length) {
            switchToWorkspaceProject(nextIndex);
        }
    };

    const delta = activeWorkspaceIndex - prevIndexRef.current;
    const initialX = delta >= 0 ? 300 : -300;
    const exitX = delta >= 0 ? -300 : 300;

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-black">
            <Header onPreview={onPreview} />
            <motion.div
                className="flex flex-1 overflow-hidden relative flex-col-reverse md:flex-row"
                drag={isMobile ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e: any, { offset }: PanInfo) => {
                    if (!isMobile) return;

                    const swipe = offset.x; // Positive is right swipe (previous), Negative is left (next)
                    if (Math.abs(swipe) > 50) {
                        handleSwipe(swipe > 0 ? -1 : 1);
                    }
                }}
            >
                <Toolbar />
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeWorkspaceIndex}
                            initial={{ x: initialX, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: exitX, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0"
                        >
                            <Canvas />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
