/**
 * Copyright © GLANZ
 * Author: habeeb
 * Contact: muhhabeeb787+glanzautor@gmail.com
 */

import { Router } from "express";
import { getUserProfile, updateUser } from "../controllers/userController.js";
import { authenticated } from "../middlewares/auth.js";

const router = Router();

// --- User Profile Routes ---
// @route   GET  /api/users/profile  — Get current user's profile
// @route   PATCH /api/users/profile — Update name / phone / whatsapp
// @access  Private (JWT session required)
//
// NOTE: Password change  → POST /api/auth/change-password   (Better Auth native)
//       Email change     → POST /api/auth/change-email      (Better Auth native)
//       Account deletion → POST /api/auth/delete-user       (Better Auth native, 7-day soft-delete via beforeDelete hook)
router.route("/profile")
  .get(authenticated, getUserProfile)
  .patch(authenticated, updateUser);

export default router;
