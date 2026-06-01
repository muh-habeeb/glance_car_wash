"use client";

/**
 * Copyright © GLANZ
 * BookingModal — 3-step booking flow: Choose Service → Slot & Details → Payment
 */

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { env } from "@/utils/env";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/PhoneInput";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Car,
  Droplets,
  Film,
  Wrench,
  ShoppingBag,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";

const stripePromise = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;


// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceCategory = "CAR_WASH" | "CAR_CARE" | "CAR_TINTING" | "CAR_SERVICE" | "ACCESSORIES";

interface CarService {
  id: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  longDescription?: string | null;
  price: string | number;
  isActive: boolean;
}

interface Place {
  id: string;
  name: string;
  address?: string | null;
}

interface SlotInfo {
  id: string;
  date: string;
  totalSpaces: number;
  bookedCount: number;
  availableCount: number;
  isClosed: boolean;
  fillRatio: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userProfile?: { phone?: string | null; whatsapp?: string | null };
  onSuccess?: () => void;
}

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORIES: { key: ServiceCategory; label: string; icon: React.ElementType }[] = [
  { key: "CAR_WASH", label: "Car Wash", icon: Droplets },
  { key: "CAR_CARE", label: "Car Care", icon: Sparkles },
  { key: "CAR_TINTING", label: "Car Tinting", icon: Film },
  { key: "CAR_SERVICE", label: "Car Service", icon: Wrench },
  { key: "ACCESSORIES", label: "Accessories", icon: ShoppingBag },
];

// ─── Slot Color Helper ────────────────────────────────────────────────────────

function getSlotColor(slot: SlotInfo): "green" | "yellow" | "red" {
  if (slot.isClosed || slot.availableCount === 0) return "red";
  if (slot.fillRatio >= 0.7) return "yellow";
  return "green";
}

// ─── Stripe Payment Form (inner component) ────────────────────────────────────

