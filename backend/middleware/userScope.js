import mongoose from "mongoose";

/**
 * Minimal user scoping.
 * - If `Authorization: Bearer <userId>` and <userId> looks like an ObjectId => use it.
 * - Else fallback to DEFAULT_USER_ID from env.
 *
 * This keeps the API usable without implementing auth right now.
 */
import jwt from "jsonwebtoken";

export function userScope(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      
      // Fallback decode for mock IDs (for backward compatibility during migration)
      if (mongoose.isValidObjectId(token)) {
        req.userId = token;
        req.user = { _id: token };
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret_key_change_me"
      );
      req.userId = decoded.id;
      req.user = { _id: decoded.id };
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // Not strictly enforcing 401 here to allow open routes to hit userScope if they just want req.userId to be undefined
  // For strictly protected routes, they should check if req.userId exists
  if (!req.userId) {
     return res.status(401).json({ message: "Not authorized, no token" });
  }
}

