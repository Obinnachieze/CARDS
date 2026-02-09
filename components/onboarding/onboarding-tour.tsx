"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
    target: string; // ID of the element to highlight
    title: string;
    description: string;
    position: "top" | "bottom" | "left" | "right" | "center";
}

const steps: TourStep[] = [
    {
        target: "center", // Special case for center modal
        title: "Welcome to Card Creator!",
        description: "Let's take a quick tour to help you make the perfect card.",
        position: "center"
    },
    {
        target: "sidebar-templates", // We need to add these IDs to the UI
        title: "Choose a Template",
        description: "Start with a professionally designed template or create your own from scratch.",
        position: "right"
    },
    {
        target: "sidebar-tools",
        title: "Creative Tools",
        description: "Add text, stickers, images, and drawings to personalize your card.",
        position: "right"
    },
    {
        target: "card-canvas-container",
        title: "Your Canvas",
        description: "This is your card. You can interact with it, fold it, and decorate every face.",
        position: "left" // Relative to screen center/right? The sidebar is left, so this might be effectively 'right' of sidebar
    },
    {
        target: "toolbar-header",
        title: "Project Settings",
        description: "Rename your project, undo/redo changes, and save your work.",
        position: "bottom"
    },
    {
        target: "center",
        title: "Ready to Start?",
        description: "Have fun creating! You can always access this tour again from the Help menu.",
        position: "center"
    }
];

export function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("has-seen-onboarding");
        if (!hasSeenTour) {
            // slight delay to allow UI to render
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("has-seen-onboarding", "true");
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    // Calculate Highlight Position (Simple approach: we might trigger popovers instead of exact coord calculations to avoid complexity)
    // For a robust implementation, we'd use getBoundingClientRect.
    // Let's implement a simple overlay with a spotlight effect or just a centered modal for simplicity if 'target' is not found.

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] pointer-events-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Step Content */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <HighlightTarget targetId={step.target} step={step} onNext={handleNext} onPrev={handlePrev} onClose={handleClose} stepIndex={currentStep} totalSteps={steps.length} />
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

function HighlightTarget({ targetId, step, onNext, onPrev, onClose, stepIndex, totalSteps }: any) {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (targetId === "center") {
            setRect(null);
            return;
        }

        const element = document.getElementById(targetId);
        if (element) {
            setRect(element.getBoundingClientRect());
        } else {
            setRect(null); // Fallback to center if element not found
        }
    }, [targetId]);

    // Derived position styles
    const getPopoverStyle = () => {
        if (!rect) return {}; // Center

        const gap = 16;
        const style: React.CSSProperties = { position: "absolute" };

        switch (step.position) {
            case "right":
                style.left = rect.right + gap;
                style.top = rect.top + (rect.height / 2) - 100; // vert center approx
                break;
            case "left":
                style.right = window.innerWidth - rect.left + gap;
                style.top = rect.top;
                break;
            case "bottom":
                style.top = rect.bottom + gap;
                style.left = rect.left;
                break;
            case "top":
                style.bottom = window.innerHeight - rect.top + gap;
                style.left = rect.left;
                break;
            // Default to center relative to rect if undefined
        }
        return style;
    };

    return (
        <>
            {/* Spotlight Hole if rect exists */}
            {rect && (
                <div
                    className="absolute transition-all duration-300 ease-in-out border-[1000px] border-black/50 rounded-lg pointer-events-none"
                    style={{
                        top: rect.top - 1004, // 1000px border + 4px padding
                        left: rect.left - 1004,
                        width: rect.width + 8,
                        height: rect.height + 8,
                    }}
                />
            )}

            {/* Popover Card */}
            <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "bg-white rounded-xl shadow-2xl p-6 w-[350px] pointer-events-auto",
                    !rect ? "relative" : "absolute"
                )}
                style={!rect ? {} : getPopoverStyle()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>

                <div className="mb-4">
                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                        Step {stepIndex + 1} of {totalSteps}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-colors",
                                    i === stepIndex ? "bg-purple-600" : "bg-gray-200"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {stepIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={onPrev}>
                                Back
                            </Button>
                        )}
                        <Button size="sm" onClick={onNext} className="gap-1 bg-purple-600 hover:bg-purple-700">
                            {stepIndex === totalSteps - 1 ? "Get Started" : "Next"}
                            {stepIndex !== totalSteps - 1 && <ChevronRight size={14} />}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
