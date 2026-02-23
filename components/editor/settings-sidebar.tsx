"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    X, Save, LayoutTemplate, FolderOpen,
    Trash2, ChevronLeft, Check, Plus, Trash,
    CreditCard, Mail, Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { MagicWriterDialog } from "./magic-writer-dialog";

interface SettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveClick: () => void;
}

export const SettingsSidebar = ({ isOpen, onClose, onSaveClick }: SettingsSidebarProps) => {
    const [isProjectNameFocused, setIsProjectNameFocused] = useState(false);
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
        addCard,
        clearAllProjects
    } = useEditor();



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
                        className="fixed inset-0 z-200 bg-black/40 backdrop-blur-md"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[350px] max-w-full bg-white z-201 shadow-2xl flex flex-col overflow-x-hidden"
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between p-4 sm:p-6 border-b border-gray-100 min-w-0">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900 hidden sm:block">Settings</h2>
                                <div className="sm:hidden">
                                    <UserAvatar />
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-gray-100/50 hover:bg-gray-200 text-gray-500 hover:text-gray-900">
                                <X size={20} className="stroke-2" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-8 pb-20">
                                {/* Save Project Section */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Save & Export</h3>
                                    <div className="bg-purple-50 p-4 rounded-2xl space-y-3">
                                        <div className="space-y-3">
                                            {currentProjectId && (
                                                <div className="space-y-1 overflow-x-auto min-w-0">
                                                    <Label className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Active Workspace</Label>
                                                    <p className="text-sm font-semibold text-purple-900 whitespace-nowrap min-w-max">
                                                        {projectName || "Untitled Card"}
                                                    </p>
                                                </div>
                                            )}

                                            {!currentProjectId && (
                                                <div className="space-y-2 pt-1">
                                                    <Label htmlFor="sidebar-project-name" className="text-purple-900 font-medium">Card Name</Label>
                                                    <div className="relative group">
                                                        <Input
                                                            id="sidebar-project-name"
                                                            placeholder="Enter card name..."
                                                            value={projectName}
                                                            onChange={(e) => setProjectName(e.target.value)}
                                                            onFocus={() => setIsProjectNameFocused(true)}
                                                            onBlur={() => {
                                                                // Small delay to allow clicking the wand before it disappears
                                                                setTimeout(() => setIsProjectNameFocused(false), 200);
                                                            }}
                                                            className="bg-white border-purple-200 focus:ring-purple-500 h-11 pr-12 text-purple-900 font-medium"
                                                        />
                                                        {isProjectNameFocused && (
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-in fade-in slide-in-from-right-1 duration-200">
                                                                <MagicWriterDialog
                                                                    mode="rewrite"
                                                                    initialText={projectName}
                                                                    onInsert={(text: string) => setProjectName(text)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                className={cn(
                                                    "w-full gap-2 h-11 rounded-xl shadow-lg transition-all",
                                                    currentProjectId
                                                        ? "bg-green-500 hover:bg-green-600 text-white shadow-green-100"
                                                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                                                )}
                                                onClick={() => {
                                                    if (currentProjectId) {
                                                        saveCurrentProject();
                                                    } else {
                                                        saveProjectAs(projectName || "Untitled Card");
                                                    }
                                                }}
                                            >
                                                {currentProjectId ? <Check size={18} /> : <Save size={18} />}
                                                {currentProjectId ? "Saved" : "Save Card"}
                                            </Button>

                                            {currentProjectId && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 gap-2 h-11 rounded-xl"
                                                    onClick={() => {
                                                        createNewProject();
                                                        onClose();
                                                    }}
                                                >
                                                    <Plus size={18} />
                                                    Create New Design
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 min-w-0 overflow-x-hidden">
                                    <div className="flex items-center justify-between gap-2 min-w-0 shrink-0">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">My Projects</h3>
                                            <span className="text-[10px] text-gray-400">{projects.length} saved</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 px-2 rounded-lg shrink-0"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to clear all your saved projects and reset the active workspace? This action cannot be undone.")) {
                                                    clearAllProjects();
                                                }
                                            }}
                                        >
                                            <Trash size={14} />
                                            Clear All
                                        </Button>
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
                                                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                                                        <p className="font-semibold text-purple-900 group-hover:text-purple-700 transition-colors truncate">
                                                            {project.name || "Untitled Card"}
                                                        </p>
                                                        <span className="text-[10px] text-gray-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 ml-2 shrink-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("Are you sure you want to delete this project?")) {
                                                                deleteProject(project.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-4 min-w-0 overflow-x-hidden">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Card Type</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "foldable", name: "Foldable", icon: <LayoutTemplate size={18} /> },
                                            { id: "postcard", name: "Postcard", icon: <CreditCard size={18} /> },
                                            { id: "envelope", name: "Envelope", icon: <Mail size={18} /> },
                                        ].map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setCardMode(mode.id as any)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all gap-1.5",
                                                    cardMode === mode.id
                                                        ? "border-purple-600 bg-purple-50 text-purple-600 shadow-sm"
                                                        : "border-gray-100 bg-white text-gray-400 hover:border-purple-200 hover:text-purple-400"
                                                )}
                                            >
                                                {mode.icon}
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{mode.name}</span>
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
