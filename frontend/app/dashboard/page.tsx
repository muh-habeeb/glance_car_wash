"use client";

import { useSession, signOut } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  LogOut,
  Calendar,
  Sparkles,
  Car,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProfileDrawer } from "./_components/ProfileDrawer";
import { BookingModal } from "./_components/BookingModal";
import { Skeleton } from "boneyard-js/react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { env } from "@/utils/env";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED";

interface Booking {
  id: string;
  status: BookingStatus;
  amountPaid: string | null;
  createdAt: string;
  service: { name: string; category: string; shortDescription: string };
  slot: { date: string };
  place: { name: string };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string; pulse?: boolean }> = {
  PENDING_PAYMENT: { label: "Pending Payment", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", pulse: true },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  ONGOING: { label: "Ongoing", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", pulse: true },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING_PAYMENT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${cfg.pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

// ─── Smart Pagination ─────────────────────────────────────────────────────────

function SmartPagination({
  meta,
  onPageChange,
}: {
  meta: Meta;
  onPageChange: (p: number) => void;
}) {
  const { page, totalPages } = meta;
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="px-2 text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page
              ? "bg-glanz-gold text-glanz-black"
              : "hover:bg-slate-100 dark:hover:bg-charcoal/40 text-slate-600 dark:text-cream/60"
              }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: sessionData, isPending, refetch } = useSession();
  const router = useRouter();

  // Role-based cross-app redirection
  useEffect(() => {
    if (!isPending && sessionData?.user) {
      // @ts-expect-error role exists
      const role = sessionData.user.role;
      if (role === "STAFF") {
        window.location.href = env.NEXT_PUBLIC_STAFF_DASHBOARD_URL;
      } else if (role === "ADMIN" || role === "SUPERADMIN") {
        window.location.href = env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;
      }
    }
  }, [sessionData, isPending]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "amountPaid">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // User profile (full, with phone/whatsapp)
  const [userProfile, setUserProfile] = useState<{ phone?: string | null; whatsapp?: string | null }>({});

  const fetchBookings = useCallback(async () => {
    if (!sessionData?.user) return;
    setBookingsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
        sortOrder,
      });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(
        `${env.NEXT_PUBLIC_SERVER_URL}/api/bookings?${params.toString()}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
        setMeta(data.meta);
      }
    } catch {
      // silent fail
    } finally {
      setBookingsLoading(false);
    }
  }, [sessionData?.user, page, statusFilter, sortBy, sortOrder]);

  // Initial load and polling (every 10s)
  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Skeleton delay
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Load full profile for pre-filling BookingModal
  useEffect(() => {
    if (!sessionData?.user) return;
    fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/users/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUserProfile(d.user); })
      .catch(() => {});
  }, [sessionData?.user]);

  // URL param toasts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      toast.success("Account verified successfully!", { description: "Your email address has been confirmed." });
      window.history.replaceState({}, "", "/dashboard");
    } else if (params.get("error")) {
      toast.error("Verification failed", { description: decodeURIComponent(params.get("error")!) });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    if (!isPending && !sessionData) router.push("/login");
  }, [sessionData, isPending, router]);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await signOut();
      toast.success("Successfully logged out", { id: toastId });
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.", { id: toastId });
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-glanz-gold/20 border-t-glanz-gold rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-cream/60 text-sm animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }
  if (!sessionData) return null;

  const user = sessionData.user as any;

  // Derived metrics
  const totalBookings = meta.total;
  const activeBookings = bookings.filter((b) => b.status === "ONGOING").length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;

  const toggleSort = (col: "createdAt" | "amountPaid") => {
    if (sortBy === col) setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortOrder("desc"); }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-glanz-black text-slate-800 dark:text-white flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-0 w-[600px] h-[600px] rounded-full bg-glanz-gold/20 dark:bg-glanz-gold/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-50%] right-0 w-[600px] h-[600px] rounded-full bg-deep-bronze/20 dark:bg-deep-bronze/10 blur-[120px] pointer-events-none" />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-glanz-black/60 border-b border-slate-200 dark:border-charcoal/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsProfileOpen(false)}>
            <div className="w-9 h-9 relative">
              <Image src="/assets/logo/gold_logo_no_text.png" alt="Glanz" width={36} height={36} className="object-contain" priority />
            </div>
            <span className="font-extrabold text-lg tracking-wide bg-linear-to-r from-deep-bronze to-cream bg-clip-text text-transparent">
              GLANZ — <span className="text-glanz-gold font-light">PREMIUM CAR WASH</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-slate-200 dark:border-charcoal text-slate-700 dark:text-cream hover:bg-slate-100 dark:hover:bg-charcoal/50 text-xs px-4"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Log Out
            </Button>
            <ModeToggle />
            <button
              onClick={() => setIsProfileOpen(true)}
              className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-glanz-gold/50 hover:scale-105 transition-transform overflow-visible shrink-0"
            >
              {!imageError && user?.image ? (
                <Image src={user.image} alt={user.name || "Avatar"} width={38} height={38} onError={() => setImageError(true)} className="w-9.5 h-9.5 rounded-full object-cover border border-glanz-gold/40" />
              ) : (
                <div className="w-9.5 h-9.5 rounded-full bg-linear-to-br from-glanz-gold to-deep-bronze flex items-center justify-center text-sm font-bold text-glanz-black uppercase border border-glanz-gold/40 shadow-md shadow-glanz-gold/10">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-glanz-black rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">

        {/* ── Metric Cards ── */}
        <Skeleton name="dashboard-metrics" loading={isLoading}>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border border-slate-200 dark:border-charcoal bg-slate-50/50 dark:bg-glanz-black/60 shadow-sm backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-glanz-gold/10 border border-glanz-gold/20 flex items-center justify-center text-glanz-gold shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-cream/40 uppercase tracking-wider block font-bold">Total Bookings</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{totalBookings}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-charcoal bg-slate-50/50 dark:bg-glanz-black/60 shadow-sm backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-cream/40 uppercase tracking-wider block font-bold">Ongoing</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{activeBookings}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-charcoal bg-slate-50/50 dark:bg-glanz-black/60 shadow-sm backdrop-blur-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-cream/40 uppercase tracking-wider block font-bold">Confirmed</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{confirmedBookings}</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </Skeleton>

        {/* ── Bookings Table ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
                <Car className="w-5 h-5 text-glanz-gold" />
                My Bookings
              </h2>
              <p className="text-slate-500 dark:text-cream/55 text-xs">Track your upcoming and completed auto service bookings.</p>
            </div>
            <Button
              onClick={() => setIsBookingOpen(true)}
              className="bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold shadow-md shadow-glanz-gold/15 rounded-xl text-xs py-2 px-4 self-start sm:self-auto flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Book New Service
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}
            >
              <SelectTrigger className="w-44 text-xs h-9 border-slate-200 dark:border-charcoal">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Skeleton name="dashboard-table" loading={isLoading}>
            {!bookingsLoading && bookings.length === 0 ? (
              // ── Empty State ──
              <div className="flex flex-col items-center justify-center py-20 space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-glanz-gold/10 border border-glanz-gold/20 flex items-center justify-center">
                  <Inbox className="w-9 h-9 text-glanz-gold" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">No bookings yet</h3>
                  <p className="text-sm text-slate-500 dark:text-cream/50">
                    {statusFilter !== "ALL"
                      ? "No bookings match this filter."
                      : "You haven't made any bookings. Book your first premium car service now!"}
                  </p>
                </div>
                {statusFilter === "ALL" && (
                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    className="bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold rounded-xl px-6 shadow-md shadow-glanz-gold/15 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Book Your First Service
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Card className="border border-slate-200 dark:border-charcoal bg-white dark:bg-glanz-black/50 shadow-xl overflow-hidden rounded-xl">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-transparent">
                      <TableRow className="border-b border-slate-100 dark:border-charcoal/40">
                        <TableHead className="py-4 px-4 text-slate-500 dark:text-midgray font-bold text-xs w-[100px]">ID</TableHead>
                        <TableHead className="py-4 px-4 text-slate-500 dark:text-midgray font-bold text-xs">Service</TableHead>
                        <TableHead className="py-4 px-4 text-slate-500 dark:text-midgray font-bold text-xs">Location</TableHead>
                        <TableHead
                          className="py-4 px-4 text-slate-500 dark:text-midgray font-bold text-xs cursor-pointer hover:text-glanz-gold select-none"
                          onClick={() => toggleSort("createdAt")}
                        >
                          Date {sortBy === "createdAt" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                        </TableHead>
                        <TableHead
                          className="py-4 px-4 text-slate-500 dark:text-midgray font-bold text-xs cursor-pointer hover:text-glanz-gold select-none"
                          onClick={() => toggleSort("amountPaid")}
                        >
                          Amount {sortBy === "amountPaid" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                        </TableHead>
                        <TableHead className="py-4 px-4 text-right text-slate-500 dark:text-midgray font-bold text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingsLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="border-b border-slate-100 dark:border-charcoal/30">
                            <TableCell className="py-4 px-4" colSpan={6}>
                              <div className="h-5 rounded bg-slate-100 dark:bg-charcoal/30 animate-pulse" />
                            </TableCell>
                          </TableRow>
                        ))
                        : bookings.map((bkg) => (
                          <TableRow key={bkg.id} className="border-b border-slate-100 dark:border-charcoal/30 hover:bg-slate-50/50 dark:hover:bg-charcoal/10 transition-colors">
                            <TableCell className="py-4 px-4 font-mono text-xs font-bold text-glanz-gold">
                              {bkg.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <p className="font-semibold text-sm text-slate-800 dark:text-white">{bkg.service.name}</p>
                              <p className="text-xs text-slate-400 dark:text-cream/40">{bkg.service.shortDescription}</p>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-xs text-slate-600 dark:text-cream/70">{bkg.place.name}</TableCell>
                            <TableCell className="py-4 px-4 text-xs text-slate-500 dark:text-cream/60">
                              {format(new Date(bkg.slot.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="py-4 px-4 font-semibold text-sm">
                              {bkg.amountPaid ? `AED ${Number(bkg.amountPaid).toFixed(2)}` : "—"}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-right">
                              <StatusBadge status={bkg.status} />
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </Card>

                <SmartPagination meta={meta} onPageChange={(p) => setPage(p)} />
              </>
            )}
          </Skeleton>
        </section>
      </main>

      {/* ── Profile Drawer ── */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        refetch={refetch}
      />

      {/* ── Booking Modal ── */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        user={user}
        userProfile={userProfile}
        onSuccess={() => {
          setIsBookingOpen(false);
          setTimeout(fetchBookings, 1000);
        }}
      />
    </div>
  );
}