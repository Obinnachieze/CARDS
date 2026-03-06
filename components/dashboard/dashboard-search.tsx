"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useRef } from "react";

export function DashboardSearch({ variant = "desktop" }: { variant?: "mobile" | "desktop" }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [isExpanded, setIsExpanded] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    if (variant === "mobile") {
        return (
            <div className="flex md:hidden items-center relative">
                {!isExpanded ? (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center w-[60vw] max-w-[280px] z-50">
                        <Search className={`absolute left-3 w-4 h-4 text-zinc-500 transition-opacity ${isPending ? "opacity-50" : ""}`} />
                        <Input
                            ref={inputRef}
                            placeholder="Search..."
                            className="w-full pl-9 pr-8 h-10 bg-[#130b1c] border border-white/10 rounded-full text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50 shadow-2xl"
                            value={searchTerm}
                            onChange={handleInput}
                            onBlur={() => {
                                if (!searchTerm) setIsExpanded(false);
                            }}
                        />
                        <button
                            className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                            onClick={() => {
                                setSearchTerm("");
                                setIsExpanded(false);
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete("q");
                                startTransition(() => {
                                    router.replace(`${pathname}?${params.toString()}`);
                                });
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-opacity ${isPending ? "opacity-50" : ""}`} />
            <Input
                placeholder="Search..."
                className="w-full pl-11 h-12 bg-white/5 border-white/10 rounded-full text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50"
                value={searchTerm}
                onChange={handleInput}
            />
        </div>
    );
}
