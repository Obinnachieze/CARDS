"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "fixed top-10 inset-x-0 max-w-2xl mx-auto z-50",
                className
            )}
        >
            <div className="relative rounded-full border border-neutral-200 dark:border-white/[0.2] bg-white dark:bg-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-4 py-2 flex items-center justify-between space-x-4">
                <Link href="/" className="font-bold text-neural-600 dark:text-neutral-100 flex items-center gap-2">

                    <span className="hidden sm:block">VibePost</span>
                </Link>
                <div className="flex gap-4">
                    <Link href="/create/new" className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors text-sm">Create</Link>
                    <Link href="/gallery" className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors text-sm">Gallery</Link>
                    <Link href="/login" className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold transition-colors">Login</Link>
                </div>
            </div>
        </div>
    );
}
