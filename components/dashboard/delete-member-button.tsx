"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteMember } from "@/app/actions/members";

interface DeleteMemberButtonProps {
    memberId: string;
    memberName: string;
}

export function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        const confirmed = window.confirm(`Are you sure you want to permanently remove ${memberName}?`);

        if (!confirmed) return;

        startTransition(async () => {
            const result = await deleteMember(memberId);

            if (result.error) {
                window.alert(result.error);
            } else {
                window.alert(`${memberName} has been permanently removed.`);
            }
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Remove member"
        >
            <Trash2 className={`w-4 h-4 ${isPending ? "opacity-50" : ""}`} />
        </Button>
    );
}
