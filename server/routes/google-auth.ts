import express, { Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findUserByEmail, saveUser } from "../store/users";
import { saveRefreshToken } from "../store/refreshTokens";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "15m";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:4000/api/auth/google/callback";

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email not provided by Google") as any, undefined);
        }

        let user = findUserByEmail(email);

        // If user doesn't exist, create them
        if (!user) {
          // Create a random password for Google users
          const randomPassword = crypto.randomBytes(32).toString("hex");
          user = saveUser({ email, password: randomPassword });
        }

        return done(undefined, {
          id: user.id,
          email: user.email,
          googleId: profile.id,
        });
      } catch (error) {
        return done(error as any, undefined);
      }
    }
  )
);

// Google OAuth Login Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res: Response) => {
    try {
      const user = req.user;

      // Generate access token
      const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRES_IN,
      } as jwt.SignOptions);

      // Generate refresh token
      const refreshToken = crypto.randomBytes(64).toString("hex");
      saveRefreshToken(refreshToken, user.id);

      // Redirect to Angular with tokens in query params
      const redirectUrl = new URL("http://localhost:4200/auth/callback");
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set("refreshToken", refreshToken);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      res.status(500).json({ error: "Failed to generate tokens" });
    }
  }
);

// Logout route (optional)
router.post("/logout", (_req: Request, res: Response): void => {
  res.json({ message: "Logged out successfully" });
});

export default router;

