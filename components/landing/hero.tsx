"use client";
import React from "react";
import { ParallaxScroll } from "../ui/parallax-scroll";
import { Navbar } from "./navbar";

export function Hero() {
    const images = [
        "/website.png",
        "/website.png", // Using the design image as placeholder for now
        "/website.png",
        "/website.png",
        "/website.png",
        "/website.png",
    ];

    return (
        <div className="bg-black dark:bg-black w-full relative">
            <Navbar />
            <div className="pt-32 pb-10 px-4">
                <div className="max-w-7xl mx-auto text-center mb-20 relative z-10">
                    <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        VibePost <span className="text-emerald-glow">.</span>
                    </h1>
                    <p className="mt-4 max-w-lg mx-auto text-base md:text-xl text-neutral-300 font-light">
                        Send high-fidelity digital cards with a touch of elegance.
                        Experience the fine art of connection.
                    </p>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-glow/20 blur-[120px] -z-10 rounded-full opacity-50 pointer-events-none" />
                </div>

                <ParallaxScroll images={images} />
            </div>
        </div>
    );
}
