"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Share2, Globe, AlertCircle, Save, Loader2, CalendarIcon, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor } from "./editor-context";
import { useParams } from "next/navigation";
import { LoginPromptModal } from "./login-prompt-modal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function ShareDialog() {
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { currentProjectId, saveCurrentProject, saveProjectAs, user } = useEditor();
    const params = useParams();
    const type = params?.type || "Untitled Design";

    // Schedule state
    const [recipientEmail, setRecipientEmail] = useState("");
    const [senderName, setSenderName] = useState("");
    const [date, setDate] = useState<Date>();
    const [isScheduling, setIsScheduling] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
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

        if (!user) {
            setIsScheduling(false);
            setShowLoginPrompt(true);
            return;
        }

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

    const handleDownloadQRCode = () => {
        const svg = document.getElementById("share-qr-code");
        if (!svg) return;

        // Serialize the SVG to a string
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        // 1024x1024 for high quality
        canvas.width = 1024;
        canvas.height = 1024;

        img.onload = () => {
            if (ctx) {
                // Background
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get PNG data URL
                const pngFile = canvas.toDataURL("image/png");

                // Trigger download
                const downloadLink = document.createElement("a");
                downloadLink.download = `vibepost-qr-${currentProjectId || 'card'}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
            }
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-gray-800 text-white hover:bg-gray-700 sm:bg-white sm:text-black sm:hover:bg-gray-200 font-semibold h-9 w-9 sm:w-auto px-0 sm:px-4 gap-2 rounded-full sm:rounded-md transition-all shadow-xs sm:shadow-sm">
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0c0c0e] text-zinc-100 border-white/10 shadow-2xl">
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
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 border border-white/5">
                        <TabsTrigger value="link" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Share Link</TabsTrigger>
                        <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Schedule Delivery</TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4 outline-none">
                        {!isSaved ? (
                            <div className="space-y-3 mt-4">
                                <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                    <AlertCircle size={18} className="text-amber-400 shrink-0" />
                                    <p className="text-sm text-amber-200/80">
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
                                            className="bg-zinc-950 border-white/10 text-white focus-visible:ring-purple-500"
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

                                {/* QR Code Display */}
                                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center space-y-4">
                                    <div className="text-center">
                                        <h4 className="text-sm font-semibold text-zinc-100">Scan to View</h4>
                                        <p className="text-xs text-zinc-500 mt-1">Perfect for printing or sharing on screens</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-white/10 shadow-sm flex items-center justify-center">
                                        <QRCodeSVG
                                            id="share-qr-code"
                                            value={shareUrl}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            fgColor="#000000"
                                            bgColor="#ffffff"
                                            className="rounded-md"
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full max-w-[200px] border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 gap-2"
                                        onClick={handleDownloadQRCode}
                                    >
                                        <Download size={16} />
                                        Download QR Code
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
                                <Label htmlFor="recipient" className="text-zinc-300">Recipient Email</Label>
                                <Input
                                    id="recipient"
                                    type="email"
                                    placeholder="friend@example.com"
                                    className="bg-zinc-950 border-white/10 text-white focus-visible:ring-purple-500"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sender" className="text-zinc-300">Your Name (Optional)</Label>
                                <Input
                                    id="sender"
                                    placeholder="John Doe"
                                    className="bg-zinc-950 border-white/10 text-white focus-visible:ring-purple-500"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="text-zinc-300">Delivery Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-zinc-950 border-white/10 text-zinc-300 hover:bg-zinc-900",
                                                !date && "text-zinc-600"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10" align="start">
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

            <LoginPromptModal
                open={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
            />
        </Dialog>
    );
}
