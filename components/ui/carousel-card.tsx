"use client";
import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"; // Using Lucide icons
import { cn } from "@/lib/utils";
import Link from "next/link";

// Adapting to our project's data structure
export interface CarouselItem {
    id: number;
    title: string;
    description: string;
    href: string;
    ctaLabel?: string;
}

interface CarouselCardProps {
    items: CarouselItem[];
    showCarousel?: boolean;
    cardsPerView?: number;
}

export const CarouselCard = ({ items: data, showCarousel = true, cardsPerView = 3 }: CarouselCardProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cardsToShow, setCardsToShow] = useState(cardsPerView);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCardsToShow(1);
            } else if (window.innerWidth < 1024) {
                setCardsToShow(2);
            } else {
                setCardsToShow(cardsPerView);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [cardsPerView]);

    // Calculate width percentage for each card relative to the container width
    // The container holds (cardsToShow + 1) items
    const cardWidth = 100 / (cardsToShow + 1);

    const nextSlide = () => {
        if (isAnimating || !showCarousel || !data) return;

        // Don't allow navigation if there aren't enough cards
        if (data.length <= cardsToShow) return;

        setIsAnimating(true);
        const nextIndex = (currentIndex + 1) % data.length;

        if (containerRef.current) {
            // Apply slide out animation
            containerRef.current.style.transition = "transform 700ms ease-in-out";
            // We move by one card width
            containerRef.current.style.transform = `translateX(-${cardWidth}%)`;

            // After animation completes, reset position and update index
            setTimeout(() => {
                setCurrentIndex(nextIndex);
                if (containerRef.current) {
                    containerRef.current.style.transition = "none";
                    containerRef.current.style.transform = "translateX(0)";

                    // Force reflow
                    void containerRef.current.offsetWidth;

                    setIsAnimating(false);
                }
            }, 700);
        }
    };

    const prevSlide = () => {
        if (isAnimating || !showCarousel || !data) return;
        if (data.length <= cardsToShow) return;

        setIsAnimating(true);
        const prevIndex = (currentIndex - 1 + data.length) % data.length;

        // Use flushSync to ensure DOM update happens before we manipulate the style
        // This prevents the visual "jump" where the old content slides back before the new content appears
        flushSync(() => {
            setCurrentIndex(prevIndex);
        });

        if (containerRef.current) {
            // Now refs point to NEW content [Z, A, B, C]
            // Instantly shift left (so Z is hidden, A,B,C visible) based on the NEW content width
            containerRef.current.style.transition = "none";
            containerRef.current.style.transform = `translateX(-${cardWidth}%)`;

            // Force reflow to insure the browser registers the instant shift
            void containerRef.current.offsetWidth;

            // Animate to 0 (Z slides in from left)
            containerRef.current.style.transition = "transform 700ms ease-in-out";
            containerRef.current.style.transform = "translateX(0)";

            setTimeout(() => {
                setIsAnimating(false);
            }, 700);
        }
    };

    // Calculate which cards to show
    const getVisibleCards = () => {
        if (!showCarousel || !data) return data || [];

        const visibleCards = [];
        const totalCards = data.length;

        // We render enough cards to fill the view plus one extra for the sliding animation
        for (let i = 0; i < cardsToShow + 1; i++) {
            // safe modulo handling
            const index = (currentIndex + i) % totalCards;
            visibleCards.push(data[index]);
        }

        return visibleCards;
    };

    if (!data || data.length === 0) {
        return <div>No card data available</div>;
    }

    return (
        <div className="w-full px-4 relative">
            <div className="w-full max-w-6xl mx-auto relative group">
                {/* Carousel Controls */}
                {showCarousel && data.length > cardsToShow && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/60 backdrop-blur-md text-white p-3 rounded-full border border-white/10 transition-all duration-300 disabled:opacity-50"
                            disabled={isAnimating}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/60 backdrop-blur-md text-white p-3 rounded-full border border-white/10 transition-all duration-300 disabled:opacity-50"
                            disabled={isAnimating}
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Cards Container Wrapper - limits visible area */}
                <div className="overflow-hidden w-full px-1">
                    {/* Sliding Cards Container */}
                    <div
                        ref={containerRef}
                        className="flex"
                        style={{
                            transform: "translateX(0)",
                            // Width needs to accommodate the extra card for animation logic
                            width: `${(cardsToShow + 1) * 100 / cardsToShow}%`
                        }}
                    >
                        {getVisibleCards().map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`} // key includes idx because logic duplicates items cyclically
                                style={{
                                    width: `${100 / (cardsToShow + 1)}%`
                                }}
                                className="px-3"
                            >
                                <Link href={item.href} className="block h-full">
                                    <div className="relative h-[360px] w-full rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden group/card hover:border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer">
                                        <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center h-full w-full">
                                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 relative z-20 group-hover/card:scale-105 transition-transform duration-300">
                                                {item.title}
                                            </h3>
                                            <p className="text-neutral-300 text-sm mb-6 max-w-[90%] mx-auto relative z-20">
                                                {item.description}
                                            </p>

                                            {/* Decorative logic - mimicking the 'Create' button feel but purely visual or removed as requested. 
                                User asked to remove the button. I will add a subtle 'Explore' text or just keep it clean.
                                Let's add a subtle arrow that appears on hover to indicate clickability.
                             */}
                                            <div className="absolute bottom-6 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 text-white/50 flex items-center gap-2 text-xs uppercase tracking-widest font-medium">
                                                Create <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
