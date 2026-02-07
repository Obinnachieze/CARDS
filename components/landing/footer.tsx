import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Footer() {
    return (
        <footer className="bg-background border-t border-neutral-200 dark:border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} />
                            <span className="font-bold text-xl text-foreground">VibePost</span>
                        </Link>
                        <p className="text-neutral-500 text-sm">
                            The premium digital card platform for moments that matter.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-foreground font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Showcase</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-foreground font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                        &copy; {new Date().getFullYear()} VibePost Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Social icons could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
