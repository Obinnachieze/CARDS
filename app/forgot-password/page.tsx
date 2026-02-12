"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none placeholder:text-white/30 disabled:pointer-events-none disabled:opacity-50 md:text-sm",
                "focus-visible:border-white/20 focus-visible:ring-white/10 focus-visible:ring-[3px]",
                className
            )}
            {...props}
        />
    );
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            if (error) {
                setError("Unable to send reset email. Please check your email and try again.");
                console.error("Password reset error:", error);
            } else {
                setSent(true);
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl">
                    <div className="text-center space-y-1 mb-5">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                        >
                            Reset Password
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/60 text-xs"
                        >
                            {sent
                                ? "Check your inbox for the reset link."
                                : "Enter your email and we'll send you a reset link."}
                        </motion.p>
                    </div>

                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-3 py-4"
                        >
                            <CheckCircle className="w-10 h-10 text-green-400" />
                            <p className="text-sm text-white/70 text-center">
                                We sent a password reset link to <strong className="text-white">{email}</strong>.
                            </p>
                            <Link
                                href="/login"
                                className="mt-2 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Back to sign in
                            </Link>
                        </motion.div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md border border-red-500/20"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                <Mail className="absolute left-3 w-4 h-4 text-white/40" />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border-transparent text-white h-10 pl-10 pr-3 focus:bg-white/10"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full relative"
                            >
                                <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg flex items-center justify-center text-sm">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </div>
                            </motion.button>

                            <p className="text-center text-xs text-white/60 mt-2">
                                <Link
                                    href="/login"
                                    className="text-white hover:text-white/70 transition-colors font-medium"
                                >
                                    ← Back to sign in
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
