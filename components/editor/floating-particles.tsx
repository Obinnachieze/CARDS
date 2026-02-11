"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingParticlesProps {
    emoji: string;
    count?: number;
}

interface Particle {
    id: number;
    x: number; // percentage 0-100
    size: number;
    duration: number;
    delay: number;
}

export const FloatingParticles = ({ emoji, count = 25 }: FloatingParticlesProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Generate random particles
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: Math.random() * 20 + 20, // 20px - 40px
            duration: Math.random() * 2 + 3, // 3s - 5s float time
            delay: Math.random() * 2, // 0s - 2s delay
        }));
        setParticles(newParticles);
    }, [emoji, count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ y: "110%", x: `${particle.x}%`, opacity: 0 }}
                        animate={{
                            y: "-20%",
                            opacity: [0, 1, 1, 0],
                            x: [`${particle.x}%`, `${particle.x + (Math.random() * 10 - 5)}%`, `${particle.x}%`], // Slight sway
                        }}
                        transition={{
                            duration: particle.duration,
                            delay: particle.delay,
                            ease: "easeOut",
                        }}
                        className="absolute bottom-0"
                        style={{ fontSize: particle.size }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
