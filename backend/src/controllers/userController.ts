import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { env } from "../config/env.js";

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
 * Handle User Sign In or Registration.
 * Accepts name, email, password, and phone.
 * If user exists, validates password. If not, creates new user.
 */
export const signInUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate incoming data
    const validatedData = userAuthSchema.parse(req.body);
    const { name, email, password, phone } = validatedData;

    // 2. Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // 3. Verify password for existing user
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
      }
    } else {
      // 4. Create new user if they don't exist
      const saltRounds = 10;
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
    }

    // 5. Check if user is active
    if (!user.is_active) {
      res.status(403).json({ success: false, message: "Account is disabled. Please contact support." });
      return;
    }

    // 6. Generate JWT Tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // 7. Set Secure Cookies
    const isProd = env.NODE_ENV === "production";
    
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Return response
    res.status(200).json({
      success: true,
      message: "Authentication successful",
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
    
    console.error("Sign In Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
