// backend/routes/userRoute.js
// Handles signup and login for regular users.
// Follows the same pattern as your existing postController.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../config/db.js";

export const userRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "road_hazard_secret_key";

// POST /api/v1/user/signup
userRouter.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: "Username must be 3–20 characters" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if username is already taken
    const existing = await UserModel.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({ username, password: hashedPassword });

    return res.json({ message: "Account created successfully" });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Error creating account" });
  }
});

// POST /api/v1/user/login
userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Sign a JWT token with the user's id and username
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );

    return res.json({
      token,
      username: user.username,
      message: "Login successful",
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});