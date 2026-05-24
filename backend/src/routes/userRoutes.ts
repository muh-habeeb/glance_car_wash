import { Router } from "express";
import { loginUser, registerUser } from "../controllers/userController.js";

const router = Router();

// --- Auth Routes ---

// @route   POST /users/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /users/login
// @desc    Authenticate user and return short-lived secure JWT tokens
// @access  Public
router.post("/login", loginUser);

export default router;
