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
        case "birthday":
            template.initialBackgroundColor = "#fef9c3"; // yellow-50
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Birthday!", x: 150, y: 100, fontSize: 48, rotation: 0, color: "#eab308", face: "front", fontFamily: "Pacifico" },
                { id: id(), type: "emoji", content: "🎈", x: 50, y: 50, fontSize: 64, rotation: -10, face: "front" },
                { id: id(), type: "emoji", content: "🎂", x: 400, y: 600, fontSize: 80, rotation: 10, face: "front" },
                { id: id(), type: "text", content: "Make a wish!", x: 200, y: 400, fontSize: 32, rotation: 0, color: "#000000", face: "inside-right", fontFamily: "Inter" }
            ];
            break;
        case "wedding":
            template.initialBackgroundColor = "#fdf2f8"; // pink-50
            template.initialElements = [
                { id: id(), type: "text", content: "Save the Date", x: 180, y: 100, fontSize: 48, rotation: 0, color: "#db2777", face: "front", fontFamily: "Playfair Display" },
                { id: id(), type: "emoji", content: "💍", x: 250, y: 300, fontSize: 80, rotation: 0, face: "front" },
                { id: id(), type: "text", content: "Together Forever", x: 180, y: 200, fontSize: 32, rotation: 0, color: "#831843", face: "inside-right", fontFamily: "Dancing Script" }
            ];
            break;
        case "thankyou":
            template.initialBackgroundColor = "#ecfdf5"; // emerald-50
            template.initialElements = [
                { id: id(), type: "text", content: "Thank You", x: 150, y: 150, fontSize: 56, rotation: 0, color: "#059669", face: "front", fontFamily: "Great Vibes" },
                { id: id(), type: "emoji", content: "🙏", x: 250, y: 350, fontSize: 80, rotation: 0, face: "front" },
            ];
            break;
        case "anniversary":
            template.initialBackgroundColor = "#faf5ff"; // purple-50
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Anniversary", x: 100, y: 100, fontSize: 48, rotation: 0, color: "#7c3aed", face: "front", fontFamily: "Playfair Display" },
                { id: id(), type: "emoji", content: "💑", x: 250, y: 350, fontSize: 80, rotation: 0, face: "front" },
            ];
            break;
        case "justbecause":
            template.initialBackgroundColor = "#fff7ed"; // orange-50
            template.initialElements = [
                { id: id(), type: "text", content: "Thinking of You", x: 120, y: 100, fontSize: 48, rotation: 0, color: "#ea580c", face: "front", fontFamily: "Caveat" },
                { id: id(), type: "emoji", content: "👋", x: 250, y: 350, fontSize: 80, rotation: 0, face: "front" },
            ];
            break;
        case "holiday":
            template.initialBackgroundColor = "#fef2f2"; // red-50
            template.initialElements = [
                { id: id(), type: "text", content: "Happy Holidays", x: 150, y: 100, fontSize: 48, rotation: 0, color: "#dc2626", face: "front", fontFamily: "Mountains of Christmas" },
                { id: id(), type: "emoji", content: "🎄", x: 100, y: 500, fontSize: 80, rotation: -10, face: "front" },
                { id: id(), type: "emoji", content: "❄️", x: 400, y: 100, fontSize: 60, rotation: 20, face: "front" },
            ];
            break;
        case "envelope":
            template.initialCardMode = "envelope";
            template.initialBackgroundColor = "#f5f5f5"; // warm gray
            template.initialElements = [
                { id: id(), type: "text", content: "To: John Doe", x: 200, y: 300, fontSize: 24, rotation: 0, color: "#000000", face: "front", fontFamily: "Courier New" },
                { id: id(), type: "text", content: "\n1234 Maple Ave\nSpringfield, IL 62704", x: 200, y: 340, fontSize: 18, rotation: 0, color: "#000000", face: "front", fontFamily: "Courier New" },
                { id: id(), type: "emoji", content: "🛑", x: 400, y: 50, fontSize: 40, rotation: 0, face: "front" }, // Stamp placeholder
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
