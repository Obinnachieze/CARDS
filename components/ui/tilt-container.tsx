"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltContainerProps {
    children: React.ReactNode;
    className?: string;
    /** Maximum rotation angle in degrees (default: 15) */
    maxRotation?: number;
    /** Whether the effect is active (default: true) */
    isActive?: boolean;
}

export const TiltContainer = ({
    children,
    className = "",
    maxRotation = 15,
    isActive = true,
}: TiltContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track mouse coordinates (-1 to 1)
    const xValue = useMotionValue(0);
    const yValue = useMotionValue(0);

    // Smooth out the movement using spring physics
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const smoothX = useSpring(xValue, springConfig);
    const smoothY = useSpring(yValue, springConfig);

    // Map coordinates to rotation (-maxRotation to maxRotation)
    // Note: when moving right (positive x), we want to rotate around Y axis (positive rotateY)
    // When moving down (positive y), we want to tilt backwards (negative rotateX)
    const rotateX = useTransform(smoothY, [-1, 1], [maxRotation, -maxRotation]);
    const rotateY = useTransform(smoothX, [-1, 1], [-maxRotation, maxRotation]);

    // Handle mobile device orientation
    const [hasOrientationAPI, setHasOrientationAPI] = useState(false);

    useEffect(() => {
        // Check if DeviceOrientation API is available and not in a desktop browser
        if (typeof window !== 'undefined' && window.DeviceOrientationEvent && 'ontouchstart' in window) {
            setHasOrientationAPI(true);
        }
    }, []);

    useEffect(() => {
        if (!isActive || !hasOrientationAPI) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            // beta is front/back tilt [-180, 180]
            // gamma is left/right tilt [-90, 90]
            const { beta, gamma } = event;

            if (beta === null || gamma === null) return;

            // Normalize values roughly to -1 to 1 range for typical holding angles
            // Assuming typical resting phone angle is 45 degrees (beta)
            const normalizedY = ((beta - 45) / 45); // Map 0->90 to -1->1
            const normalizedX = (gamma / 45); // Map -45->45 to -1->1

            // Clamp values
            const clampedX = Math.max(-1, Math.min(1, normalizedX));
            const clampedY = Math.max(-1, Math.min(1, normalizedY));

            xValue.set(clampedX);
            yValue.set(clampedY);
        };

        // Request permission for iOS 13+ devices
        const requestAccessAndListen = async () => {
            // @ts-ignore - iOS specific method
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    // @ts-ignore
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener("deviceorientation", handleOrientation);
                    }
                } catch (error) {
                    console.error("Error requesting device orientation permission:", error);
                }
            } else {
                window.addEventListener("deviceorientation", handleOrientation);
            }
        }

        // We only try to listen. We might need user interaction first on iOS, 
        // but we'll try straight away for Android/standard browsers.
        requestAccessAndListen();

        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, [isActive, hasOrientationAPI, xValue, yValue]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isActive || !containerRef.current || hasOrientationAPI) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Calculate position relative to center of the specific element
        // Normalize to -1 to 1 range
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Convert 0..1 to -1..1
        const normalizedX = (x - 0.5) * 2;
        const normalizedY = (y - 0.5) * 2;

        xValue.set(normalizedX);
        yValue.set(normalizedY);
    };

    const handleMouseLeave = () => {
        if (!isActive || hasOrientationAPI) return;
        xValue.set(0);
        yValue.set(0);
    };

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{ perspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{
                    rotateX: isActive ? rotateX : 0,
                    rotateY: isActive ? rotateY : 0,
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full flex items-center justify-center relative touch-none"
            >
                {/* We add a secondary transform target here for z-indexing separation of the content itself */}
                <div style={{ transform: "translateZ(30px)" }} className="w-full h-full">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
