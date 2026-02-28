import { createClient } from "@/lib/supabase/server";
import { Users, Mail, CheckCircle2, MoreVertical, Play, Heart, ChevronLeft, ChevronRight, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data generator for the overview visual since we just need the layout looking perfect
export default async function DashboardOverviewPage() {
  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full">
      {/* Left Column (Main Content) */}
      <div className="flex-1 space-y-8">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 p-10 shadow-lg shadow-purple-900/20">
          {/* Abstract shapes for background */}
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-64 h-64 text-white transform rotate-12">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>

          <div className="relative z-10 max-w-lg space-y-4">
            <div className="text-purple-100 font-medium tracking-wider text-sm">
              AUTOMATED SYSTEM
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Streamline Birthdays with Professional Automated Cards
            </h1>
            <div className="pt-4">
              <Button className="bg-zinc-950 text-white hover:bg-zinc-900 rounded-full px-6 flex items-center gap-2 font-medium border-0">
                Manage Team
                <div className="bg-white text-zinc-950 rounded-full p-1 ml-2">
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Small Progress Pills (like the design's "2/8 watched" etc.) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pill 1 */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 shadow-sm">
            <div className="bg-purple-500/20 p-3 rounded-xl">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 flex justify-between">
                <span>145 / 200</span>
                <MoreVertical className="w-4 h-4" />
              </div>
              <div className="font-semibold text-zinc-200 mt-1">Active Members</div>
            </div>
          </div>

          {/* Pill 2 */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 shadow-sm">
            <div className="bg-pink-500/20 p-3 rounded-xl">
              <Mail className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 flex justify-between">
                <span>24 this month</span>
                <MoreVertical className="w-4 h-4" />
              </div>
              <div className="font-semibold text-zinc-200 mt-1">Cards Sent</div>
            </div>
          </div>

          {/* Pill 3 */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 shadow-sm">
            <div className="bg-emerald-500/20 p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 flex justify-between">
                <span>98% delivery rate</span>
                <MoreVertical className="w-4 h-4" />
              </div>
              <div className="font-semibold text-zinc-200 mt-1">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Upcoming Birthdays Section (Matching "Continue Watching") */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-100">Upcoming Birthdays</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-zinc-200 border border-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-purple-500 text-white shadow-lg shadow-purple-900/40 hover:bg-purple-600 transition-colors border border-purple-400/50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 group relative overflow-hidden">
              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop" className="object-cover w-full h-full brightness-75 group-hover:scale-105 transition-transform duration-500" alt="Sarah" />
                <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-500/90 text-white text-[10px] font-bold tracking-wider rounded-md uppercase backdrop-blur-md">
                  Tomorrow
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-semibold text-zinc-200 leading-tight">Sarah Jenkins</h3>
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">Head of Product Design, bringing creative vision strictly executed.</p>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="h-6 w-6 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
                  </Avatar>
                  <span className="text-xs text-zinc-400">Design Team</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 group relative overflow-hidden">
              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" className="object-cover w-full h-full brightness-75 group-hover:scale-105 transition-transform duration-500" alt="Michael" />
                <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500/90 text-white text-[10px] font-bold tracking-wider rounded-md uppercase backdrop-blur-md">
                  In 3 Days
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-semibold text-zinc-200 leading-tight">Michael Chen</h3>
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">Senior Frontend Engineer optimizing our web experience.</p>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="h-6 w-6 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=michael" />
                  </Avatar>
                  <span className="text-xs text-zinc-400">Engineering</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 group relative overflow-hidden hidden md:block">
              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop" className="object-cover w-full h-full brightness-75 group-hover:scale-105 transition-transform duration-500" alt="Elena" />
                <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500/90 text-white text-[10px] font-bold tracking-wider rounded-md uppercase backdrop-blur-md">
                  Next Week
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-semibold text-zinc-200 leading-tight">Elena Rodriguez</h3>
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">Marketing Lead and brand strategist for Q4 campaigns.</p>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="h-6 w-6 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=elena" />
                  </Avatar>
                  <span className="text-xs text-zinc-400">Marketing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members Table Section (Matching "Your Lesson") */}
        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-100">Recent Members</h2>
            <a href="/dashboard/members" className="text-purple-400 hover:text-purple-300 text-sm font-medium">See all</a>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-12 text-xs font-semibold text-zinc-500 tracking-wider mb-2 px-4 uppercase">
              <div className="col-span-5">Member</div>
              <div className="col-span-3">Department</div>
              <div className="col-span-3">Birthday</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {/* Row 1 */}
              <div className="grid grid-cols-12 items-center p-4 hover:bg-white/5 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=1" />
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Padhang Satrio</p>
                    <p className="text-xs text-zinc-500">2/16/2004</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    UI/UX DESIGN
                  </span>
                </div>
                <div className="col-span-3 text-sm text-zinc-400 truncate pr-4">
                  Software Engineer creating awesome interfaces
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 items-center p-4 hover:bg-white/5 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=2" />
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Leonardo Samsul</p>
                    <p className="text-xs text-zinc-500">8/22/1995</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    FRONT END
                  </span>
                </div>
                <div className="col-span-3 text-sm text-zinc-400 truncate pr-4">
                  React developer maintaining core infrastructure
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Statistic & Mentors) */}
      <div className="w-full xl:w-[320px] space-y-6">
        {/* Statistic Card */}
        <div className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-zinc-100">Statistic</h2>
            <MoreVertical className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {/* Custom Circle Progress Match from Design */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              {/* Outer progress ring */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="289" strokeDashoffset="196" strokeLinecap="round" />
              </svg>

              {/* Floating percentage badge */}
              <div className="absolute top-0 right-[-10px] px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full border-2 border-[#130b1c]">
                32%
              </div>

              <Avatar className="w-20 h-20 border-4 border-[#130b1c]">
                <AvatarImage src="https://i.pravatar.cc/150?u=admin_avatar" />
              </Avatar>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Good Morning Jason 🔥</h3>
            <p className="text-xs text-zinc-500 text-center px-4 mb-6 leading-relaxed">
              Continue your deliveries to achieve your month target!
            </p>

            {/* Bar Chart Mockup matching the design */}
            <div className="w-full bg-[#1c142c]/50 border border-purple-500/10 rounded-2xl pt-6 pb-4 px-4 relative mt-2">
              {/* Chart grid lines */}
              <div className="absolute inset-x-4 top-[20%] border-t border-dashed border-white/5" />
              <div className="absolute inset-x-4 top-[50%] border-t border-dashed border-white/5" />
              <div className="absolute inset-x-4 top-[80%] border-t border-dashed border-white/5" />

              <div className="absolute left-1 top-[10%] text-[8px] text-zinc-600">60</div>
              <div className="absolute left-1 top-[40%] text-[8px] text-zinc-600">40</div>
              <div className="absolute left-1 top-[70%] text-[8px] text-zinc-600">20</div>

              <div className="flex items-end justify-between h-20 px-4 z-10 relative">
                {/* Bars */}
                <div className="w-8 bg-purple-400/20 rounded-md h-[30%]" />
                <div className="w-8 bg-purple-500 rounded-md h-[50%]" />
                <div className="w-8 bg-purple-400/20 rounded-md h-[20%]" />
                <div className="w-8 bg-purple-500 rounded-md h-[90%] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                <div className="w-8 bg-purple-400/20 rounded-md h-[35%]" />
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-medium text-zinc-500 px-2 uppercase tracking-wider">
                <span>1-10 Aug</span>
                <span>11-20 Aug</span>
                <span>21-30 Aug</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Leaders / Your Mentors matching design */}
        <div className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-zinc-100">Team Leaders</h2>
            <button className="p-1 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5 border-dashed">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=mentor1" />
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-[#130b1c] rounded-full p-0.5 border border-white/10">
                    <div className="bg-zinc-200 rounded-full w-2.5 h-2.5 text-[8px] flex items-center justify-center text-zinc-900 font-bold">+</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Padhang Satrio</p>
                  <p className="text-xs text-zinc-500">Admin</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-full text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                <Users className="w-3 h-3" />
                Follow
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5 border-dashed">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=mentor2" />
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-[#130b1c] rounded-full p-0.5 border border-white/10">
                    <div className="bg-zinc-200 rounded-full w-2.5 h-2.5 text-[8px] flex items-center justify-center text-zinc-900 font-bold">+</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Zakir Horizontal</p>
                  <p className="text-xs text-zinc-500">Operations</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-full text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                <Users className="w-3 h-3" />
                Follow
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5 border-dashed">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src="https://i.pravatar.cc/150?u=mentor3" />
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-[#130b1c] rounded-full p-0.5 border border-white/10">
                    <div className="bg-zinc-200 rounded-full w-2.5 h-2.5 text-[8px] flex items-center justify-center text-zinc-900 font-bold">+</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Leonardo Samsul</p>
                  <p className="text-xs text-zinc-500">Manager</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-full text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                <Users className="w-3 h-3" />
                Follow
              </button>
            </div>
          </div>

          <Button className="w-full mt-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 font-medium rounded-xl h-12 transition-all">
            See All
          </Button>
        </div>
      </div>
    </div>
  );
}
