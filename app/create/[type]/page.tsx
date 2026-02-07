"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EditorProvider } from "@/components/editor/editor-context";
import { Canvas } from "@/components/editor/canvas";
import { Toolbar } from "@/components/editor/toolbar"; // This is now the Sidebar
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EditorElement } from "@/components/editor/types";

const getTemplate = (type: string) => {
    const template = {
        initialBackgroundColor: "#ffffff",
        initialElements: [] as EditorElement[]
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
    }
    return template;
};

export default function CreateCardPage() {
    const params = useParams();
    const type = params?.type as string;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const { initialElements, initialBackgroundColor } = React.useMemo(() => getTemplate(type), [type]);

    return (
        <EditorProvider
            initialElements={initialElements}
            initialBackgroundColor={initialBackgroundColor}
        >
            <div className="flex flex-col h-screen bg-gray-100 text-black">
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b z-20 relative">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold capitalize">{type} Card Editor</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Preview</Button>
                        <Button>Save & Send</Button>
                    </div>
                </header>
                <div className="flex flex-1 overflow-hidden relative">
                    <Toolbar />
                    <Canvas />
                </div>
            </div>
        </EditorProvider>
    );
}
