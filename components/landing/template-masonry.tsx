'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const templates = [
    {
        id: 'birthday-1',
        title: 'Neon Birthday Bash',
        description: 'Vibrant neon colors with animated balloons.',
        href: '/create/birthday-neon',
        category: 'Birthday',
        aspect: 'aspect-[3/4]',
        design: {
            bg: 'bg-zinc-950 border-2 border-fuchsia-500 shadow-[inset_0_0_50px_rgba(217,70,239,0.3)]',
            text: 'Happy Birthday!',
            font: 'font-sans font-black uppercase tracking-widest',
            textColor: 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]',
            emojis: ['🎈', '🎂', '✨']
        }
    },
    {
        id: 'wedding-1',
        title: 'Minimalist Elegance',
        description: 'Clean typography for sophisticated invites.',
        href: '/create/wedding-minimal',
        category: 'Wedding',
        aspect: 'aspect-square',
        design: {
            bg: 'bg-stone-100',
            text: 'You are invited',
            font: 'font-serif italic',
            textColor: 'text-stone-800',
            emojis: ['🕊️', '🤍', '🌿']
        }
    },
    {
        id: 'anniversary-1',
        title: 'Golden Moments',
        description: 'Warm, shimmering effects for milestones.',
        href: '/create/anniversary-gold',
        category: 'Anniversary',
        aspect: 'aspect-[9/16]',
        design: {
            bg: 'bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 border border-amber-500/50',
            text: 'Happy Anniversary',
            font: 'font-serif',
            textColor: 'text-amber-400',
            emojis: ['🥂', '✨', '💛']
        }
    },
    {
        id: 'love-1',
        title: 'Romantic Sunset',
        description: 'Express your feelings with a beautiful sunset.',
        href: '/create/love-sunset',
        category: 'Love',
        aspect: 'aspect-[3/4]',
        design: {
            bg: 'bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500',
            text: 'Love You',
            font: 'font-[cursive] text-5xl',
            textColor: 'text-white drop-shadow-md',
            emojis: ['🌅', '💖', '💌']
        }
    },
    {
        id: 'thank-you-1',
        title: 'Floral Appreciation',
        description: 'Soft pastel flowers with handwritten notes.',
        href: '/create/thank-you-floral',
        category: 'Thank You',
        aspect: 'aspect-[3/4]',
        design: {
            bg: 'bg-rose-50',
            text: 'Thank You',
            font: 'font-[cursive] text-4xl',
            textColor: 'text-rose-600',
            emojis: ['🌸', '🌿', '🎀']
        }
    },
    {
        id: 'party-1',
        title: 'Midnight Revelry',
        description: 'Dark theme with confetti and glow effects.',
        href: '/create/party-midnight',
        category: 'Party',
        aspect: 'aspect-[9/16]',
        design: {
            bg: 'bg-indigo-950',
            text: "Let's Party",
            font: 'font-sans font-bold text-4xl',
            textColor: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
            emojis: ['🪩', '🍸', '🥳']
        }
    },
    {
        id: 'just-because-1',
        title: 'Abstract Joy',
        description: 'Colorful shapes for a quick pick-me-up.',
        href: '/create/abstract-joy',
        category: 'Just Because',
        aspect: 'aspect-square',
        design: {
            bg: 'bg-yellow-300',
            text: 'Smile!',
            font: 'font-sans font-black text-5xl rotate-[-5deg]',
            textColor: 'text-black',
            emojis: ['😊', '🎨', '🌈']
        }
    },
    {
        id: 'nature-1',
        title: 'Serene Forest',
        description: 'Peaceful woods for thoughtful messages.',
        href: '/create/nature-forest',
        category: 'Nature',
        aspect: 'aspect-[3/5]',
        design: {
            bg: 'bg-gradient-to-b from-emerald-800 to-emerald-950',
            text: 'Thinking of you',
            font: 'font-serif text-3xl',
            textColor: 'text-emerald-100',
            emojis: ['🌲', '🦌', '🍃']
        }
    },
    {
        id: 'holiday-1',
        title: 'Winter Wonderland',
        description: 'Animated snow and cozy textures.',
        href: '/create/holiday-winter',
        category: 'Holidays',
        aspect: 'aspect-[3/5]',
        design: {
            bg: 'bg-cyan-50',
            text: 'Happy Holidays',
            font: 'font-[cursive] text-4xl',
            textColor: 'text-cyan-700',
            emojis: ['❄️', '⛄', '🎄']
        }
    },
    {
        id: 'adventure-1',
        title: 'Mountain Peak',
        description: 'Inspiring views for adventurous friends.',
        href: '/create/adventure-peak',
        category: 'Adventure',
        aspect: 'aspect-[3/4]',
        design: {
            bg: 'bg-slate-800',
            text: 'Next Adventure',
            font: 'font-sans font-bold uppercase tracking-widest',
            textColor: 'text-slate-200',
            emojis: ['⛰️', '🏕️', '🦅']
        }
    },
    {
        id: 'graduation-1',
        title: 'Academic Success',
        description: 'Classic navy and gold for new graduates.',
        href: '/create/graduation-classic',
        category: 'Graduation',
        aspect: 'aspect-[3/4]',
        design: {
            bg: 'bg-blue-950 border-4 border-yellow-500/80',
            text: 'Class of 2024',
            font: 'font-serif font-bold text-3xl',
            textColor: 'text-yellow-500',
            emojis: ['🎓', '📜', '🌟']
        }
    },
    {
        id: 'baby-shower-1',
        title: 'Cloud Nine',
        description: 'Dreamy clouds and starry backgrounds.',
        href: '/create/baby-shower-clouds',
        category: 'Baby Shower',
        aspect: 'aspect-[9/16]',
        design: {
            bg: 'bg-gradient-to-b from-sky-100 to-white',
            text: 'Oh Baby!',
            font: 'font-sans font-medium text-4xl',
            textColor: 'text-sky-400',
            emojis: ['☁️', '🍼', '🧸']
        }
    }
];

