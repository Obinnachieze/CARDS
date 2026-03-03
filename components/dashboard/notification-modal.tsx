"use client";

import { useState, useEffect } from "react";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Bell, Calendar, Gift, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type BirthdayAlert = {
    id: string;
    name: string;
    date: Date;
    daysUntil: number;
};

export function NotificationModal() {
    const [open, setOpen] = useState(false);
    const [birthdays, setBirthdays] = useState<BirthdayAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                setLoading(true);
                const supabase = createClient();

                // 1. Get user and organization
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setBirthdays([]);
                    setLoading(false);
                    return;
                }

                const { data: orgMember } = await supabase
                    .from("organization_members")
                    .select("org_id")
                    .eq("user_id", user.id)
                    .single();

                if (!orgMember?.org_id) {
                    setBirthdays([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch all members
                const { data: members } = await supabase
                    .from("members")
                    .select("id, full_name, email, birth_month, birth_day")
                    .eq("org_id", orgMember.org_id);

                if (!members) {
                    setBirthdays([]);
                    setLoading(false);
                    return;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize today to start of day
                const currentYear = today.getFullYear();

                const upcoming: BirthdayAlert[] = [];

                members.forEach(member => {
                    if (member.birth_month && member.birth_day) {
                        let nextBirthday = new Date(currentYear, member.birth_month - 1, member.birth_day);
                        nextBirthday.setHours(0, 0, 0, 0); // Normalize birthday to start of day

                        // If birthday has passed this year, look at next year
                        if (nextBirthday.getTime() < today.getTime()) {
                            nextBirthday = new Date(currentYear + 1, member.birth_month - 1, member.birth_day);
                            nextBirthday.setHours(0, 0, 0, 0); // Normalize birthday to start of day
                        }

                        const daysUntil = differenceInDays(nextBirthday, today);

                        // Show birthdays coming up in the next 7 days (0 to 7 inclusive)
                        if (daysUntil >= 0 && daysUntil <= 7) {
                            upcoming.push({
                                id: member.id,
                                name: member.full_name || member.email,
                                date: nextBirthday,
                                daysUntil: daysUntil
                            });
                        }
                    }
                });

                // Sort by how soon they are
                upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
                setBirthdays(upcoming);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setBirthdays([]); // Clear birthdays on error
            } finally {
                setLoading(false);
            }
        }

        if (open) {
            fetchNotifications();
        } else {
            // Optionally clear birthdays when modal closes
            setBirthdays([]);
            setLoading(true); // Reset loading state for next open
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors bg-white/5 rounded-full h-10 w-10 flex items-center justify-center border border-white/5 hover:bg-white/10 group">
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {birthdays.length > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#0c0c0e]" />
                    )}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-[#0c0c0e]/80 backdrop-blur-3xl border border-white/10 text-white shadow-2xl shadow-purple-900/20 data-[state=open]:backdrop-blur-[50px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-100">
                        <Bell className="w-5 h-5 text-purple-400" />
                        Notifications
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {birthdays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-blue-200/50">
                            <Bell className="w-12 h-12 mb-4 opacity-20" />
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {birthdays.map((bday) => (
                                    <div
                                        key={bday.id}
                                        className={`flex items-start gap-4 p-4 rounded-xl border ${bday.daysUntil === 0
                                            ? "bg-blue-500/20 border-blue-400/30"
                                            : "bg-white/5 border-white/5"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${bday.daysUntil === 0 ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-zinc-400"}`}>
                                            {bday.daysUntil === 0 ? <Gift className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className="font-medium text-blue-50">
                                                {bday.name}'s Birthday
                                            </p>
                                            <p className="text-sm text-blue-200/70">
                                                {bday.daysUntil === 0
                                                    ? "is today! A card will be sent automatically."
                                                    : bday.daysUntil === 1
                                                        ? "is tomorrow!"
                                                        : `is coming up in ${bday.daysUntil} days on ${format(bday.date, 'MMM do')}.`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
