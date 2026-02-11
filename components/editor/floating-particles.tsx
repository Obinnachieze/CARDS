"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingParticlesProps {
    emoji: string;
    count?: number;
}

interface Particle {
    id: number;
    startX: number;   // percentage 0-100
    startY: number;    // percentage — where it begins (80-110)
    endY: number;      // percentage — where it stops (40-60, i.e. roughly mid-card)
    swayX: number;     // horizontal drift amount
    size: number;
    duration: number;
    delay: number;
}

export const FloatingParticles = ({ emoji, count = 25 }: FloatingParticlesProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const generated = useRef(false);

    useEffect(() => {
        generated.current = false;
    }, [emoji, count]);

    useEffect(() => {
        if (generated.current) return;
        generated.current = true;

        const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
            // Spread start positions: bottom edge, bottom-left, bottom-right corners
            const startX = Math.random() * 100;                  // full width spread
            const startY = 80 + Math.random() * 30;              // 80% - 110% (below and near bottom)
            const endY = 35 + Math.random() * 25;                // 35% - 60% (stop around middle)
            const swayX = (Math.random() - 0.5) * 20;           // -10 to +10 drift

            return {
                id: i,
                startX,
                startY,
                endY,
                swayX,
                size: Math.random() * 16 + 18,                   // 18px - 34px
                duration: Math.random() * 2 + 2.5,               // 2.5s - 4.5s
                delay: Math.random() * 3,                         // stagger over 3s for more spread
            };
        });

        setParticles(newParticles);
    }, [emoji, count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{
                            top: `${p.startY}%`,
                            left: `${p.startX}%`,
                            opacity: 0,
                            scale: 0.5,
                        }}
                        animate={{
                            top: `${p.endY}%`,
                            left: [
                                `${p.startX}%`,
                                `${p.startX + p.swayX * 0.5}%`,
                                `${p.startX + p.swayX}%`,
                                `${p.startX + p.swayX * 0.6}%`,
                            ],
                            opacity: [0, 0.9, 1, 0.7, 0],
                            scale: [0.5, 1, 1.1, 0.9, 0.4],
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            ease: "easeOut",
                        }}
                        className="absolute"
                        style={{ fontSize: p.size }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
