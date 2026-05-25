/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Router } from "express";
import { getUserProfile, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticated } from "../middlewares/auth.js";

const router = Router();

// --- User Profile Routes ---
// @route   GET /users/profile (Get Profile)
// @route   PATCH /users/profile (Update Profile)
// @route   DELETE /users/profile (Soft Delete Profile)
// @access  Private
router.route("/profile")
  .get(authenticated, getUserProfile)
  .patch(authenticated, updateUser)
  .delete(authenticated, deleteUser);

export default router;
