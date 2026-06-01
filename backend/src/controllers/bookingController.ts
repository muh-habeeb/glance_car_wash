/**
 * Copyright © GLANZ
 * Booking Controller — handles all booking, slot, service, and place API logic.
 */

import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import Stripe from "stripe";
import { z } from "zod";
import { BookingStatus } from "@prisma/client";
import type { AuthenticatedRequest } from "../middlewares/auth.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ─── Validation Schemas ────────────────────────────────────────────────────────

const createBookingSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  slotId: z.string().uuid("Invalid slot ID"),
  placeId: z.string().uuid("Invalid place ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  phone: z.string().regex(/^\+\d{7,15}$/, "Phone must include country code"),
  whatsapp: z.string().regex(/^\+\d{7,15}$/, "WhatsApp must include country code").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"]),
  note: z.string().max(300).optional(),
});

const createSlotSchema = z.object({
  date: z.string().datetime({ message: "Invalid date" }),
  totalSpaces: z.number().int().min(1).max(500),
  isClosed: z.boolean().optional().default(false),
  closedReason: z.string().max(200).optional(),
});

const updateSlotSchema = z.object({
  totalSpaces: z.number().int().min(1).max(500).optional(),
  isClosed: z.boolean().optional(),
  closedReason: z.string().max(200).optional(),
});

// ─── GET /api/services ─────────────────────────────────────────────────────────
export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.carService.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });

    // Group by category
    const grouped = services.reduce((acc: Record<string, typeof services>, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load services" });
  }
};

// ─── GET /api/places ───────────────────────────────────────────────────────────
export const getPlaces = async (_req: Request, res: Response): Promise<void> => {
  try {
    const places = await prisma.availablePlace.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: places });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load places" });
  }
};

// ─── GET /api/slots?month=YYYY-MM ──────────────────────────────────────────────
export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const month = req.query.month as string;
    let dateFilter: { gte: Date; lte: Date } | undefined;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      dateFilter = { gte: start, lte: end };
    }

    const slots = await prisma.bookingSlot.findMany({
      where: dateFilter ? { date: dateFilter } : {},
      include: {
        _count: { select: { bookings: { where: { status: { not: BookingStatus.CANCELLED } } } } },
      },
      orderBy: { date: "asc" },
    });

    const enriched = slots.map((s) => ({
      id: s.id,
      date: s.date,
      totalSpaces: s.totalSpaces,
      bookedCount: s._count.bookings,
      availableCount: Math.max(0, s.totalSpaces - s._count.bookings),
      isClosed: s.isClosed,
      closedReason: s.closedReason,
      fillRatio: s._count.bookings / s.totalSpaces,
    }));

    res.json({ success: true, data: enriched });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load slots" });
  }
};

// ─── POST /api/slots ───────────────────────────────────────────────────────────
export const createSlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = createSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      return;
    }
    const { date, totalSpaces, isClosed, closedReason } = parsed.data;

    const slotDate = new Date(date);
    if (slotDate < new Date()) {
      res.status(400).json({ success: false, message: "Slot date cannot be in the past" });
      return;
    }

    const slot = await prisma.bookingSlot.create({
      data: {
        date: slotDate,
        totalSpaces,
        isClosed: isClosed ?? false,
        closedReason,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: slot });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create slot" });
  }
};

// ─── PATCH /api/slots/:id ──────────────────────────────────────────────────────
export const updateSlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const slotId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = updateSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      return;
    }

    const existing = await prisma.bookingSlot.findUnique({ where: { id: slotId } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Slot not found" });
      return;
    }

    const slot = await prisma.bookingSlot.update({
      where: { id: slotId },
      data: { ...parsed.data, updatedBy: req.user!.id },
    });

    res.json({ success: true, data: slot });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update slot" });
  }
};

// ─── DELETE /api/slots/:id ─────────────────────────────────────────────────────
export const deleteSlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const slotDeleteId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await prisma.bookingSlot.findUnique({ where: { id: slotDeleteId } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Slot not found" });
      return;
    }
    await prisma.bookingSlot.delete({ where: { id: slotDeleteId } });
    res.json({ success: true, message: "Slot deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete slot" });
  }
};

