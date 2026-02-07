"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "What makes VibePost different from ecards?",
        answer:
            "VibePost isn't just a static image. It's an interactive, high-fidelity experience. We use premium typography, 3D animations, and soundscapes to make opening a digital card feel as special as a physical one.",
    },
    {
        question: "Is it free to send?",
        answer:
            "We offer a generous free tier that lets you send beautiful standard cards. Our premium tier unlocks exclusive artist collaborations, custom soundtracks, and AI-powered writing assistance.",
    },
    {
        question: "Can I customize the design?",
        answer:
            "Absolutely. Our editor gives you granular control over typography, colors, and layout. You can also upload your own media and let our AI help you write the perfect message.",
    },
    {
        question: "How long do the links last?",
        answer:
            "VibePost links are permanent. Your memories are stored securely on our cloud, so you can revisit them fondly years from now.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-neutral-400 text-lg">
                        Everything you need to know about the VibePost experience.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-lg font-medium text-white">
                                    {faq.question}
                                </span>
                                {openIndex === idx ? (
                                    <Minus className="text-emerald-400 w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <Plus className="text-neutral-400 w-5 h-5 flex-shrink-0" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 pt-0 text-neutral-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
