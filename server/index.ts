import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth";
import protectedRouter from "./routes/protected";
import oauth2Router from "./routes/oauth2";
import googleAuthRouter from "./routes/google-auth";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/auth", googleAuthRouter);
app.use("/api/dashboard", protectedRouter);
app.use("/oauth", oauth2Router);

app.get("/", (_: Request, res: Response): void => {
  res.json({ ok: true, message: "Backend running" });
});

app.listen(PORT, (): void => {
  console.log(`Server listening on port ${PORT}`);
});
