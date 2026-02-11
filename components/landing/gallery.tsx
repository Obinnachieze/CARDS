"use client";
import React from "react";
import { CarouselCard } from "@/components/ui/carousel-card";
import { CardStackItem } from "@/components/ui/card-stack";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const occasions: CardStackItem[] = [
    {
        id: 1,
        title: "Birthday",
        description: "Create vibrant, animated birthday cards.",
        href: "/create/birthday",
        ctaLabel: "Create",
    },
    {
        id: 2,
        title: "Wedding",
        description: "Design elegant invitations with soft animations.",
        href: "/create/wedding",
        ctaLabel: "Design",
    },
    {
        id: 3,
        title: "Thank You",
        description: "Send heartfelt thank you notes.",
        href: "/create/thankyou",
        ctaLabel: "Send",
    },
    {
        id: 4,
        title: "Anniversary",
        description: "Commemorate love and milestones.",
        href: "/create/anniversary",
        ctaLabel: "Celebrate",
    },
    {
        id: 5,
        title: "Holidays",
        description: "Spread seasonal cheer.",
        href: "/create/holiday",
        ctaLabel: "Spread Cheer",
    },
    {
        id: 6,
        title: "Just Because",
        description: "Brighten someone's day unexpectedly.",
        href: "/create/justbecause",
        ctaLabel: "Send Joy",
    },
    {
        id: 7,
        title: "Envelope",
        description: "Customize a classic envelope.",
        href: "/create/envelope",
        ctaLabel: "Customize",
    },
    {
        id: 8,
        title: "Postcard",
        description: "Send a quick, beautiful postcard.",
        href: "/create/postcard",
        ctaLabel: "Design",
    },
];

export function OccasionGallery() {
    return (
        <div className="w-full py-12 relative">
            <div className="max-w-5xl mx-auto px-8 relative z-20">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                    Choose an Occasion
                </h2>
                <p className="text-center text-neutral-300 max-w-lg mx-auto mb-12">
                    Start with a template designed for your special moment. Swipe to explore.
                </p>

                <div className="flex justify-center w-full">
                    <CarouselCard items={occasions} cardsPerView={3} />
                </div>
            </div>
        </div>
    )
}
