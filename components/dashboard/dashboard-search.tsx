"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useRef } from "react";

export function DashboardSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set("q", value);
            } else {
                params.delete("q");
            }

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, 300);
    };

    // Sync input with purely navigational changes (like clearing search from elsewhere)
    // We only want to run this if the URL actually changed independently of our typing
    useEffect(() => {
        setSearchTerm(searchParams.get("q") || "");
    }, [searchParams]);

    return (
        <div className="flex-1 max-w-xl hidden md:flex items-center">
            <div className="relative w-full">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-opacity ${isPending ? "opacity-50" : ""}`} />
                <Input
                    placeholder="Search members or recipients..."
                    className="w-full pl-11 h-12 bg-white/5 border-white/10 rounded-full text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
}
