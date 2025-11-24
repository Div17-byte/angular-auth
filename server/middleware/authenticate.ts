import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Malformed token" });
    return;
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    if (decoded && typeof decoded === "object" && "sub" in decoded && "email" in decoded) {
      req.user = decoded as unknown as { sub: number; email: string };
      next();
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  });
}
