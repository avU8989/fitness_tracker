import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  //get the auth header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token payload" });
    return;
  }

  //extract token from header
  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_Secret not set in environment");
    }

    //verify token with JWT SECRET
    const decoded = jwt.verify(token, secret) as { id: string };

    //attach user info to request object
    req.user = { id: decoded.id };

    //proceed to next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return;
  }
};

export default authMiddleware;