// ─── POST /api/bookings ────────────────────────────────────────────────────────
// Creates a Stripe PaymentIntent and a PENDING_PAYMENT booking
export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      return;
    }

    const { serviceId, slotId, placeId, name, email, phone, whatsapp, notes } = parsed.data;
    const userId = req.user!.id;

    // Verify service exists
    const service = await prisma.carService.findUnique({ where: { id: serviceId, isActive: true } });
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    // Verify slot availability
    const slot = await prisma.bookingSlot.findUnique({
      where: { id: slotId },
      include: { _count: { select: { bookings: { where: { status: { not: BookingStatus.CANCELLED } } } } } },
    });
    if (!slot) {
      res.status(404).json({ success: false, message: "Slot not found" });
      return;
    }
    if (slot.isClosed) {
      res.status(400).json({ success: false, message: "This slot has been closed" });
      return;
    }
    if (slot._count.bookings >= slot.totalSpaces) {
      res.status(400).json({ success: false, message: "This slot is fully booked" });
      return;
    }
    if (slot.date < new Date()) {
      res.status(400).json({ success: false, message: "This slot date has already passed" });
      return;
    }

    // Verify place exists
    const place = await prisma.availablePlace.findUnique({ where: { id: placeId, isActive: true } });
    if (!place) {
      res.status(404).json({ success: false, message: "Place not found" });
      return;
    }

    // Price is always taken from DB — never from client
    const amountInHalala = Math.round(Number(service.price) * 100); // AED → fils (like cents)

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInHalala,
      currency: "aed",
      automatic_payment_methods: { enabled: true },
      metadata: { userId, serviceId, slotId, placeId },
    });

    // Create pending booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        slotId,
        placeId,
        name,
        email,
        phone,
        whatsapp: whatsapp || null,
        notes: notes || null,
        status: BookingStatus.PENDING_PAYMENT,
        stripePaymentIntentId: paymentIntent.id,
        amountPaid: service.price,
        history: {
          create: {
            changedById: userId,
            changedByName: name,
            changedByRole: (req.user as any)?.role ?? "USER",
            toStatus: BookingStatus.PENDING_PAYMENT,
            note: "Booking created, awaiting payment",
          },
        },
      },
      include: {
        service: { select: { name: true, category: true } },
        slot: { select: { date: true } },
        place: { select: { name: true } },
      },
    });

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      booking,
    });
  } catch (err: any) {
    console.error("[BookingController] createBooking error:", err);
    res.status(500).json({ success: false, message: "Failed to create booking" });
  }
};

// ─── POST /api/bookings/confirm ────────────────────────────────────────────────
export const confirmBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, paymentIntentId } = req.body as { bookingId: string; paymentIntentId: string };
    if (!bookingId || !paymentIntentId) {
      res.status(400).json({ success: false, message: "bookingId and paymentIntentId are required" });
      return;
    }

    // Verify with Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      res.status(400).json({ success: false, message: "Payment not yet confirmed by Stripe" });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    if (booking.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        history: {
          create: {
            changedById: req.user!.id,
            changedByName: (req.user as any)?.name ?? "User",
            changedByRole: (req.user as any)?.role ?? "USER",
            fromStatus: BookingStatus.PENDING_PAYMENT,
            toStatus: BookingStatus.CONFIRMED,
            note: "Payment confirmed via Stripe",
          },
        },
      },
      include: {
        service: { select: { name: true, category: true } },
        slot: { select: { date: true } },
        place: { select: { name: true } },
      },
    });

    res.json({ success: true, booking: updated });
  } catch (err: any) {
    console.error("[BookingController] confirmBooking error:", err);
    res.status(500).json({ success: false, message: "Failed to confirm booking" });
  }
};

// ─── GET /api/bookings ─────────────────────────────────────────────────────────
// Returns current user's bookings (paginated)
export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
    const status = req.query.status as BookingStatus | undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const where: any = { userId: req.user!.id };
    if (status && Object.values(BookingStatus).includes(status)) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          service: { select: { name: true, category: true, shortDescription: true } },
          slot: { select: { date: true } },
          place: { select: { name: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
};

// ─── GET /api/bookings/all ─────────────────────────────────────────────────────
// Admin/Staff: all bookings with full details
export const getAllBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as BookingStatus | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const where: any = {};
    if (status && Object.values(BookingStatus).includes(status)) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy === "amountPaid" ? { amountPaid: sortOrder } : { [sortBy]: sortOrder },
        include: {
          service: { select: { name: true, category: true } },
          slot: { select: { date: true } },
          place: { select: { name: true } },
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
};

// ─── PATCH /api/bookings/:id/status ───────────────────────────────────────────
export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      return;
    }

    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    const user = req.user as any;
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: parsed.data.status as BookingStatus,
        history: {
          create: {
            changedById: user.id,
            changedByName: user.name ?? "Staff",
            changedByRole: user.role ?? "STAFF",
            fromStatus: booking.status,
            toStatus: parsed.data.status as BookingStatus,
            note: parsed.data.note,
          },
        },
      },
    });

    res.json({ success: true, booking: updated });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update booking status" });
  }
};

// ─── GET /api/bookings/:id/history ────────────────────────────────────────────
export const getBookingHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const historyBookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const booking = await prisma.booking.findUnique({
      where: { id: historyBookingId },
      include: {
        history: { orderBy: { createdAt: "asc" } },
        service: { select: { name: true } },
        slot: { select: { date: true } },
        place: { select: { name: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    // Users can only see their own booking history
    const userRole = (req.user as any)?.role;
    if (userRole === "USER" && booking.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.json({ success: true, booking });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load booking history" });
  }
};
