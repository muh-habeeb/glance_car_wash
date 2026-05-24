import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken, setAuthCookies } from "../utils/jwt.js";

// --- Validation Schemas ---

const userAuthSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string()
    .regex(/^(?:\+971|00971|0)(?:50|52|54|55|56|58)\d{7}$/, "Invalid UAE phone number format")
    .optional(),
});

// --- Controller Functions ---

/**
 * Handle User Registration.
 * Accepts name, email, password, and phone.
 * Creates a new user if the email does not exist.
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = userAuthSchema.parse(req.body);
    const { name, email, password, phone } = validatedData;

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      res.status(409).json({ success: false, message: "Email is already registered" });
      return;
    }

    const saltRounds = 12; // Maximum security hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "USER",
        is_active: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please log in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err: z.core.$ZodIssue) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error });
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Handle User Login.
 * Verifies credentials and issues short-lived secure JWTs.
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: "User dose not exist!" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ success: false, message: "Account is disabled. Please contact support." });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };

    // Using short-lived token logic via utility functions
    const accessToken = signAccessToken(payload, '5m'); // 5 minutes TTL
    const refreshToken = signRefreshToken(payload, '7d');

    // Securely set the tokens in HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err: z.ZodIssue) => ({ path: err.path.join("."), message: err.message }))
      });
      return;
    }
    req.log?.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
