"use client";

import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteMember } from "@/app/actions/members";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

interface DeleteMemberButtonProps {
    memberId: string;
    memberName: string;
}

export function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteMember(memberId);

            if (result.error) {
                window.alert(result.error);
            } else {
                setIsOpen(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    title="Remove member"
                >
                    <Trash2 className={`w-4 h-4 ${isPending ? "opacity-50" : ""}`} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#09090b] border-white/10 text-white">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto sm:mx-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold">Delete Member</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Are you sure you want to permanently remove <span className="text-white font-medium">{memberName}</span>? This action cannot be undone.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 border border-white/10">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium min-w-[100px]"
                    >
                        {isPending ? "Deleting..." : "Delete Member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
