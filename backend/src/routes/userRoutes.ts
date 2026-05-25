/**
 * Copyright © GLANCE
 * Author: habeeb
 * Contact: muhhabeeb787+glanceautor@gmail.com
 */

import { Router } from "express";
import { loginUser, registerUser, logoutUser, getUserProfile ,updateUser, refreshToken, deleteUser} from "../controllers/userController.js";
import { authenticated } from "../middlewares/auth.js";

const router = Router();

// --- Auth Routes ---

// @route   POST /users/register
// @desc    Register a new user
// @access  Public
router.route("/").post(registerUser).get(authenticated,getUserProfile).patch(authenticated, updateUser).delete(authenticated, deleteUser);

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);


export default router;
