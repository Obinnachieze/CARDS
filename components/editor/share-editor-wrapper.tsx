"use client";

import React, { useState } from "react";
import { EditorProvider } from "@/components/editor/editor-context";
import { Canvas } from "@/components/editor/canvas";
import { Toolbar } from "@/components/editor/toolbar";
import { Header } from "@/components/editor/header";
import { PreviewModal } from "@/components/editor/preview-modal";
import { OnboardingTour } from "@/components/editor/onboarding-tour";
import { CardPage, CardMode } from "@/components/editor/types";

interface ShareEditorWrapperProps {
    initialCards: CardPage[];
    initialCardMode: CardMode;
    initialProjectId: string | null; // Null if view-only (fork), ID if owner
}

export function ShareEditorWrapper({ initialCards, initialCardMode, initialProjectId }: ShareEditorWrapperProps) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Use the first card's background color as the initial background
    const initialBackgroundColor = initialCards.length > 0 ? initialCards[0].backgroundColor : "#ffffff";

    return (
        <EditorProvider
            initialCards={initialCards}
            initialBackgroundColor={initialBackgroundColor}
            initialCardMode={initialCardMode}
            initialProjectId={initialProjectId}
        >
            <div className="flex flex-col h-screen bg-gray-100 text-black">
                <Header onPreview={() => setIsPreviewOpen(true)} />
                <div className="flex flex-1 overflow-hidden relative flex-col-reverse md:flex-row">
                    <Toolbar />
                    <Canvas />
                </div>
                <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
                <OnboardingTour />
            </div>
        </EditorProvider>
    );
}