function StripePaymentForm({
  bookingId,
  amountAED,
  serverUrl,
  onSuccess,
}: {
  bookingId: string;
  amountAED: number;
  serverUrl: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Confirm with backend
      try {
        const res = await fetch(`${serverUrl}/api/bookings/confirm`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, paymentIntentId: paymentIntent.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        onSuccess();
      } catch (err: any) {
        toast.error(err.message || "Failed to confirm booking");
      }
    }
    setPaying(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || paying}
        className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl text-sm"
      >
        {paying ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
        ) : (
          `Pay AED ${amountAED.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function BookingModal({ isOpen, onClose, user, userProfile, onSuccess }: BookingModalProps) {
  const serverUrl = env.NEXT_PUBLIC_SERVER_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — Service
  const [services, setServices] = useState<Record<ServiceCategory, CarService[]>>({} as any);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("CAR_WASH");
  const [selectedService, setSelectedService] = useState<CarService | null>(null);

  // Step 2 — Slot, Place, Details
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [formName, setFormName] = useState(user?.name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [formPhone, setFormPhone] = useState(userProfile?.phone || "");
  const [formPhoneValid, setFormPhoneValid] = useState(!!userProfile?.phone);
  const [formWhatsapp, setFormWhatsapp] = useState(userProfile?.whatsapp || "");
  const [formWhatsappValid, setFormWhatsappValid] = useState(true);
  const [formNotes, setFormNotes] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Step 3 — Payment
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Step 4 — Success
  const [succeeded, setSucceeded] = useState(false);

  // ── Reset on open/close ──
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedService(null);
      setSelectedSlot(null);
      setSelectedDate(undefined);
      setSelectedPlace(null);
      setClientSecret(null);
      setBookingId(null);
      setSucceeded(false);
      setFormSubmitted(false);
      setFormName(user?.name || "");
      setFormEmail(user?.email || "");
      setFormPhone(userProfile?.phone || "");
      setFormPhoneValid(!!userProfile?.phone);
      setFormWhatsapp(userProfile?.whatsapp || "");
    }
  }, [isOpen]);

  // ── Load services ──
  useEffect(() => {
    if (!isOpen || Object.keys(services).length > 0) return;
    setServicesLoading(true);
    fetch(`${serverUrl}/api/services`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data); })
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setServicesLoading(false));
  }, [isOpen, serverUrl]);

  // ── Load slots for current month ──
  const loadSlots = useCallback(() => {
    const month = format(calendarMonth, "yyyy-MM");
    setSlotsLoading(true);
    fetch(`${serverUrl}/api/slots?month=${month}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSlots(d.data); })
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setSlotsLoading(false));
  }, [calendarMonth, serverUrl]);

  useEffect(() => {
    if (isOpen && step === 2) loadSlots();
  }, [isOpen, step, calendarMonth]);

  // ── Load places ──
  useEffect(() => {
    if (isOpen && step === 2 && places.length === 0) {
      fetch(`${serverUrl}/api/places`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => { if (d.success) setPlaces(d.data); })
        .catch(() => toast.error("Failed to load places"));
    }
  }, [isOpen, step]);

  // ── Slot lookup for selected date ──
  const slotForDate = (date: Date): SlotInfo | undefined => {
    return slots.find((s) => {
      const d = new Date(s.date);
      return d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate();
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const slot = slotForDate(date);
    if (!slot || slot.isClosed || slot.availableCount === 0) return;
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  // ── Proceed to Payment ──
  const handleProceedToPayment = async () => {
    setFormSubmitted(true);
    if (!formName.trim() || formName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formEmail.trim()) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!formPhoneValid) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!formWhatsappValid) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a booking slot");
      return;
    }
    if (!selectedPlace) {
      toast.error("Please select a service location");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/api/bookings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService!.id,
          slotId: selectedSlot.id,
          placeId: selectedPlace.id,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone,
          whatsapp: formWhatsapp || undefined,
          notes: formNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClientSecret(data.clientSecret);
      setBookingId(data.booking.id);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSucceeded(true);
    setStep(4);
    toast.success("Booking confirmed! Our team will contact you shortly.");
    onSuccess?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step < 4 ? undefined : onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-glanz-black rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal/70 flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-glanz-black/90 backdrop-blur-md border-b border-slate-100 dark:border-charcoal/40 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {step > 1 && step < 4 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal/40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
            )}
            <div>
              <h2 className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide">
                {step === 1 && "Choose a Service"}
                {step === 2 && "Select Slot & Details"}
                {step === 3 && "Secure Payment"}
                {step === 4 && "Booking Confirmed!"}
              </h2>
              {step < 4 && (
                <p className="text-xs text-slate-400 dark:text-cream/40">Step {step} of 3</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal/40 transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress */}
        {step < 4 && (
          <div className="px-6 pt-3 pb-1 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-glanz-gold" : "bg-slate-200 dark:bg-charcoal/40"}`}
              />
            ))}
          </div>
        )}

        {/* ── STEP 1: Service Picker ── */}
        {step === 1 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Category Tabs */}
            <div className="flex gap-1 px-6 pt-4 overflow-x-auto scrollbar-none">
              {CATEGORIES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeCategory === key
                    ? "bg-glanz-gold text-glanz-black shadow"
                    : "bg-slate-100 dark:bg-charcoal/40 text-slate-600 dark:text-cream/60 hover:bg-slate-200 dark:hover:bg-charcoal/60"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Service Tiles */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {servicesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-charcoal/30 animate-pulse" />
                ))
              ) : (
                (services[activeCategory] || []).map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setStep(2); }}
                    className={`text-left p-4 rounded-xl border transition-all group hover:shadow-md ${selectedService?.id === svc.id
                      ? "border-glanz-gold bg-glanz-gold/5 dark:bg-glanz-gold/10"
                      : "border-slate-200 dark:border-charcoal/60 hover:border-glanz-gold/50"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{svc.name}</p>
                        <p className="text-xs text-slate-500 dark:text-cream/50 mt-0.5 line-clamp-2">{svc.shortDescription}</p>
                      </div>
                      <Badge className="shrink-0 bg-glanz-gold/10 text-glanz-gold border-glanz-gold/30 text-xs font-extrabold px-2">
                        AED {Number(svc.price).toFixed(0)}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
              {!servicesLoading && (services[activeCategory] || []).length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400 dark:text-cream/30 text-sm">
                  No services available in this category
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Slot + Details ── */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Selected Service Summary */}
            {selectedService && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-glanz-gold/5 border border-glanz-gold/20">
                <Car className="w-5 h-5 text-glanz-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{selectedService.name}</p>
                  <p className="text-xs text-slate-500 dark:text-cream/50">{selectedService.shortDescription}</p>
                </div>
                <Badge className="bg-glanz-gold/10 text-glanz-gold border-glanz-gold/30 font-extrabold text-xs">
                  AED {Number(selectedService.price).toFixed(0)}
                </Badge>
              </div>
            )}

            {/* Calendar */}
            <div>
              <label className="block text-xs font-semibold text-glanz-gold uppercase tracking-[3px] mb-2">
                Select Date
              </label>

              {/* Legend */}
              <div className="flex gap-4 mb-3 text-[10px] font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Available</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Limited</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />Full / Closed</span>
              </div>

              {slotsLoading ? (
                <div className="h-64 rounded-xl bg-slate-100 dark:bg-charcoal/20 animate-pulse" />
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  disabled={(date) => {
                    if (isBefore(date, startOfDay(new Date()))) return true;
                    const slot = slotForDate(date);
                    if (!slot) return true;
                    return slot.isClosed || slot.availableCount === 0;
                  }}
                  modifiers={{
                    slotGreen: (date) => { const s = slotForDate(date); return !!s && getSlotColor(s) === "green"; },
                    slotYellow: (date) => { const s = slotForDate(date); return !!s && getSlotColor(s) === "yellow"; },
                    slotRed: (date) => { const s = slotForDate(date); return !!s && getSlotColor(s) === "red"; },
                  }}
                  modifiersClassNames={{
                    slotGreen: "!bg-emerald-500/20 !text-emerald-700 dark:!text-emerald-300 hover:!bg-emerald-500/40 rounded-full",
                    slotYellow: "!bg-amber-400/20 !text-amber-700 dark:!text-amber-300 hover:!bg-amber-400/40 rounded-full",
                    slotRed: "!bg-rose-500/10 !text-rose-400 opacity-50 cursor-not-allowed rounded-full",
                  }}
                  className="rounded-xl border border-slate-200 dark:border-charcoal/60 p-3 w-full"
                />
              )}

              {selectedSlot && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {format(new Date(selectedSlot.date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-cream/50 mt-1 ml-6">
                    {selectedSlot.availableCount} of {selectedSlot.totalSpaces} slots available
                  </p>
                </div>
              )}
            </div>

            {/* Place */}
            <div>
              <label className="block text-xs font-semibold text-glanz-gold uppercase tracking-[3px] mb-2">
                Service Location
              </label>
              <div className="grid gap-2">
                {places.length === 0 && (
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-charcoal/20 animate-pulse" />
                )}
                {places.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlace(p)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${selectedPlace?.id === p.id
                      ? "border-glanz-gold bg-glanz-gold/5"
                      : "border-slate-200 dark:border-charcoal/60 hover:border-glanz-gold/50"
                      }`}
                  >
                    <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${selectedPlace?.id === p.id ? "text-glanz-gold" : "text-slate-400"}`} />
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">{p.name}</p>
                      {p.address && <p className="text-xs text-slate-400 dark:text-cream/40">{p.address}</p>}
                    </div>
                  </button>
                ))}
              </div>
              {formSubmitted && !selectedPlace && (
                <p className="text-xs text-rose-500 mt-1">Please select a service location</p>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-glanz-gold uppercase tracking-[3px]">
                Your Details
              </label>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-glanz-gold uppercase tracking-[3px] mb-1.5">Full Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full bg-white dark:bg-glanz-black border rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 transition-all ${formSubmitted && formName.trim().length < 2
                    ? "border-rose-500/80 focus:ring-rose-500"
                    : "border-slate-200 dark:border-charcoal focus:border-glanz-gold focus:ring-glanz-gold"
                    }`}
                />
                {formSubmitted && formName.trim().length < 2 && (
                  <p className="text-xs text-rose-500 mt-1">Please enter your full name</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-glanz-gold uppercase tracking-[3px] mb-1.5">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:border-glanz-gold focus:ring-glanz-gold transition-all"
                />
              </div>

              {/* Phone */}
              <PhoneInput
                label="Phone Number"
                initialValue={formPhone}
                onPhoneChange={(number, isValid) => {
                  setFormPhone(number);
                  setFormPhoneValid(isValid);
                }}
                onChangeCountry={() => {}}
                isSubmitted={formSubmitted}
              />

              {/* WhatsApp */}
              <PhoneInput
                label="WhatsApp Number (Optional)"
                initialValue={formWhatsapp}
                onPhoneChange={(number, isValid) => {
                  setFormWhatsapp(number);
                  setFormWhatsappValid(isValid);
                }}
                onChangeCountry={() => {}}
                isSubmitted={formSubmitted}
                optional={true}
              />

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-glanz-gold uppercase tracking-[3px] mb-1.5">
                  Additional Notes <span className="text-slate-400 normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Any specific requirements or instructions..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:border-glanz-gold focus:ring-glanz-gold transition-all resize-none"
                />
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl shadow-md shadow-glanz-gold/10 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating booking...</>
              ) : (
                <>Continue to Payment <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        )}

        {/* ── STEP 3: Stripe Payment ── */}
        {step === 3 && clientSecret && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Summary card */}
            <div className="rounded-xl border border-slate-200 dark:border-charcoal/60 p-4 space-y-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Booking Summary</h3>
              <div className="text-xs text-slate-500 dark:text-cream/50 space-y-1">
                <p><span className="font-medium text-slate-700 dark:text-cream">Service:</span> {selectedService?.name}</p>
                <p><span className="font-medium text-slate-700 dark:text-cream">Date:</span> {selectedDate ? format(selectedDate, "EEE, MMM d yyyy") : ""}</p>
                <p><span className="font-medium text-slate-700 dark:text-cream">Location:</span> {selectedPlace?.name}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-charcoal/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-cream/50">Total</span>
                <span className="font-extrabold text-glanz-gold text-lg">AED {Number(selectedService?.price).toFixed(2)}</span>
              </div>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#d4a017", borderRadius: "12px" },
                },
              }}
            >
              <StripePaymentForm
                bookingId={bookingId!}
                amountAED={Number(selectedService?.price)}
                serverUrl={serverUrl}
                onSuccess={handleSuccess}
              />
            </Elements>
          </div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center animate-in zoom-in-50">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Booking Confirmed!</h3>
              <p className="text-sm text-slate-500 dark:text-cream/50 max-w-xs mx-auto leading-relaxed">
                Your payment was successful. Our customer service team will contact you shortly with further instructions.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-charcoal/30 rounded-xl p-4 text-xs text-slate-500 dark:text-cream/40 space-y-1 w-full max-w-xs">
              <p><span className="font-semibold text-slate-700 dark:text-cream">{selectedService?.name}</span></p>
              <p>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}</p>
              <p>{selectedPlace?.name}</p>
            </div>
            <Button
              onClick={onClose}
              className="bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold px-8 rounded-xl"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
