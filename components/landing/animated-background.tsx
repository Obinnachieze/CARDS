"use client";
import React from "react";

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden -z-20 bg-linear-to-br from-black via-purple-950/20 to-black pointer-events-none transition-opacity duration-300">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-900/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 dark:bg-emerald-900/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
        </div>
    );
}
