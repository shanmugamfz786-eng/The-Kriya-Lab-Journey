import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Calendar,
  Database,
  ArrowUpRight,
  Plus,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { fetchAllEvents, type EventItem } from "@/lib/events-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const futureEvents = events.filter((e) => e.event_type === "future");

  const stats = [
    {
      title: "TOTAL SEEKER ENQUIRIES",
      value: "1,428",
      change: "+22.5%",
      subText: "this month",
      icon: Users,
      iconColor: "text-[#334d84]",
      iconBg: "bg-[#334d84]/10",
      href: "/admin/users",
    },
    {
      title: "INITIATED STUDENTS",
      value: "842",
      change: "+12.1%",
      subText: "active sadhakas",
      icon: ShieldCheck,
      iconColor: "text-[#0ab39c]",
      iconBg: "bg-[#0ab39c]/10",
      href: "/admin/users",
    },
    {
      title: "UPCOMING WORKSHOPS",
      value: String(futureEvents.length || 2),
      change: "+8.3%",
      subText: "scheduled dikshas",
      icon: Calendar,
      iconColor: "text-[#f7b84b]",
      iconBg: "bg-[#f7b84b]/10",
      href: "/admin/events/future",
    },
    {
      title: "TIDB CLOUD DATABASE",
      value: "Connected",
      change: "SSL Active",
      subText: "24ms latency",
      icon: Database,
      iconColor: "text-[#299cdb]",
      iconBg: "bg-[#299cdb]/10",
      href: "/admin/settings",
    },
  ];

  const recentInquiries = [
    {
      id: "ENQ-1094",
      name: "Sathish Kumar",
      email: "sathish.k@gmail.com",
      program: "1st Kriya Online Initiation",
      date: "Today, 10:45 AM",
      status: "Pending Review",
    },
    {
      id: "ENQ-1093",
      name: "Ananya Iyer",
      email: "ananya.iyer@outlook.com",
      program: "Weekend Intensive Workshop",
      date: "Yesterday, 04:15 PM",
      status: "Approved",
    },
    {
      id: "ENQ-1092",
      name: "David Miller",
      email: "david.m@california.org",
      program: "Higher Kriya Mentorship",
      date: "Sep 16, 09:30 PM",
      status: "Approved",
    },
    {
      id: "ENQ-1091",
      name: "Meenakshi Sundaram",
      email: "meenakshi.s@tcs.com",
      program: "1st Kriya Online Initiation",
      date: "Sep 15, 02:10 PM",
      status: "Initiated",
    },
  ];

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif]">
        {/* Single Clean Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Welcome back to The Kriya Lab management console and live status monitor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/events/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#334d84] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] shadow-xs transition-colors"
            >
              <Plus className="size-3.5" />
              <span>Add Event</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link
                key={i}
                to={stat.href}
                className="group rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all hover:border-[#334d84]/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[0.72rem] font-semibold text-gray-500 tracking-wider">
                    {stat.title}
                  </p>
                  <div className={cn("rounded-lg p-2 transition-transform group-hover:scale-105", stat.iconBg)}>
                    <Icon className={cn("size-5", stat.iconColor)} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0ab39c]">
                      {stat.change}
                    </span>
                    <span className="text-gray-400 font-normal">
                      {stat.subText}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions & Recent Activity Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Seeker Enquiries Table (2 Cols) */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recent Seeker Enquiries</h3>
                <p className="text-xs text-gray-500">Latest applicants awaiting initiation approval</p>
              </div>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#334d84] hover:underline"
              >
                <span>View All</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#f8f9fa] text-[0.72rem] font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Ref ID</th>
                    <th className="p-3.5">Seeker Name</th>
                    <th className="p-3.5">Applied Program</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-normal">
                  {recentInquiries.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-semibold text-gray-700">{item.id}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[0.7rem] text-gray-400">{item.email}</p>
                      </td>
                      <td className="p-3.5 text-gray-700">{item.program}</td>
                      <td className="p-3.5 text-gray-500">{item.date}</td>
                      <td className="p-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[0.7rem] font-medium",
                            item.status === "Approved" && "bg-[#0ab39c]/10 text-[#0ab39c]",
                            item.status === "Pending Review" && "bg-[#f7b84b]/15 text-[#b7791f]",
                            item.status === "Initiated" && "bg-[#334d84]/10 text-[#334d84]",
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <Link
                          to="/admin/users"
                          className="text-xs font-semibold text-[#334d84] hover:text-[#2b4273]"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Shortcuts Box (1 Col) */}
          <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Admin Shortcuts</h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/events/add"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-[#334d84]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[#334d84]/10 p-2 text-[#334d84]">
                    <Plus className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Add New Event</p>
                    <p className="text-[0.68rem] text-gray-400">Post past or future diksha workshop</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-gray-400" />
              </Link>

              <Link
                to="/admin/events/future"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-[#334d84]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[#0ab39c]/10 p-2 text-[#0ab39c]">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">All Future Events</p>
                    <p className="text-[0.68rem] text-gray-400">Manage registrations & Google forms</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-gray-400" />
              </Link>

              <Link
                to="/admin/events/past"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-[#334d84]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-[#f7b84b]/10 p-2 text-[#f7b84b]">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">All Past Events</p>
                    <p className="text-[0.68rem] text-gray-400">View archived workshops & recordings</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-gray-400" />
              </Link>

              <Link
                to="/admin/programs"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-[#334d84]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-purple-500/10 p-2 text-purple-600">
                    <Layers className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Programs</p>
                    <p className="text-[0.68rem] text-gray-400">Curriculum & lineage initiation modules</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
