import { Router } from "express";
import { signInUser } from "../controllers/userController.js";

const router = Router();

// --- Auth Routes ---

// @route   POST /users/signin
// @desc    Authenticate user or register a new one and return JWT tokens
// @access  Public
router.post("/signin", signInUser);

export default router;
