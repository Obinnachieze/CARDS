"use client";
import React from "react";
import {
    Globe,
    Zap,
    Music,
    Calendar,
    Mail
} from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

const features = [
    {
        Icon: Globe,
        name: "Global Reach",
        description: "Send your feelings anywhere in the world instantly. No postage, no delays.",
        href: "#",
        cta: "See Map",
        background: null,
        className: "lg:col-span-2 lg:row-span-1",
    },
    {
        Icon: Zap,
        name: "Instant Delivery",
        description: "Your cards arrive perfectly on time, every time.",
        href: "#",
        cta: "Learn more",
        background: null,
        className: "lg:col-span-1 lg:row-span-1",
    },
    {
        Icon: Music,
        name: "Custom Soundscapes",
        description: "Add music or voice messages to make it truly personal.",
        href: "#",
        cta: "Listen",
        background: null,
        className: "lg:col-span-1 lg:row-span-1",
    },
    {
        Icon: Calendar,
        name: "Smart Scheduling",
        description: "Never miss a birthday. Schedule cards years in advance.",
        href: "#",
        cta: "Schedule",
        background: null,
        className: "lg:col-span-2 lg:row-span-1",
    },
    {
        Icon: Mail,
        name: "Contact Us",
        description: "Have questions? We're here to help you craft the perfect moment.",
        href: "mailto:hello@vibepost.com",
        cta: "Email Support",
        background: null,
        className: "lg:col-span-3 lg:row-span-1",
    },
];

export function AboutContact() {
    return (
        <section id="about" className="py-24 bg-black relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-neutral-900 to-transparent opacity-50 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Crafted for Connection
                    </h2>
                    <p className="text-neutral-400 text-lg">
                        VibePost combines the emotion of a handwritten letter with the limitless possibilities of the digital world.
                    </p>
                </div>

                <BentoGrid className="lg:grid-rows-3">
                    {features.map((feature) => (
                        <BentoCard key={feature.name} {...feature} />
                    ))}
                </BentoGrid>
            </div>
        </section>
    );
}
