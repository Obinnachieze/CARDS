"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    target: string;
    title: string;
    description: string;
    preferredPosition: "top" | "bottom" | "left" | "right";
}

const steps: Step[] = [
    {
        target: "editor-toolbar",
        title: "Your Creative Toolbox",
        description: "Add text, stickers, upload images, or draw freely. Everything you need to design is right here.",
        preferredPosition: "right",
    },
    {
        target: "editor-header-actions",
        title: "Preview & Share",
        description: "Preview your card, share it with a link, or schedule it to someone special.",
        preferredPosition: "bottom",
    },
    {
        target: "face-toggle",
        title: "Flip Your Card",
        description: "Switch between the front, inside, and back of your card to design every surface.",
        preferredPosition: "top",
    },
];

const TOOLTIP_WIDTH = 300;
const TOOLTIP_HEIGHT_ESTIMATE = 200;
const VIEWPORT_PADDING = 16;

export const OnboardingTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("has-seen-tour");
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const updateTargetRect = useCallback(() => {
        if (!isOpen) return;
        const step = steps[currentStep];
        const element = document.getElementById(step.target);
        if (element) {
            // Scroll element into view if it's off-screen
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.bottom > viewportHeight || rect.top < 0) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            setTargetRect(element.getBoundingClientRect());
        } else {
            setTargetRect(null);
        }
        rafRef.current = requestAnimationFrame(updateTargetRect);
    }, [isOpen, currentStep]);

    useLayoutEffect(() => {
        if (isOpen) {
            // Small delay to let the DOM settle after step change
            const timer = setTimeout(() => {
                updateTargetRect();
            }, 100);
            window.addEventListener("resize", updateTargetRect);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("resize", updateTargetRect);
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
            };
        }
    }, [isOpen, currentStep, updateTargetRect]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("has-seen-tour", "true");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    // Smart tooltip positioning that clamps to viewport
    const getTooltipStyle = (): React.CSSProperties => {
        if (!targetRect) {
            return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const padding = 16;
        const { top, left, width, height, bottom, right } = targetRect;

        let tooltipTop = 0;
        let tooltipLeft = 0;
        let chosenPosition = step.preferredPosition;

        // Try preferred position first, fall back if it would clip
        switch (chosenPosition) {
            case "right":
                tooltipTop = top + height / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2;
                tooltipLeft = right + padding;
                // Fall back to bottom if right would overflow
                if (tooltipLeft + TOOLTIP_WIDTH > vw - VIEWPORT_PADDING) {
                    chosenPosition = "bottom";
                    tooltipTop = bottom + padding;
                    tooltipLeft = left + width / 2 - TOOLTIP_WIDTH / 2;
                }
                break;
            case "left":
                tooltipTop = top + height / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2;
                tooltipLeft = left - padding - TOOLTIP_WIDTH;
                if (tooltipLeft < VIEWPORT_PADDING) {
                    chosenPosition = "bottom";
                    tooltipTop = bottom + padding;
                    tooltipLeft = left + width / 2 - TOOLTIP_WIDTH / 2;
                }
                break;
            case "top":
                tooltipTop = top - padding - TOOLTIP_HEIGHT_ESTIMATE;
                tooltipLeft = left + width / 2 - TOOLTIP_WIDTH / 2;
                // Fall back to bottom if top would go above viewport
                if (tooltipTop < VIEWPORT_PADDING) {
                    chosenPosition = "bottom";
                    tooltipTop = bottom + padding;
                }
                break;
            case "bottom":
                tooltipTop = bottom + padding;
                tooltipLeft = left + width / 2 - TOOLTIP_WIDTH / 2;
                // Fall back to top if bottom would go below viewport
                if (tooltipTop + TOOLTIP_HEIGHT_ESTIMATE > vh - VIEWPORT_PADDING) {
                    chosenPosition = "top";
                    tooltipTop = top - padding - TOOLTIP_HEIGHT_ESTIMATE;
                }
                break;
        }

        // Final clamping to keep tooltip fully within viewport
        tooltipTop = Math.max(VIEWPORT_PADDING, Math.min(tooltipTop, vh - TOOLTIP_HEIGHT_ESTIMATE - VIEWPORT_PADDING));
        tooltipLeft = Math.max(VIEWPORT_PADDING, Math.min(tooltipLeft, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING));

        return {
            top: tooltipTop,
            left: tooltipLeft,
        };
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
                    {/* Spotlight Overlay */}
                    <div className="absolute inset-0 pointer-events-auto" onClick={handleClose}>
                        <svg className="w-full h-full" style={{ position: "absolute", inset: 0 }}>
                            <defs>
                                <mask id="spotlight-mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    {targetRect && (
                                        <motion.rect
                                            initial={false}
                                            animate={{
                                                x: targetRect.left - 8,
                                                y: targetRect.top - 8,
                                                width: targetRect.width + 16,
                                                height: targetRect.height + 16,
                                                rx: 12,
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            fill="black"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect
                                width="100%"
                                height="100%"
                                fill="rgba(0,0,0,0.65)"
                                mask="url(#spotlight-mask)"
                            />
                        </svg>
                    </div>

                    {/* Tooltip Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
                        className="absolute pointer-events-auto"
                        style={{
                            ...getTooltipStyle(),
                            width: TOOLTIP_WIDTH,
                        }}
                    >
                        <div className="bg-[#1a1a1e] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-5 border border-white/10 relative overflow-hidden text-white">
                            {/* Decorative Glow */}
                            <div className="absolute -right-8 -top-8 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles size={10} />
                                        {currentStep + 1} / {steps.length}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClose();
                                        }}
                                        className="text-zinc-500 hover:text-white transition-colors p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <h3 className="text-base font-bold mb-1.5 leading-tight">
                                    {step.title}
                                </h3>

                                <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                                    {step.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        {steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1 rounded-full transition-all duration-300",
                                                    i === currentStep ? "w-5 bg-purple-500" : i < currentStep ? "w-2 bg-purple-500/40" : "w-1.5 bg-white/10"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNext();
                                        }}
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 h-8 text-xs font-semibold shadow-lg shadow-purple-500/20 border-none transition-all active:scale-95"
                                    >
                                        {currentStep === steps.length - 1 ? "Got it!" : "Next"}
                                        {currentStep === steps.length - 1 ? <Check size={12} className="ml-1.5" /> : <ChevronRight size={12} className="ml-1" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
