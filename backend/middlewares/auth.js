// backend/middlewares/auth.js
// Checks JWT token on requests that need a logged-in user.
// Add this middleware to any route that requires authentication.
// Usage: router.post("/", authMiddleware, createPost)

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "road_hazard_secret_key";

export const authMiddleware = (req, res, next) => {
  // Token comes in the Authorization header as: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in. Please login first." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token — if invalid or expired, this throws
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request so the next handler can use it
    req.user = decoded; // { id, username }

    next();

  } catch (err) {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }
};