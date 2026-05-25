/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Router } from "express";
import { authenticated, authorizedAsAdmin } from "../middlewares/auth.js";
import {
  getAllUsers,
  updateUserById,
  deleteUserById,
  deleteManyById,
  getAllDeletedUsers,
  restoreDeletedUser
} from "../controllers/adminController.js";

const router = Router();

// Secure all admin routes
router.use(authenticated, authorizedAsAdmin);

// Admin User Management Routes
router.get("/users", getAllUsers); // Supports pagination and filtering
router.patch("/users/:id", updateUserById);
router.delete("/users/:id", deleteUserById);
router.post("/users/delete-many", deleteManyById); // Bulk deletion

// Deletion Management Routes
router.get("/deleted-users", getAllDeletedUsers);
router.post("/users/:id/restore", restoreDeletedUser);

export default router;
