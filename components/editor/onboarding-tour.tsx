"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Check } from "lucide-react";

interface Step {
    target: string; // ID of the element to highlight (not used in this simple center overlay version, but good for future)
    title: string;
    description: string;
    image?: string;
}

const steps: Step[] = [
    {
        target: "toolbar",
        title: "Welcome to the Studio!",
        description: "This is where your creativity flows. Choose templates, add text, or draw freely on your card.",
    },
    {
        target: "canvas",
        title: "Your Canvas",
        description: "Everything happens here. Click elements to edit them, drag to move, and use the corners to resize.",
    },
    {
        target: "layers",
        title: "Multi-Page Cards",
        description: "Switch between the Front, Inside, and Back of your card using the navigation at the bottom.",
    },
    {
        target: "download",
        title: "Export & Share",
        description: "When you're ready, download your card as an image or save your project to come back later.",
    }
];

export const OnboardingTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("has-seen-tour");
        if (!hasSeenTour) {
            // Small delay to let the UI load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-purple-100 relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-50" />

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600 font-bold text-xl">
                                {currentStep + 1}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {step.title}
                            </h3>

                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {step.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-6 bg-purple-600" : "w-1.5 bg-gray-200"}`}
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={handleNext}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
                                >
                                    {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                                    {currentStep === steps.length - 1 ? <Check size={16} className="ml-2" /> : <ChevronRight size={16} className="ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
