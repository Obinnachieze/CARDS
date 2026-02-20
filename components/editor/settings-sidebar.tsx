"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    X, Save, LayoutTemplate, FolderOpen,
    Trash2, ChevronLeft, Check, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { templates } from "./templates";

interface SettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveClick: () => void;
}

export const SettingsSidebar = ({ isOpen, onClose, onSaveClick }: SettingsSidebarProps) => {
    const {
        cards,
        setCards,
        activeCardId,
        projects,
        currentProjectId,
        loadProject,
        deleteProject,
        saveProjectAs,
        saveCurrentProject,
        cardMode,
        setCardMode,
        setActiveTool,
        projectName,
        setProjectName,
        user,
        createNewProject,
        addCard
    } = useEditor();

    const loadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template && activeCardId) {
            const templateCard = template.cards[0];

            setCards(prev => prev.map(card => {
                if (card.id === activeCardId) {
                    return {
                        ...card,
                        elements: templateCard.elements.map(el => ({ ...el })),
                        backgroundColor: templateCard.backgroundColor,
                        celebration: templateCard.celebration
                    };
                }
                return card;
            }));
            onClose(); // Close sidebar after loading template
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-60 bg-black/40 backdrop-blur-md"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-70 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X size={20} />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-8 pb-20">
                                {/* Save Project Section */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Save & Export</h3>
                                    <div className="bg-purple-50 p-4 rounded-2xl space-y-3">
                                        {currentProjectId ? (
                                            <Button
                                                disabled
                                                className="w-full bg-green-500 text-white gap-2 h-11 rounded-xl shadow-lg shadow-green-100 opacity-100 cursor-default"
                                            >
                                                <Check size={18} />
                                                Saved
                                            </Button>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sidebar-project-name" className="text-purple-900 font-medium">Project Name</Label>
                                                    <Input
                                                        id="sidebar-project-name"
                                                        placeholder="Enter project name..."
                                                        value={projectName}
                                                        onChange={(e) => setProjectName(e.target.value)}
                                                        className="bg-white border-purple-200 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 h-11 rounded-xl shadow-lg shadow-purple-200"
                                                    onClick={() => saveProjectAs(projectName || "Untitled Project")}
                                                >
                                                    <Save size={18} />
                                                    Save Project
                                                </Button>
                                            </>
                                        )}
                                        {currentProjectId && (
                                            <Button
                                                variant="outline"
                                                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 gap-2 h-11 rounded-xl"
                                                onClick={() => {
                                                    addCard();
                                                    onClose();
                                                }}
                                            >
                                                <Plus size={18} />
                                                Create New Design
                                            </Button>
                                        )}
                                    </div>
                                </section>

                                {/* My Projects Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Projects</h3>
                                        <span className="text-xs text-gray-400">{projects.length} saved</span>
                                    </div>

                                    {projects.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <FolderOpen className="mx-auto text-gray-300 mb-2" size={32} />
                                            <p className="text-sm text-gray-400">No saved projects yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {projects.map((project) => (
                                                <div
                                                    key={project.id}
                                                    className="group flex items-center justify-between p-4 bg-white hover:bg-purple-50 border border-gray-100 rounded-2xl transition-all cursor-pointer hover:border-purple-200"
                                                    onClick={() => {
                                                        loadProject(project.id);
                                                        onClose();
                                                    }}
                                                >
                                                    <div className="flex flex-col flex-1 truncate">
                                                        <span className="font-semibold text-sm text-gray-800 truncate">{project.name}</span>
                                                        <span className="text-[10px] text-gray-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 ml-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteProject(project.id);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Templates Section */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Templates</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {templates.map(template => (
                                            <button
                                                key={template.id}
                                                className="group relative aspect-3/4 bg-gray-100 rounded-2xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all text-left shadow-sm"
                                                onClick={() => loadTemplate(template.id)}
                                            >
                                                <div
                                                    className="absolute inset-0 w-full h-full"
                                                    style={{ background: template.thumbnail }}
                                                />
                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                                                    <span className="text-white text-xs font-bold truncate block">
                                                        {template.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </ScrollArea>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
