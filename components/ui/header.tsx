'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/hooks/use-scroll';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(10);
    const [user, setUser] = useState<User | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const supabase = React.useMemo(() => createClient(), []);
    const profileRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isProfileOpen && profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const links = [
        {
            label: 'Home',
            href: '/',
        },
        {
            label: 'Gallery',
            href: '#gallery',
        }
    ];

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsProfileOpen(false);
        setOpen(false);
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-white/10 md:rounded-full md:border md:transition-all md:ease-out mt-4 px-4',
                {
                    'bg-black/10 backdrop-blur-2xl border-white/15 md:top-6 md:max-w-xl md:shadow-2xl shadow-black/50':
                        scrolled && !open,
                    'bg-black/95 backdrop-blur-3xl': open,
                    'bg-transparent border-transparent': !scrolled && !open
                },
            )}
        >
            <nav
                className={cn(
                    'flex h-16 w-full items-center justify-between px-4 md:h-14 md:transition-all md:ease-out',
                    {
                        'md:px-2': scrolled,
                    },
                )}
            >
                {/* Logo and Name */}
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-full" />
                    <span className="font-bold text-xl tracking-tight text-white">
                        VibePost
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-2 md:flex">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            className={cn(
                                buttonVariants({ variant: 'ghost' }),
                                "text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                            )}
                            href={link.href}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 ml-4">
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-9 h-9 rounded-full bg-linear-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm border border-white/20 shadow-lg"
                                >
                                    {(user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name || user.email || '?')?.[0]?.toUpperCase()}
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden py-1"
                                        >
                                            <div className="px-4 py-2 border-b border-white/5">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-zinc-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut size={14} />
                                                Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-white/90 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <Button size="icon" variant="ghost" onClick={() => setOpen(!open)} className="md:hidden text-white hover:bg-white/10">
                    <MenuToggleIcon open={open} className="size-5" duration={300} />
                </Button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/10 overflow-hidden bg-black/95 backdrop-blur-3xl"
                    >
                        <div className="px-6 py-6 space-y-4">
                            <div className="grid gap-y-2">
                                {links.map((link) => (
                                    <Link
                                        key={link.label}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'ghost',
                                                className: 'justify-start text-lg h-12',
                                            }),
                                            "text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-4"
                                        )}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                {user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                                {(user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name || user.email || '?')?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-zinc-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left py-3 text-lg font-medium text-red-400 hover:bg-white/5 rounded-xl px-4 flex items-center gap-2"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <Link
                                            href="/login"
                                            className={cn(
                                                buttonVariants({ variant: 'outline' }),
                                                "w-full h-12 text-lg border-white/20 text-white hover:bg-white/10 rounded-xl justify-center"
                                            )}
                                            onClick={() => setOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className={cn(
                                                buttonVariants({ variant: 'default' }),
                                                "w-full h-12 text-lg bg-white text-black hover:bg-white/90 rounded-xl justify-center"
                                            )}
                                            onClick={() => setOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
