"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Globe, AlertCircle, Save, Loader2, CalendarIcon, Send } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor } from "./editor-context";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function ShareDialog() {
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { currentProjectId, saveCurrentProject, saveProjectAs } = useEditor();
    const params = useParams();
    const type = params?.type || "Untitled Design";

    // Schedule state
    const [recipientEmail, setRecipientEmail] = useState("");
    const [senderName, setSenderName] = useState("");
    const [date, setDate] = useState<Date>();
    const [isScheduling, setIsScheduling] = useState(false);

    const isSaved = !!currentProjectId;

    // Only generate a real-looking URL when the project has been saved
    const shareUrl = isSaved && typeof window !== "undefined"
        ? `${window.location.origin}/share/${currentProjectId}`
        : "";

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const handleShare = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsSaving(true);
        try {
            let idToShare = currentProjectId;
            if (currentProjectId) {
                await saveCurrentProject();
            }
            if (idToShare && typeof window !== 'undefined') {
                const newShareUrl = `${window.location.origin}/share/${idToShare}`;
                await navigator.clipboard.writeText(newShareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (e) {
            console.error("Share failed:", e);
            setError("Failed to share project or copy to clipboard.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndShare = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsSaving(true);
        try {
            const projectName = typeof type === "string"
                ? `${type.charAt(0).toUpperCase() + type.slice(1)} Card`
                : "Untitled Card";
            const newId = await saveProjectAs(projectName);
            if (newId && typeof window !== 'undefined') {
                const newShareUrl = `${window.location.origin}/share/${newId}`;
                await navigator.clipboard.writeText(newShareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
            // After saving, the component will re-render with currentProjectId set,
        } catch (e) {
            console.error("Save/Share failed:", e);
            setError("Failed to create project or copy link. Please check if Supabase is configured.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSchedule = async () => {
        if (!recipientEmail || !date) {
            setError("Please provide a recipient email and select a date.");
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsScheduling(true);

        try {
            // Ensure project is saved
            let projectId = currentProjectId;
            if (!projectId) {
                const projectName = typeof type === "string" ? `${type.charAt(0).toUpperCase() + type.slice(1)} Card` : "Untitled Card";
                projectId = await saveProjectAs(projectName);
            } else {
                await saveCurrentProject();
            }

            if (!projectId) throw new Error("Could not save project before scheduling.");

            // API Call
            const res = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    recipientEmail,
                    senderName,
                    sendAt: date.toISOString()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to schedule.");
            }

            setSuccessMessage(`Card scheduled to be sent on ${format(date, "PPP")}!`);
            // Reset form
            setRecipientEmail("");
            setSenderName("");
            setDate(undefined);

        } catch (error: any) {
            console.error("Schedule failed:", error);
            setError(error.message || "Failed to schedule delivery.");
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-gray-800 text-white hover:bg-gray-700 sm:bg-white sm:text-black sm:hover:bg-gray-200 font-semibold h-9 w-9 sm:w-auto px-0 sm:px-4 gap-2 rounded-full sm:rounded-md transition-all shadow-xs sm:shadow-sm">
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white text-black border-gray-200">
                <DialogHeader>
                    <DialogTitle>Share design</DialogTitle>
                    <DialogDescription>
                        Send your card instantly or schedule it for later.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm mb-4">
                        {successMessage}
                    </div>
                )}

                <Tabs defaultValue="link" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
                        <TabsTrigger value="link">Share Link</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule Delivery</TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4 outline-none">
                        {!isSaved ? (
                            <div className="space-y-3 mt-4">
                                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                                    <p className="text-sm text-amber-800">
                                        Your project needs to be saved before you can share it.
                                    </p>
                                </div>
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                                    onClick={handleSaveAndShare}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isSaving ? "Saving..." : "Save & Generate Link"}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-4">
                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="link" className="sr-only">
                                            Link
                                        </Label>
                                        <Input
                                            id="link"
                                            value={shareUrl}
                                            readOnly
                                            className="bg-gray-50 border-gray-300 text-gray-900"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="px-3 bg-purple-600 hover:bg-purple-700 text-white min-w-[80px]"
                                        onClick={handleShare}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <>
                                                <span className="sr-only">Copy</span>
                                                {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Globe size={14} />
                                        <span>Anyone with link can view</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4 outline-none mt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">Recipient Email</Label>
                                <Input
                                    id="recipient"
                                    type="email"
                                    placeholder="friend@example.com"
                                    className="border-gray-300"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sender">Your Name (Optional)</Label>
                                <Input
                                    id="sender"
                                    placeholder="John Doe"
                                    className="border-gray-300"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label>Delivery Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal border-gray-300",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            disabled={(d: Date) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2"
                                onClick={handleSchedule}
                                disabled={isScheduling || !recipientEmail || !date}
                            >
                                {isScheduling ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Schedule Delivery
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
