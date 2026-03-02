"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { Users, History, Settings, LogOut, Gift, Search, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/dashboard/members", icon: Users },
    { name: "Delivery History", href: "/dashboard/history", icon: History },
    { name: "Template Settings", href: "/dashboard/settings", icon: Settings },
];

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
        <div className="flex h-screen overflow-hidden bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-500/30">
            {/* Sidebar background is a solid dark color to stand out from the gradient body slightly */}
            <aside className="w-[280px] bg-[#0c0c0e] border-r border-white/10 hidden lg:flex flex-col">
                <div className="h-20 flex items-center px-8">
                    <div className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-full" />
                        <span className="font-bold text-xl tracking-tight text-white">VibePost</span>
                    </div>
                </div>

                <div className="px-6 py-4 text-xs font-semibold text-zinc-500 tracking-wider">
                    OVERVIEW
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + "/"));

                        return (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start h-12 rounded-xl transition-all ${isActive
                                        ? "bg-purple-500/10 text-purple-400 font-medium hover:bg-purple-500/20 hover:text-purple-300"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 font-normal"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-4 ${isActive ? "text-purple-400" : "text-zinc-500"}`} />
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="text-xs font-semibold text-zinc-500 tracking-wider mb-4">
                        SETTINGS
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start h-12 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                            <LogOut className="w-5 h-5 mr-4 text-zinc-500 group-hover:text-rose-400" />
                            Logout
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-[#09090b] via-[#130b1c] to-[#09090b]">
                {/* Subtle decorative glow */}
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 lg:px-10 z-10">
                    {/* Mobile brand (hidden on desktop) */}
                    <div className="flex lg:hidden items-center gap-2 group">
                        <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-full" />
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
                        <button className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors bg-white/5 rounded-full h-10 w-10 flex items-center justify-center border border-white/5 hover:bg-white/10">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#0c0c0e]" />
                        </button>

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
    );
}
