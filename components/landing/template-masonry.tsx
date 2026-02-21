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
        image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=800',
        href: '/create/birthday-neon',
        category: 'Birthday',
        aspect: 'aspect-3/4'
    },
    {
        id: 'wedding-1',
        title: 'Minimalist Elegance',
        description: 'Clean typography for sophisticated invites.',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        href: '/create/wedding-minimal',
        category: 'Wedding',
        aspect: 'aspect-square'
    },
    {
        id: 'anniversary-1',
        title: 'Golden Moments',
        description: 'Warm, shimmering effects for milestones.',
        image: 'https://images.unsplash.com/photo-1522673607200-164883efbfc1?auto=format&fit=crop&q=80&w=800',
        href: '/create/anniversary-gold',
        category: 'Anniversary',
        aspect: 'aspect-9/16'
    },
    {
        id: 'love-1',
        title: 'Romantic Sunset',
        description: 'Express your feelings with a beautiful sunset.',
        image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
        href: '/create/love-sunset',
        category: 'Love',
        aspect: 'aspect-3/4'
    },
    {
        id: 'thank-you-1',
        title: 'Floral Appreciation',
        description: 'Soft pastel flowers with handwritten notes.',
        image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=800',
        href: '/create/thank-you-floral',
        category: 'Thank You',
        aspect: 'aspect-3/4'
    },
    {
        id: 'party-1',
        title: 'Midnight Revelry',
        description: 'Dark theme with confetti and glow effects.',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
        href: '/create/party-midnight',
        category: 'Party',
        aspect: 'aspect-9/16'
    },
    {
        id: 'just-because-1',
        title: 'Abstract Joy',
        description: 'Colorful shapes for a quick pick-me-up.',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
        href: '/create/abstract-joy',
        category: 'Just Because',
        aspect: 'aspect-square'
    },
    {
        id: 'nature-1',
        title: 'Serene Forest',
        description: 'Peaceful woods for thoughtful messages.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
        href: '/create/nature-forest',
        category: 'Nature',
        aspect: 'aspect-3/5'
    },
    {
        id: 'holiday-1',
        title: 'Winter Wonderland',
        description: 'Animated snow and cozy textures.',
        image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=800',
        href: '/create/holiday-winter',
        category: 'Holidays',
        aspect: 'aspect-3/5'
    },
    {
        id: 'adventure-1',
        title: 'Mountain Peak',
        description: 'Inspiring views for adventurous friends.',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
        href: '/create/adventure-peak',
        category: 'Adventure',
        aspect: 'aspect-3/4'
    },
    {
        id: 'graduation-1',
        title: 'Academic Success',
        description: 'Classic navy and gold for new graduates.',
        image: 'https://images.unsplash.com/photo-1523050335456-adeba27201b1?auto=format&fit=crop&q=80&w=800',
        href: '/create/graduation-classic',
        category: 'Graduation',
        aspect: 'aspect-3/4'
    },
    {
        id: 'baby-shower-1',
        title: 'Cloud Nine',
        description: 'Dreamy clouds and starry backgrounds.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
        href: '/create/baby-shower-clouds',
        category: 'Baby Shower',
        aspect: 'aspect-9/16'
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

                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
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
                                    <img
                                        src={template.image}
                                        alt={template.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

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

                                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Link href={template.href}>
                                                <Button size="sm" className="w-full bg-white text-black hover:bg-neutral-200 rounded-lg gap-2 font-bold shadow-lg">
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
