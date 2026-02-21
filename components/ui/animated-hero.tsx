import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["Beautiful", "Personal", "Timeless", "Effortless", "Interactive"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div className="w-full relative z-10 pt-8">
            <div className="container mx-auto px-4">
                <div className="flex gap-8 pt-0 pb-20 items-center justify-center flex-col">
                    <div>
                        <Button variant="secondary" size="sm" className="gap-4 rounded-full bg-white/10 hover:bg-white/20 text-black dark:text-white border border-black/10 dark:border-white/10 backdrop-blur-sm">
                            ✨ The Future of Gifting <MoveRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex gap-4 flex-col items-center">
                        <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-regular">
                            <span className="text-black dark:text-white font-bold">Send Feelings,</span>
                            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute font-semibold text-transparent bg-clip-text bg-linear-to-r from-rose-500 to-orange-500"
                                        initial={{ opacity: 0, y: "-100" }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? -150 : 150,
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-neutral-600 dark:text-neutral-400 max-w-2xl text-center">
                            Craft high-fidelity, interactive digital experiences that feel like a gift.
                            Avoid generic ecards—unwrap the moment with VibePost.
                        </p>
                    </div>
                    <div className="flex flex-row justify-center mt-4">
                        <Button
                            size="lg"
                            className="gap-2 rounded-full px-8 bg-linear-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white border-none shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
                            onClick={() => window.location.href = '/create/new'}
                        >
                            Create a Card <MoveRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Hero };
