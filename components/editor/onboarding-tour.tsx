"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    target: string;
    title: string;
    description: string;
    position: "top" | "bottom" | "left" | "right" | "center";
}

const steps: Step[] = [
    {
        target: "editor-toolbar",
        title: "The Creative Toolbox",
        description: "Choose templates, add text, stickers, or draw freely. Everything you need is right here.",
        position: "right",
    },
    {
        target: "card-canvas-container",
        title: "Your Masterpiece",
        description: "This is your canvas. Click any element to edit, or drag to reposition it perfectly.",
        position: "bottom",
    },
    {
        target: "face-toggle",
        title: "Multi-Page Magic",
        description: "Click here to flip your card and design the inside or back surfaces.",
        position: "top",
    },
    {
        target: "editor-header-actions",
        title: "Ready to Share?",
        description: "Preview your creation or share it with the world. Your progress is saved automatically!",
        position: "bottom",
    }
];

export const OnboardingTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("has-seen-tour");
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const updateTargetRect = () => {
        if (!isOpen) return;
        const step = steps[currentStep];
        const element = document.getElementById(step.target);
        if (element) {
            setTargetRect(element.getBoundingClientRect());
        } else {
            setTargetRect(null);
        }
        requestRef.current = requestAnimationFrame(updateTargetRect);
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateTargetRect();
            window.addEventListener('resize', updateTargetRect);
            return () => {
                window.removeEventListener('resize', updateTargetRect);
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
            };
        }
    }, [isOpen, currentStep]);

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
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    // Tooltip position calculation
    const getTooltipStyle = () => {
        if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

        const padding = 20;
        const { top, left, width, height } = targetRect;

        switch (step.position) {
            case "right":
                return {
                    top: top + height / 2,
                    left: left + width + padding,
                    transform: "translateY(-50%)"
                };
            case "left":
                return {
                    top: top + height / 2,
                    left: left - padding,
                    transform: "translate(-100%, -50%)"
                };
            case "top":
                return {
                    top: top - padding,
                    left: left + width / 2,
                    transform: "translate(-50%, -100%)"
                };
            case "bottom":
                return {
                    top: top + height + padding,
                    left: left + width / 2,
                    transform: "translate(-50%, 0)"
                };
            default:
                return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 overflow-hidden pointer-events-none">
                    {/* Spotlight Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] pointer-events-auto" onClick={handleClose}>
                        <svg className="w-full h-full">
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
                                                rx: 12
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            fill="black"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="currentColor" mask="url(#spotlight-mask)" />
                        </svg>
                    </div>

                    {/* Tooltip Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute pointer-events-auto w-[320px] z-101"
                        style={getTooltipStyle()}
                    >
                        <div className="bg-[#1c1c1f] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 border border-white/10 relative overflow-hidden text-white group">
                            {/* Decorative Glow */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={12} />
                                        Step {currentStep + 1} of {steps.length}
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold mb-2 leading-tight">
                                    {step.title}
                                </h3>

                                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                    {step.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <div className="flex gap-1.5">
                                        {steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1 rounded-full transition-all duration-300",
                                                    i === currentStep ? "w-6 bg-purple-500" : "w-1 bg-white/10"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handleNext}
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 h-9 font-semibold shadow-lg shadow-purple-500/20 border-none transition-all active:scale-95"
                                    >
                                        {currentStep === steps.length - 1 ? "Start Creating" : "Next"}
                                        {currentStep === steps.length - 1 ? <Check size={14} className="ml-2" /> : <ChevronRight size={14} className="ml-2" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Pointer Arrow (Optional, can be added per position) */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
