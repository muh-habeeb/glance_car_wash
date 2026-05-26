"use client";

import { useSession, signOut } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LogOut,
  Calendar,
  Sparkles,
  Car,
  Clock,
  Plus,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Import our newly extracted Profile Settings Sidebar Drawer Component
import { ProfileDrawer } from "./_components/ProfileDrawer";

// Import Boneyard-js skeleton loading component
import { Skeleton } from "boneyard-js/react";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default function Dashboard() {
  const { data: sessionData, isPending, refetch } = useSession();
  const router = useRouter();

  // Navigation and UI state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger a brief simulated skeleton loading delay for testing premium Boneyard loadings
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPending && !sessionData) {
      router.push("/login");
    }
  }, [sessionData, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black text-slate-800 dark:text-white p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-glanz-gold/20 border-t-glanz-gold rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-cream/60 text-sm animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) return null;

  const user = sessionData.user as any;
  const isGoogle = user.image?.includes("googleusercontent.com");
  const isFacebook = user.image?.includes("facebook.com") || user.image?.includes("platform-lookaside");

  // Mock Bookings Data
  const dummyBookings = [
    { id: "BKG-9082", vehicle: "Tesla Model S (Black)", package: "Ceramic Glaze Wash", date: "May 27, 2026 - 10:30 AM", price: "$49.00", status: "In Progress" },
    { id: "BKG-8711", vehicle: "Porsche 911 (Silver)", package: "Glanz Signature Detail", date: "May 25, 2026 - 02:00 PM", price: "$120.00", status: "Completed" },
    { id: "BKG-8540", vehicle: "BMW M4 (Gold)", package: "Exterior Polish & Wax", date: "May 20, 2026 - 09:00 AM", price: "$75.00", status: "Completed" },
    { id: "BKG-8109", vehicle: "Mercedes C63 (White)", package: "Express Interior Wash", date: "May 18, 2026 - 11:15 AM", price: "$35.00", status: "Completed" },
    { id: "BKG-7988", vehicle: "Audi RS6 (Gray)", package: "Ceramic Wash & Interior Detail", date: "May 12, 2026 - 04:30 PM", price: "$85.00", status: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-glanz-black text-slate-800 dark:text-white flex flex-col justify-start relative overflow-hidden transition-colors duration-300">
      {/* Soft Premium Glow */}
      <div className="absolute top-[-10%] left-[-0%] w-[600px] h-[600px] rounded-full bg-glanz-gold/20 dark:bg-glanz-gold/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-50%] right-[-0%] w-[600px] h-[600px] rounded-full bg-deep-bronze/20 dark:bg-deep-bronze/10 blur-[120px] pointer-events-none" />

      {/* ── Dashboard Navigation Bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-glanz-black/60 border-b border-slate-200 dark:border-charcoal/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsProfileOpen(false)}>
            <div className="w-9 h-9 relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/assets/logo/gold_logo_no_text.png"
                alt="Glanz Gold Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-lg tracking-wide bg-linear-to-r from-deep-bronze to-cream bg-clip-text text-transparent group-hover:to-glanz-gold transition-all">
              GLANZ - PREMIUM   <span className="text-glanz-gold font-light"> CAR WASH </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => signOut().then(() => router.push("/login"))}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-slate-200 dark:border-charcoal text-slate-700 dark:text-cream hover:bg-slate-100 dark:hover:bg-charcoal/50 text-xs px-4"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Log Out
            </Button>

            <ModeToggle />

            {/* Avatar Trigger for Profile Side Panel */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-glanz-gold/50 cursor-pointer overflow-visible shrink-0 transition-transform hover:scale-105"
            >
              {!imageError && user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  width={38}
                  height={38}
                  onError={() => setImageError(true)}
                  className="w-9.5 h-9.5 rounded-full object-cover border border-slate-200 dark:border-glanz-gold/40"
                />
              ) : (
                <div className="w-9.5 h-9.5 rounded-full bg-gradient-to-br from-glanz-gold to-deep-bronze flex items-center justify-center text-sm font-bold text-glanz-black uppercase border border-slate-200 dark:border-glanz-gold/40 shadow-md shadow-glanz-gold/10">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-white dark:border-glanz-black rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Bookings Grid View ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">

        {/* ── Hero Metrics Panel wrapped in Boneyard Skeleton loading container ── */}
        <Skeleton name="dashboard-metrics" loading={isLoading}>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border border-slate-200 dark:border-charcoal bg-slate-50/50 dark:bg-glanz-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-glanz-gold/10 border border-glanz-gold/20 flex items-center justify-center text-glanz-gold shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-cream/40 uppercase tracking-wider block font-bold">Total Services</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">12 Bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-charcoal bg-slate-50/50 dark:bg-glanz-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-cream/40 uppercase tracking-wider block font-bold">Active Wash</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">1 In Progress</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-charcoal bg-slate-50/50 dark:bg-glanz-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-cream/40 uppercase tracking-wider block font-bold">Loyalty Level</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    450 Pts
                    <span className="text-xs font-bold uppercase px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Gold</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </Skeleton>

        {/* ── Table of Bookings ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-left">
              <h2 className="text-xl font-extrabold tracking-wide text-slate-800 dark:text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-glanz-gold" />
                Service Bookings
              </h2>
              <p className="text-slate-500 dark:text-cream/55 text-xs">Track and manage your upcoming and completed auto washes.</p>
            </div>

            <Button className="bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold shadow-md shadow-glanz-gold/15 rounded-xl text-xs py-2 px-4.5 self-start sm:self-auto flex items-center gap-1.5 active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Book New Wash
            </Button>
          </div>

          <Skeleton name="dashboard-table" loading={isLoading}>
            <Card className="border border-slate-200 dark:border-charcoal bg-white dark:bg-glanz-black/50 shadow-xl overflow-hidden rounded-xl">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-transparent">
                  <TableRow className="border-b border-slate-100 dark:border-charcoal/40">
                    <TableHead className="w-[120px] py-4 px-6 text-slate-500 dark:text-midgray font-bold">Booking ID</TableHead>
                    <TableHead className="py-4 px-6 text-slate-500 dark:text-midgray font-bold">Vehicle</TableHead>
                    <TableHead className="py-4 px-6 text-slate-500 dark:text-midgray font-bold">Wash Package</TableHead>
                    <TableHead className="py-4 px-6 text-slate-500 dark:text-midgray font-bold">Date & Time</TableHead>
                    <TableHead className="py-4 px-6 text-slate-500 dark:text-midgray font-bold">Price</TableHead>
                    <TableHead className="py-4 px-6 text-right text-slate-500 dark:text-midgray font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyBookings.map((bkg) => (
                    <TableRow key={bkg.id} className="border-b border-slate-100 dark:border-charcoal/30 hover:bg-slate-50/50 dark:hover:bg-charcoal/10 transition-colors">
                      <TableCell className="py-4.5 px-6 font-mono text-xs font-bold text-glanz-gold">{bkg.id}</TableCell>
                      <TableCell className="py-4.5 px-6 font-semibold text-slate-800 dark:text-white">{bkg.vehicle}</TableCell>
                      <TableCell className="py-4.5 px-6 text-xs font-medium text-slate-700 dark:text-cream">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-glanz-gold/50" />
                          {bkg.package}
                        </div>
                      </TableCell>
                      <TableCell className="py-4.5 px-6 text-xs text-slate-500 dark:text-cream/65">{bkg.date}</TableCell>
                      <TableCell className="py-4.5 px-6 font-semibold text-slate-800 dark:text-white">{bkg.price}</TableCell>
                      <TableCell className="py-4.5 px-6 text-right align-middle">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${bkg.status === "In Progress"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse"
                          : bkg.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bkg.status === "In Progress"
                            ? "bg-amber-400"
                            : bkg.status === "Completed"
                              ? "bg-emerald-400"
                              : "bg-rose-500"
                            }`} />
                          {bkg.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Pagination Controls */}
            <div className="pt-4 flex justify-center w-full">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (activePage > 1) setActivePage(p => p - 1); }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={activePage === 1}
                      onClick={(e) => { e.preventDefault(); setActivePage(1); }}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={activePage === 2}
                      onClick={(e) => { e.preventDefault(); setActivePage(2); }}
                    >
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={activePage === 3}
                      onClick={(e) => { e.preventDefault(); setActivePage(3); }}
                    >
                      3
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (activePage < 3) setActivePage(p => p + 1); }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Skeleton>
        </section>
      </main>

      {/* ── Slide Drawer / Sheet (Responsive Custom Profile Panel) ── */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        refetch={refetch}
      />
    </div>
  );
}