export function TemplateMasonry() {
    return (
        <section id="gallery" className="w-full py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60">
                        <Sparkles size={12} className="text-orange-400" />
                        Card Templates
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-center text-white">
                        Start with a Masterpiece
                    </h2>
                    <p className="text-neutral-400 text-center max-w-xl">
                        Browse our curated collection of interactive templates.
                        Choose one to customize and make it your own in seconds.
                    </p>
                </div>

                <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {templates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="break-inside-avoid"
                        >
                            <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50">
                                <div className={cn("relative overflow-hidden", template.aspect)}>
                                    <div className={cn("w-full h-full flex flex-col items-center justify-center p-6 relative transition-transform duration-500 group-hover:scale-105", template.design.bg)}>
                                        <div className="absolute top-6 right-6 text-2xl md:text-4xl animate-bounce" style={{ animationDuration: '3s' }}>
                                            {template.design.emojis[0]}
                                        </div>
                                        <div className="absolute bottom-20 left-6 text-3xl md:text-5xl rotate-12 opacity-80">
                                            {template.design.emojis[1]}
                                        </div>
                                        <div className="absolute top-1/3 left-8 text-xl md:text-3xl -rotate-12 opacity-60">
                                            {template.design.emojis[2]}
                                        </div>
                                        <span className={cn("text-center z-10 p-4 leading-tight break-words", template.design.font, template.design.textColor)}>
                                            {template.design.text}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity" />

                                    <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="space-y-2">
                                            <span className="inline-block px-2 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                                {template.category}
                                            </span>
                                            <h3 className="text-xl font-bold text-white leading-tight">
                                                {template.title}
                                            </h3>
                                            <p className="text-sm text-white/70 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {template.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
                                            <Link href={template.href}>
                                                <Button size="sm" className="w-full bg-white text-black hover:bg-neutral-200 focus-visible:ring-4 focus-visible:ring-purple-500 rounded-lg gap-2 font-bold shadow-lg">
                                                    Start with this <ExternalLink size={14} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
