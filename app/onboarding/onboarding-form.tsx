"use client";

import React, { useState, useTransition, useEffect } from "react";
import { createOrganization } from "./actions";
import { Building2, ArrowRight, Mail, Globe, Zap } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
    return (
        <select
            data-slot="select"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        >
            {children}
        </select>
    )
}

export function OnboardingForm() {
    const [isPending, startTransition] = useTransition();
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await createOrganization(formData);
            if (result?.error) {
                alert(result.error);
            }
        });
    }

    return (
        <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center font-sans">
            {/* Background gradient effect - matches the purple style */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Top radial glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]"
                animate={{
                    opacity: [0.15, 0.3, 0.15],
                    scale: [0.98, 1.02, 0.98]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]"
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1
                }}
            />

            {/* Animated glow spots */}
            <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        {/* Card glow effect - reduced intensity */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(255,255,255,0.03)",
                                    "0 0 15px 5px rgba(255,255,255,0.05)",
                                    "0 0 10px 2px rgba(255,255,255,0.03)"
                                ],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror"
                            }}
                        />

                        {/* Traveling light beam effect - reduced opacity */}
                        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                            {/* Top light beam - enhanced glow */}
                            <motion.div
                                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    left: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }}
                            />

                            {/* Right light beam - enhanced glow */}
                            <motion.div
                                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    top: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }}
                            />

                            {/* Bottom light beam - enhanced glow */}
                            <motion.div
                                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    right: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }}
                            />

                            {/* Left light beam - enhanced glow */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    bottom: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }}
                            />

                            {/* Subtle corner glow spots - reduced opacity */}
                            <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }} />
                            <motion.div className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }} />
                            <motion.div className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }} />
                            <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }} />
                        </div>

                        {/* Card border glow - reduced opacity */}
                        <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

                        {/* Glass card background */}
                        <div className="relative bg-[#09090b]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                            {/* Subtle card inner patterns */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                    backgroundSize: '30px 30px'
                                }}
                            />

                            {/* Logo and header */}
                            <div className="text-center space-y-1 mb-5 relative z-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden bg-white/5"
                                >
                                    <img src="/logo.png" alt="Vibe Post Logo" className="w-10 h-10 rounded-full" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                                >
                                    Create Your Workspace
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-xs"
                                >
                                    Set up your company profile to start automating birthday cards
                                </motion.p>
                            </div>

                            {/* Onboarding form */}
                            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                                <motion.div className="space-y-3">
                                    {/* Company Name input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "companyName" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Building2 className={`absolute left-3 w-4 h-4 transition-all duration-300 pointer-events-none ${focusedInput === "companyName" ? 'text-white' : 'text-white/40'}`} />

                                            <Input
                                                type="text"
                                                id="companyName"
                                                name="companyName"
                                                required
                                                disabled={isPending}
                                                placeholder="Company Name (e.g. Acme Corp)"
                                                onFocus={() => setFocusedInput("companyName")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                            />

                                            {focusedInput === "companyName" && (
                                                <motion.div
                                                    layoutId="input-highlight"
                                                    className="absolute inset-0 bg-white/5 -z-10 pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Contact Email input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "contactEmail" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 pointer-events-none ${focusedInput === "contactEmail" ? 'text-white' : 'text-white/40'}`} />

                                            <Input
                                                type="email"
                                                id="contactEmail"
                                                name="contactEmail"
                                                required
                                                disabled={isPending}
                                                placeholder="Contact Email (hello@company.com)"
                                                onFocus={() => setFocusedInput("contactEmail")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                            />

                                            {focusedInput === "contactEmail" && (
                                                <motion.div
                                                    layoutId="input-highlight"
                                                    className="absolute inset-0 bg-white/5 -z-10 pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </div>
                                        {focusedInput === "contactEmail" && (
                                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[10px] text-white/50 mt-1 ml-1 px-1">
                                                Where we'll send billing and important account updates.
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Timezone Switcher */}
                                    <motion.div
                                        className={`relative ${focusedInput === "timezone" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Globe className={`absolute left-3 w-4 h-4 transition-all duration-300 pointer-events-none ${focusedInput === "timezone" ? 'text-white' : 'text-white/40'}`} />

                                            <Select
                                                id="timezone"
                                                name="timezone"
                                                required
                                                disabled={isPending}
                                                defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
                                                onFocus={() => setFocusedInput("timezone")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                            >
                                                <option value="Pacific/Midway" className="bg-[#09090b] text-white">Midway Island, Samoa</option>
                                                <option value="Pacific/Honolulu" className="bg-[#09090b] text-white">Hawaii</option>
                                                <option value="America/Juneau" className="bg-[#09090b] text-white">Alaska</option>
                                                <option value="America/Los_Angeles" className="bg-[#09090b] text-white">Pacific Time (US and Canada)</option>
                                                <option value="America/Denver" className="bg-[#09090b] text-white">Mountain Time (US and Canada)</option>
                                                <option value="America/Chicago" className="bg-[#09090b] text-white">Central Time (US and Canada)</option>
                                                <option value="America/New_York" className="bg-[#09090b] text-white">Eastern Time (US and Canada)</option>
                                                <option value="America/Caracas" className="bg-[#09090b] text-white">Caracas, La Paz</option>
                                                <option value="America/Halifax" className="bg-[#09090b] text-white">Atlantic Time (Canada)</option>
                                                <option value="America/Buenos_Aires" className="bg-[#09090b] text-white">Buenos Aires, Georgetown</option>
                                                <option value="Atlantic/South_Georgia" className="bg-[#09090b] text-white">Mid-Atlantic</option>
                                                <option value="Atlantic/Azores" className="bg-[#09090b] text-white">Azores</option>
                                                <option value="Europe/London" className="bg-[#09090b] text-white">Greenwich Mean Time (London)</option>
                                                <option value="Europe/Berlin" className="bg-[#09090b] text-white">Central European Time (Berlin)</option>
                                                <option value="Africa/Lagos" className="bg-[#09090b] text-white">West Africa Time (Lagos)</option>
                                                <option value="Africa/Johannesburg" className="bg-[#09090b] text-white">South Africa Standard Time (Johannesburg)</option>
                                                <option value="Europe/Athens" className="bg-[#09090b] text-white">Eastern European Time (Athens)</option>
                                                <option value="Europe/Moscow" className="bg-[#09090b] text-white">Moscow, St. Petersburg, Volgograd</option>
                                                <option value="Asia/Dubai" className="bg-[#09090b] text-white">Abu Dhabi, Muscat</option>
                                                <option value="Asia/Karachi" className="bg-[#09090b] text-white">Islamabad, Karachi</option>
                                                <option value="Asia/Dhaka" className="bg-[#09090b] text-white">Astana, Dhaka</option>
                                                <option value="Asia/Colombo" className="bg-[#09090b] text-white">Sri Jayawardenepura</option>
                                                <option value="Asia/Bangkok" className="bg-[#09090b] text-white">Bangkok, Hanoi, Jakarta</option>
                                                <option value="Asia/Singapore" className="bg-[#09090b] text-white">Beijing, Singapore, Taipei</option>
                                                <option value="Asia/Tokyo" className="bg-[#09090b] text-white">Osaka, Sapporo, Tokyo</option>
                                                <option value="Australia/Sydney" className="bg-[#09090b] text-white">Canberra, Melbourne, Sydney</option>
                                                <option value="Asia/Vladivostok" className="bg-[#09090b] text-white">Vladivostok</option>
                                                <option value="Pacific/Auckland" className="bg-[#09090b] text-white">Auckland, Wellington</option>
                                                <option value="Pacific/Fiji" className="bg-[#09090b] text-white">Fiji, Kamchatka, Marshall Is.</option>
                                            </Select>

                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className={`w-4 h-4 transition-all duration-300 ${focusedInput === "timezone" ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>

                                            {focusedInput === "timezone" && (
                                                <motion.div
                                                    layoutId="input-highlight"
                                                    className="absolute inset-0 bg-white/5 -z-10 pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </div>
                                    </motion.div>

                                    <p className="text-[10px] text-white/40 mt-1 ml-1 px-1">
                                        Time zone ensures your automated cards are sent at 8:00 AM your local time.
                                    </p>

                                </motion.div>

                                {/* Submit button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full relative group/button mt-5"
                                >
                                    {/* Button glow effect - reduced intensity */}
                                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300 pointer-events-none" />

                                    <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        {/* Button background animation */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-black/10 to-white/0 -z-10"
                                            animate={{
                                                x: ['-100%', '100%'],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                repeatDelay: 1
                                            }}
                                            style={{
                                                opacity: isPending ? 1 : 0,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        />

                                        <AnimatePresence mode="wait">
                                            {isPending ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="button-text"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-1 text-sm font-medium"
                                                >
                                                    Get started with your business
                                                    <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
