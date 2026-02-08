"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;

    if (!user) {
        // Optional: Show Login button if not logged in? 
        // User requirement: "if logined in"
        return (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-xs font-bold text-white cursor-pointer hover:bg-gray-600" title="Not Logged In">
                ?
            </div>
        );
    }

    // Get initial
    const getInitial = () => {
        if (user.user_metadata?.full_name) {
            return user.user_metadata.full_name[0].toUpperCase();
        }
        if (user.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };

    // Get background color based on email/id (deterministic)
    const getColor = (str: string) => {
        const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500"];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const bgColor = getColor(user.email || user.id);

    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-sm font-bold text-white shadow-sm ring-2 ring-white/20 cursor-pointer hover:ring-white/40 transition-all`}>
            {getInitial()}
        </div>
    );
};
