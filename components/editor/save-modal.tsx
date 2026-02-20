"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (title: string, creatorName: string) => void;
    defaultTitle?: string;
    isSaving?: boolean;
}

export const SaveModal = ({
    open,
    onClose,
    onSave,
    defaultTitle = "",
    isSaving = false,
}: SaveModalProps) => {
    const [title, setTitle] = useState(defaultTitle);
    const [creatorName, setCreatorName] = useState("");
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            setTitle(defaultTitle);
            setTimeout(() => titleInputRef.current?.focus(), 150);
        }
    }, [open, defaultTitle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave(title.trim(), creatorName.trim());
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        className="fixed inset-0 z-200 bg-black/40 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-201 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {/* Header gradient */}
                            <div className="bg-linear-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-5 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                </div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                                            <Sparkles size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Save Your Card</h2>
                                            <p className="text-xs text-white/70">Give your creation a name</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="save-card-title"
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        Card Title <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        ref={titleInputRef}
                                        id="save-card-title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="My Amazing Card"
                                        className="h-11 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all text-sm"
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="save-creator-name"
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        Creator Name
                                    </Label>
                                    <Input
                                        id="save-creator-name"
                                        value={creatorName}
                                        onChange={(e) => setCreatorName(e.target.value)}
                                        placeholder="Your name (optional)"
                                        className="h-11 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all text-sm"
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!title.trim() || isSaving}
                                        className="flex-1 h-11 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {isSaving ? "Saving..." : "Save Card"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
