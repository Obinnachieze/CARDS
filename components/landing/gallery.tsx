"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const occasions = [
    {
        title: "Birthday",
        description: "Create vibrant, animated birthday cards with balloons, confetti, and personal messages to celebrate another year of life.",
        link: "/create/birthday",
        color: "bg-blue-500",
    },
    {
        title: "Wedding",
        description: "Design elegant wedding invitations or congratulations with soft animations and romantic themes for the big day.",
        link: "/create/wedding",
        color: "bg-pink-500",
    },
    {
        title: "Thank You",
        description: "Send heartfelt thank you notes that express your gratitude with warmth and style.",
        link: "/create/thankyou",
        color: "bg-emerald-500",
    },
    {
        title: "Anniversary",
        description: "Commemorate love and milestones with timeless designs that cherish the journey together.",
        link: "/create/anniversary",
        color: "bg-purple-500",
    },
    {
        title: "Just Because",
        description: "Brighten someone's day unexpectedly with a fun, spontaneous card—no special occasion needed.",
        link: "/create/justbecause",
        color: "bg-orange-500",
    },
    {
        title: "Holidays",
        description: "Spread seasonal cheer with festive cards for Christmas, New Year, and other holidays throughout the year.",
        link: "/create/holiday",
        color: "bg-red-500",
    },
];

export const HoverEffect = ({
    items,
    className,
}: {
    items: {
        title: string;
        description: string;
        link: string;
    }[];
    className?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
                className
            )}
        >
            {items.map((item, idx) => (
                <Link
                    href={item.link}
                    key={item.link}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-white/10 block rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <Card>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden bg-black text-white border border-neutral-800 group-hover:border-slate-700 relative z-20",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

const CardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h4 className={cn("text-white font-bold tracking-wide mt-4", className)}>
            {children}
        </h4>
    );
};

const CardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                "mt-8 text-neutral-400 tracking-wide leading-relaxed text-sm",
                className
            )}
        >
            {children}
        </p>
    );
};

import { AnimatePresence } from "framer-motion";
import React from "react";

export function OccasionGallery() {
    return (
        <div className="max-w-5xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Choose an Occasion</h2>
            <HoverEffect items={occasions} />
        </div>
    )
}
