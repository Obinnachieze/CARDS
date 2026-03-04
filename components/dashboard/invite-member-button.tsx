"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberButtonProps {
    orgId: string;
}

export function InviteMemberButton({ orgId }: InviteMemberButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerateInvite = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/org/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orgId,
                    maxUses: null,
                    expiresInDays: 7,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate invite link");
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(data.url);

            setIsCopied(true);
            toast.success("Invite link generated and copied to clipboard!");

            // Reset copy icon after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);

        } catch (error: any) {
            toast.error(error.message || "Failed to generate invite link");
            console.error("Invite generation error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="secondary"
            className="w-full"
            onClick={handleGenerateInvite}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isCopied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : (
                <Copy className="w-4 h-4 mr-2" />
            )}
            {isCopied ? "Copied!" : "Generate Invite Link"}
        </Button>
    );
}
