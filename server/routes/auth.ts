import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findUserByEmail, findUserById, saveUser } from "../store/users";
import { saveRefreshToken, findRefreshToken } from "../store/refreshTokens";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_EXPIRES_IN = "1m";

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

// register
router.post("/register", async (req: RegisterRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if (findUserByEmail(email)) {
    res.status(409).json({ error: "User already exists" });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = saveUser({ email, password: hashed });

  // Generate access token
  console.log('TOKEN_EXPIRES_IN:', TOKEN_EXPIRES_IN)
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);

  // Generate refresh token
  const refreshToken = crypto.randomBytes(64).toString("hex");
  saveRefreshToken(refreshToken, user.id);

  res.json({
    token,
    refreshToken,
    user: { id: user.id, email: user.email }
  });
});

// login
router.post("/login", async (req: LoginRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Generate access token
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);

  // Generate refresh token
  const refreshToken = crypto.randomBytes(64).toString("hex");
  saveRefreshToken(refreshToken, user.id);

  res.json({
    token,
    refreshToken,
    user: { id: user.id, email: user.email }
  });
});

// refresh token
router.post("/refresh", async (req: RefreshTokenRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  // Find the refresh token in our store
  const storedToken = findRefreshToken(refreshToken);

  if (!storedToken) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  // Find the user by ID
  const foundUser = findUserById(storedToken.userId);

  if (!foundUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  // Generate new access token
  const newToken = jwt.sign({ sub: foundUser.id, email: foundUser.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);

  res.json({ token: newToken });
});

export default router;
