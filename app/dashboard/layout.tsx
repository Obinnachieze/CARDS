"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { Users, History, Settings, LogOut, Gift, Search, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationModal } from "@/components/dashboard/notification-modal";
import { Sidebar, SidebarBody, useSidebar, SidebarMobileTrigger } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/dashboard/members", icon: Users },
    { name: "Delivery History", href: "/dashboard/history", icon: History },
    { name: "Template Settings", href: "/dashboard/settings", icon: Settings },
];

const DashboardSidebarContent = ({ navItems, pathname }: any) => {
    const { open, animate } = useSidebar();

    return (
        <SidebarBody className="bg-[#0c0c0e] border-r border-white/10 p-0 justify-between h-full w-full">
            <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar w-full">
                <div className={cn("h-20 flex items-center transition-all min-h-20", open ? "px-8" : "px-0 justify-center")}>
                    <Link href="/" className="flex items-center gap-2 group whitespace-nowrap overflow-hidden">
                        <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-full flex-shrink-0" />
                        <motion.span
                            animate={{ display: animate ? (open ? "inline-block" : "none") : "inline-block", opacity: animate ? (open ? 1 : 0) : 1 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="font-bold text-xl tracking-tight text-white"
                        >
                            VibePost
                        </motion.span>
                    </Link>
                </div>

                <div className={cn("py-4 text-xs font-semibold text-zinc-500 tracking-wider transition-all whitespace-nowrap overflow-hidden", open ? "px-6 block" : "px-0 text-center text-[10px] hidden")}>
                    OVERVIEW
                </div>

                <nav className={cn("flex-1 space-y-1 transition-all mt-2", open ? "px-4" : "px-4")}>
                    {navItems.map((item: any) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + "/"));

                        return (
                            <Link key={item.name} href={item.href} className="block w-full">
                                <Button
                                    variant="ghost"
                                    className={cn(`relative w-full h-12 rounded-xl transition-all flex items-center overflow-hidden`, isActive
                                        ? "bg-purple-500/10 text-purple-400 font-medium hover:bg-purple-500/20 hover:text-purple-300"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 font-normal",
                                        open ? "justify-start px-4" : "justify-center px-0"
                                    )}
                                >
                                    <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 z-20">
                                        <Icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "text-zinc-500")} />
                                    </div>
                                    <motion.span
                                        animate={{
                                            opacity: animate ? (open ? 1 : 0) : 1,
                                            x: animate ? (open ? 0 : -20) : 0,
                                            display: animate ? (open ? "inline-block" : "none") : "inline-block",
                                        }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className={cn("whitespace-nowrap absolute left-12")}
                                    >
                                        {item.name}
                                    </motion.span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className={cn("mt-auto transition-all", open ? "p-6" : "p-4 flex flex-col items-center")}>
                <div className={cn("text-xs font-semibold text-zinc-500 tracking-wider mb-4 whitespace-nowrap overflow-hidden", open ? "block" : "hidden")}>
                    SETTINGS
                </div>
                <Link href="/" className="w-full block">
                    <Button variant="ghost" className={cn(`w-full h-12 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${open ? "justify-start px-4" : "justify-center px-0"}`)}>
                        <LogOut className={cn("w-5 h-5 flex-shrink-0 group-hover:text-rose-400", open ? "mr-4 text-zinc-500" : "mr-0 text-zinc-500")} />
                        <motion.span
                            animate={{ display: animate ? (open ? "inline-block" : "none") : "inline-block", opacity: animate ? (open ? 1 : 0) : 1 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="whitespace-nowrap"
                        >
                            Logout
                        </motion.span>
                    </Button>
                </Link>
            </div>
        </SidebarBody>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [userInitials, setUserInitials] = useState("U");
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name || user.email || 'User';
                setUserName(name);
                setUserInitials(name[0].toUpperCase());
            }
        };
        fetchUser();
    }, []);

    return (
        <Sidebar>
            <div className="flex flex-1 w-full h-screen overflow-hidden bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-500/30">
                <DashboardSidebarContent navItems={navItems} pathname={pathname} />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-gradient-to-br from-[#09090b] via-[#130b1c] to-[#09090b]">
                    {/* Subtle decorative glow */}
                    <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

                    {/* Top Header */}
                    <header className="h-20 flex items-center justify-between px-8 lg:px-10 z-10 shrink-0 w-full">
                        {/* Mobile brand (hidden on desktop) */}
                        <div className="flex lg:hidden items-center gap-4 group">
                            <SidebarMobileTrigger />
                            <Link href="/">
                                <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-full" />
                            </Link>
                        </div>

                        <div className="flex-1 max-w-xl hidden md:flex items-center">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    placeholder="Search members or logs..."
                                    className="w-full pl-11 h-12 bg-white/5 border-white/10 rounded-full text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 ml-auto pl-4">
                            <NotificationModal />

                            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                                <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-purple-500/20">
                                    <AvatarFallback className="bg-purple-900 text-purple-200">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-zinc-200">{userName}</p>
                                    <p className="text-xs text-zinc-500">Organization Owner</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto px-8 lg:px-10 pb-10 z-10 custom-scrollbar">
                        {children}
                    </div>
                </main>
            </div>
        </Sidebar>
    );
}
