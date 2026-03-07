"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Sparkles } from "lucide-react";
import { useEditor } from "./editor-context";
import { usePathname } from "next/navigation";

interface LoginPromptModalProps {
    open: boolean;
    onClose: () => void;
}

export function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
    const { cards, cardMode, cardOrientation } = useEditor();
    const pathname = usePathname();

    const handleRedirect = (path: string) => {
        // Preserve the current card state before redirecting
        try {
            const draft = {
                cards,
                cardMode,
                cardOrientation,
                returnTo: pathname,
                savedAt: Date.now(),
            };
            localStorage.setItem("vibepost-unsaved-draft", JSON.stringify(draft));
        } catch (e) {
            console.error("Failed to save draft before login:", e);
        }

        // Redirect with callback to return to current page
        const callbackUrl = encodeURIComponent(pathname || "/create/birthday");
        window.location.href = `${path}?callbackUrl=${callbackUrl}`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm bg-[#0c0c0e] text-zinc-100 border-white/10 shadow-2xl">
                <DialogHeader className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-purple-400" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Sign in to save</DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Your card design is safe! Sign in or create an account to save, share, and schedule your card.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 pt-4">
                    <Button
                        className="w-full bg-white text-black hover:bg-white/90 font-semibold h-11 gap-2 rounded-xl"
                        onClick={() => handleRedirect("/login")}
                    >
                        <LogIn size={16} />
                        Sign In
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold h-11 gap-2 rounded-xl"
                        onClick={() => handleRedirect("/signup")}
                    >
                        <UserPlus size={16} />
                        Create Account
                    </Button>
                </div>

                <p className="text-center text-xs text-zinc-500 pt-2">
                    Don&apos;t worry — your design will be here when you get back.
                </p>
            </DialogContent>
        </Dialog>
    );
}
