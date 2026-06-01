/**
 * Copyright © GLANZ
 * Booking Routes — services, places, slots, and bookings.
 */

import { Router } from "express";
import {
  getServices,
  getPlaces,
  getSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  createBooking,
  confirmBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  getBookingHistory,
} from "../controllers/bookingController.js";
import {
  authenticated,
  authorizedAsUser,
  authorizedAsAdmin,
  authorizedAsAdminOrStaff,
  authorizedAsSuperAdmin,
} from "../middlewares/auth.js";

const router = Router();

// ── Services ──────────────────────────────────────────────────────────────────
// @route  GET /api/services — Public
router.get("/services", getServices);

// ── Places ────────────────────────────────────────────────────────────────────
// @route  GET /api/places — Authenticated (any role)
router.get("/places", authenticated, getPlaces);

// ── Slots ─────────────────────────────────────────────────────────────────────
// @route  GET    /api/slots         — Authenticated (any role)
// @route  POST   /api/slots         — Admin or Staff
// @route  PATCH  /api/slots/:id     — Admin or Staff
// @route  DELETE /api/slots/:id     — Admin or SuperAdmin only (Staff CANNOT delete)
router.get("/slots", authenticated, getSlots);
router.post("/slots", authenticated, authorizedAsAdminOrStaff, createSlot);
router.patch("/slots/:id", authenticated, authorizedAsAdminOrStaff, updateSlot);
router.delete("/slots/:id", authenticated, authorizedAsAdmin, deleteSlot);

// ── Bookings ──────────────────────────────────────────────────────────────────
// @route  POST   /api/bookings             — USER only (creates PaymentIntent)
// @route  POST   /api/bookings/confirm     — Authenticated (confirms after payment)
// @route  GET    /api/bookings             — USER only (own bookings)
// @route  GET    /api/bookings/all         — Admin/Staff (all bookings)
// @route  PATCH  /api/bookings/:id/status  — Admin/Staff (update status + write history)
// @route  GET    /api/bookings/:id/history — Authenticated (admin/staff see all, user sees own)
router.post("/bookings", authenticated, authorizedAsUser, createBooking);
router.post("/bookings/confirm", authenticated, confirmBooking);
router.get("/bookings/all", authenticated, authorizedAsAdminOrStaff, getAllBookings);
router.get("/bookings", authenticated, authorizedAsUser, getUserBookings);
router.patch("/bookings/:id/status", authenticated, authorizedAsAdminOrStaff, updateBookingStatus);
router.get("/bookings/:id/history", authenticated, getBookingHistory);

export default router;
