import { createClient } from "@/lib/supabase/server";
import { Users, Mail, CheckCircle2, MoreVertical, Play, Heart, ChevronLeft, ChevronRight, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DeliveryChart } from "@/components/dashboard/delivery-chart";

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getUserOrg() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Dashboard org fetch error:", error);
    redirect("/onboarding");
  }
  return { org: data, user };
}

// Mock data generator for the overview visual since we just need the layout looking perfect
export default async function DashboardOverviewPage() {
  const { org, user } = await getUserOrg();
  const userName = user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name || user.email || 'Admin';

  // Calculate greeting based on org timezone (default to UTC if not set)
  const timeZone = org.timezone || 'UTC';
  const hour = parseInt(new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: timeZone
  }).format(new Date()), 10);

  // Check for upcoming birthdays
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const supabase = await createClient();
  const [
    { count: membersCount },
    { count: cardsSent },
    { data: allMembers },
    { data: recentMembers },
    { data: recentDeliveries }
  ] = await Promise.all([
    supabase.from("members").select('*', { count: 'exact', head: true }).eq("org_id", org.id),
    supabase.from("delivery_logs").select('*', { count: 'exact', head: true }).eq("org_id", org.id).eq("status", "sent"),
    supabase.from("members").select("birth_month, birth_day").eq("org_id", org.id),
    supabase.from("members").select("id, full_name, email, department, role_title, birth_month, birth_day, created_at").eq("org_id", org.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("delivery_logs").select("id, sent_at").eq("org_id", org.id).eq("status", "sent").order("sent_at", { ascending: false }).limit(100)
  ]);

  let upcomingCount = 0;
  if (allMembers) {
    allMembers.forEach((member: any) => {
      if (member.birth_month && member.birth_day) {
        // Try current year
        let bday = new Date(today.getFullYear(), member.birth_month - 1, member.birth_day);

        // If it already passed this year, look at next year
        if (bday < today) {
          bday = new Date(today.getFullYear() + 1, member.birth_month - 1, member.birth_day);
        }

        if (bday >= today && bday <= thirtyDaysFromNow) {
          upcomingCount++;
        }
      }
    });
  }

  // Active templates mock
  const activeTemplates = 1;

  // Generate basic chart data dynamically based on current month
  const currentMonthDate = new Date();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'short' });
  const chartData = [
    { name: `1-10 ${monthName}`, deliveries: 0 },
    { name: `11-20 ${monthName}`, deliveries: 0 },
    { name: `21-31 ${monthName}`, deliveries: 0 },
  ];

  if (recentDeliveries) {
    recentDeliveries.forEach((log: any) => {
      if (log.sent_at) {
        const d = new Date(log.sent_at);
        if (d.getMonth() === currentMonthDate.getMonth() && d.getFullYear() === currentMonthDate.getFullYear()) {
          if (d.getDate() <= 10) chartData[0].deliveries++;
          else if (d.getDate() <= 20) chartData[1].deliveries++;
          else chartData[2].deliveries++;
        }
      }
    });
  }

  // Find Team Leaders (Admin or Manager roles, or fallback to the oldest members)
  let teamLeaders: any[] = [];
  if (recentMembers && recentMembers.length > 0) {
    teamLeaders = recentMembers.filter((m: any) => m.role_title?.toLowerCase().includes("admin") || m.role_title?.toLowerCase().includes("manager")).slice(0, 3);
    if (teamLeaders.length === 0) {
      teamLeaders = [...recentMembers].reverse().slice(0, 3); // Fallback to oldest members
    }
  }

  let greeting = 'Good Evening';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good Afternoon';
  }

  // Calculate percentage of members with upcoming birthdays for the progress ring
  const totalMembers = membersCount || 1; // avoid division by zero
  const upcomingPercentage = Math.round((upcomingCount / totalMembers) * 100);
  // SVG circle math: circumference = 2 * Math.PI * r (where r=46) ≈ 289
  // strokeDashoffset = circumference - (percentage / 100) * circumference
  const circumference = 289;
  const dashOffset = circumference - (upcomingPercentage / 100) * circumference;

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
            <div className="text-purple-100 font-bold tracking-wider text-sm uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {org.name} WORKSPACE
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

        {/* Small Progress Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pill 1 */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 shadow-sm">
            <div className="bg-purple-500/20 p-3 rounded-xl">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 flex justify-between">
                <span>{membersCount || 0} Total</span>
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
                <span>{cardsSent || 0} Deliveries</span>
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
                <span>{upcomingCount} Upcoming</span>
                <MoreVertical className="w-4 h-4" />
              </div>
              <div className="font-semibold text-zinc-200 mt-1">Next 30 Days</div>
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
                    <AvatarFallback className="bg-purple-900 text-purple-200 text-[10px]">SJ</AvatarFallback>
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
                    <AvatarFallback className="bg-emerald-900 text-emerald-200 text-[10px]">MC</AvatarFallback>
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
                    <AvatarFallback className="bg-blue-900 text-blue-200 text-[10px]">ER</AvatarFallback>
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
              <div className="col-span-12 md:col-span-5">Member</div>
              <div className="hidden md:block col-span-3">Department</div>
              <div className="hidden md:block col-span-3">Birthday</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {!recentMembers || recentMembers.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">No members added yet.</div>
              ) : (
                recentMembers.map((member: any) => {
                  const initials = member.full_name
                    ? member.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : member.email?.substring(0, 2).toUpperCase() || 'U';

                  return (
                    <div key={member.id} className="grid grid-cols-12 items-center p-4 hover:bg-white/5 transition-colors">
                      <div className="col-span-11 md:col-span-5 flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarFallback className="bg-purple-900 text-purple-200">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200 truncate pr-2 max-w-[120px] md:max-w-[180px]">{member.full_name || member.email}</p>
                          <p className="text-xs text-zinc-500 truncate">{member.role_title || "Member"}</p>
                        </div>
                      </div>
                      <div className="hidden md:block col-span-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                          {member.department || "General"}
                        </span>
                      </div>
                      <div className="hidden md:block col-span-3 text-sm text-zinc-400 truncate pr-4">
                        {member.birth_month && member.birth_day ? `${member.birth_month}/${member.birth_day}` : "Not set"}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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
                <circle cx="50" cy="50" r="46" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="289" strokeDashoffset={dashOffset} strokeLinecap="round" />
              </svg>

              {/* Floating percentage badge */}
              <div className="absolute top-0 right-[-10px] px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full border-2 border-[#130b1c]">
                {upcomingPercentage}%
              </div>

              <Avatar className="w-20 h-20 border-4 border-[#130b1c]">
                <AvatarFallback className="bg-purple-900 text-purple-200 text-2xl">
                  {userName ? userName[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{greeting}, {userName.split(' ')[0]} 👋</h3>
            <p className="text-xs text-zinc-500 text-center px-4 mb-6 leading-relaxed">
              Continue your deliveries to achieve your month target!
            </p>

            {/* Bar Chart Real Data implementation */}
            <div className="w-full bg-[#1c142c]/50 border border-purple-500/10 rounded-2xl pt-6 pb-2 px-4 relative mt-2 h-40">
              <DeliveryChart data={chartData} />
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
            {!teamLeaders || teamLeaders.length === 0 ? (
              <div className="py-4 text-center text-zinc-500 text-sm">No leaders assigned.</div>
            ) : (
              teamLeaders.map((leader: any) => {
                const initials = leader.full_name
                  ? leader.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                  : leader.email?.substring(0, 2).toUpperCase() || 'U';

                return (
                  <div key={leader.id} className="flex items-center justify-between py-2 border-b border-white/5 border-dashed last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarFallback className="bg-purple-900 text-purple-200">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-[#130b1c] rounded-full p-0.5 border border-white/10">
                          <div className="bg-zinc-200 rounded-full w-2.5 h-2.5 text-[8px] flex items-center justify-center text-zinc-900 font-bold">+</div>
                        </div>
                      </div>
                      <div className="truncate max-w-[120px]">
                        <p className="text-sm font-semibold text-zinc-200 truncate">{leader.full_name || leader.email?.split('@')[0]}</p>
                        <p className="text-xs text-zinc-500 truncate">{leader.role_title || "Manager"}</p>
                      </div>
                    </div>
                    <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-full text-[10px] font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                      <Users className="w-3 h-3" />
                      Follow
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <Button className="w-full mt-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 font-medium rounded-xl h-12 transition-all">
            See All
          </Button>
        </div>
      </div>
    </div>
  );
}
