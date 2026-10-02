import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  PlayCircle,
  Award,
} from "lucide-react";
import { VelzonLayout } from "@/components/dashboard/VelzonLayout";
import { useAuth, getStoredUser } from "@/lib/auth-store";

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" }, replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f9] p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#3577f1] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-gray-500">Checking your sadhana session...</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "ACTIVE SEEKERS",
      value: "28,450",
      change: "+16.24%",
      isPositive: true,
      subText: "vs last month",
      icon: Users,
      iconColor: "text-[#3577f1]",
      iconBg: "bg-[#3577f1]/10",
    },
    {
      title: "SADHANA SESSIONS",
      value: "97,660",
      change: "+3.96%",
      isPositive: true,
      subText: "total breath rounds completed",
      icon: Activity,
      iconColor: "text-[#0ab39c]",
      iconBg: "bg-[#0ab39c]/10",
    },
    {
      title: "AVG. PRACTICE DURATION",
      value: "42m 15s",
      change: "+8.4%",
      isPositive: true,
      subText: "per daily meditation",
      icon: Clock,
      iconColor: "text-[#f7b84b]",
      iconBg: "bg-[#f7b84b]/10",
    },
    {
      title: "KRIYA COMPLETION RATE",
      value: "89.4%",
      change: "+2.1%",
      isPositive: true,
      subText: "graduated 1st Kriya",
      icon: Award,
      iconColor: "text-[#299cdb]",
      iconBg: "bg-[#299cdb]/10",
    },
  ];

  const countryData = [
    { country: "India (Tamil Nadu, Karnataka)", seekers: "18,420", percentage: 65, flag: "🇮🇳" },
    { country: "United States (California, Texas)", seekers: "4,890", percentage: 17, flag: "🇺🇸" },
    { country: "United Kingdom (London)", seekers: "2,130", percentage: 8, flag: "🇬🇧" },
    { country: "Singapore & Malaysia", seekers: "1,450", percentage: 5, flag: "🇸🇬" },
    { country: "United Arab Emirates (Dubai)", seekers: "980", percentage: 3, flag: "🇦🇪" },
    { country: "Germany & Europe", seekers: "580", percentage: 2, flag: "🇩🇪" },
  ];

  const recentSessions = [
    {
      title: "1st Kriya Pranayama Fundamentals",
      type: "Initiation Course",
      time: "Today, 06:00 AM",
      status: "Completed",
      duration: "45 Mins",
    },
    {
      title: "Mahamudra & Spine Alignment Practice",
      type: "Guided Sadhana",
      time: "Yesterday, 07:30 PM",
      status: "Completed",
      duration: "30 Mins",
    },
    {
      title: "Jyoti Mudra - Inner Light Meditation",
      type: "Advanced Module",
      time: "Sep 16, 06:00 AM",
      status: "Completed",
      duration: "40 Mins",
    },
    {
      title: "Live Satsang with the Teacher",
      type: "Live Transmission",
      time: "Upcoming Saturday",
      status: "Scheduled",
      duration: "90 Mins",
    },
  ];

  return (
    <VelzonLayout
      title="Sadhaka Analytics & Overview"
      subtitle={`Welcome back, ${user?.full_name || "Sadhaka"}! Track your meditation milestones & portal activity.`}
    >
      <div className="space-y-6">
        {/* Metric Cards Grid (Velzon 4-Column Layout) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-md border border-[#e9ebec] bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-bold tracking-wider text-gray-500 uppercase">
                    {m.title}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md ${m.iconBg}`}>
                    <Icon className={`size-5 ${m.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-gray-800">{m.value}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span
                      className={`inline-flex items-center font-semibold ${
                        m.isPositive ? "text-[#0ab39c]" : "text-[#f06548]"
                      }`}
                    >
                      {m.isPositive ? (
                        <TrendingUp className="mr-0.5 size-3" />
                      ) : (
                        <TrendingDown className="mr-0.5 size-3" />
                      )}
                      {m.change}
                    </span>
                    <span className="text-gray-400">{m.subText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Section: Country Analytics + Upgrade/Live Card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Audiences Sessions by Country (8 cols) */}
          <div className="rounded-md border border-[#e9ebec] bg-white p-5 shadow-xs lg:col-span-8">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                  Audiences & Seekers by Region
                </h4>
                <p className="text-[0.7rem] text-gray-400">
                  Global disciples practicing authentic Kriya Yoga sadhana
                </p>
              </div>
              <span className="rounded bg-[#3577f1]/10 px-2 py-1 text-[0.68rem] font-semibold text-[#3577f1]">
                Global Reach
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left: Map summary visual card */}
              <div className="flex flex-col justify-between rounded-lg bg-[#f3f3f9] p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="size-5 text-[#3577f1]" />
                    <span className="text-xs font-bold text-gray-700">
                      Worldwide Network
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Over 28,000+ initiated practitioners across 24 countries connected through daily breath transmission.
                  </p>
                </div>
                <div className="mt-4 rounded-md border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Total Live Centers:</span>
                    <span className="font-bold text-gray-800">12 Centers</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Upcoming Satsang:</span>
                    <span className="font-bold text-[#0ab39c]">Live This Sunday</span>
                  </div>
                </div>
              </div>

              {/* Right: Country Progress list */}
              <div className="space-y-3">
                {countryData.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span>{c.flag}</span>
                        <span>{c.country}</span>
                      </span>
                      <span className="font-bold text-gray-800">{c.seekers}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#3577f1]"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: Velzon Upgrade Banner Style (4 cols) */}
          <div className="rounded-md border border-[#e9ebec] bg-gradient-to-br from-[#405189] via-[#3577f1] to-[#299cdb] p-6 text-white shadow-xs lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="size-4 text-[#f7b84b]" />
                </span>
                <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                  Advanced Sadhana
                </span>
              </div>
              <h4 className="mt-4 text-xl font-bold font-serif leading-snug">
                Deepen Your 2nd & 3rd Kriya Initiation
              </h4>
              <p className="mt-2 text-xs text-white/80 leading-relaxed font-light">
                Unlock higher spiritual transmissions, advanced Thokar kriyas, and personal guidance directly with the master.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="size-4 text-[#0ab39c]" />
                <span>One-on-one Sadhana Q&A</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="size-4 text-[#0ab39c]" />
                <span>Secret Siddha Pranayama Notes</span>
              </div>
              <Link
                to="/programs"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-xs font-bold text-[#405189] shadow-md hover:bg-gray-100 transition-colors"
              >
                <span>Explore Advanced Programs</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Lower Section: Device Breakdown + Recent Practice History */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* User Devices Breakdown (4 cols) */}
          <div className="rounded-md border border-[#e9ebec] bg-white p-5 shadow-xs lg:col-span-4">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-sm font-bold text-gray-800">Practice Devices</h4>
              <span className="text-[0.7rem] text-gray-400">Past 30 days</span>
            </div>

            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#3577f1]/10 text-[#3577f1]">
                    <Smartphone className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Mobile Meditation App</p>
                    <p className="text-[0.65rem] text-gray-400">18,520 Sessions</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-800">65.2%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#0ab39c]/10 text-[#0ab39c]">
                    <Laptop className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Desktop Portal / Web</p>
                    <p className="text-[0.65rem] text-gray-400">7,960 Sessions</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-800">28.0%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#f7b84b]/10 text-[#f7b84b]">
                    <Tablet className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Tablet / Pad</p>
                    <p className="text-[0.65rem] text-gray-400">1,970 Sessions</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-800">6.8%</span>
              </div>
            </div>
          </div>

          {/* Recent Sessions Table (8 cols) */}
          <div className="rounded-md border border-[#e9ebec] bg-white p-5 shadow-xs lg:col-span-8">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                  Recent Sadhana & Practice Log
                </h4>
                <p className="text-[0.7rem] text-gray-400">Your personal meditation log</p>
              </div>
              <Link
                to="/my-programs"
                className="text-xs font-semibold text-[#3577f1] hover:underline"
              >
                View Full Log &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#f3f3f9] text-[#878a99]">
                    <th className="py-2.5 px-3 font-semibold">MODULE / PRACTICE</th>
                    <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                    <th className="py-2.5 px-3 font-semibold">DATE & TIME</th>
                    <th className="py-2.5 px-3 font-semibold">DURATION</th>
                    <th className="py-2.5 px-3 font-semibold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentSessions.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-medium flex items-center gap-2">
                        <PlayCircle className="size-3.5 text-[#3577f1]" />
                        <span>{row.title}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{row.type}</td>
                      <td className="py-3 px-3 text-gray-500">{row.time}</td>
                      <td className="py-3 px-3 font-semibold text-gray-700">{row.duration}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[0.65rem] font-semibold ${
                            row.status === "Completed"
                              ? "bg-[#0ab39c]/15 text-[#0ab39c]"
                              : "bg-[#3577f1]/15 text-[#3577f1]"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </VelzonLayout>
  );
}

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const user = getStoredUser();
      if (!user) {
        throw redirect({
          to: "/auth",
          search: { redirect: "/dashboard" },
        });
      }
    }
  },
  component: DashboardPage,
});

