const express = require("express");
const cors = require("cors");
const { auth } = require("express-openid-connect");

require("dotenv").config();
const app = express();

// Allow requests from the frontend during development. Set FRONTEND_ORIGIN
// to your frontend origin (e.g. http://localhost:4200). Credentials must be
// allowed so the browser sends cookies for session-based auth.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET || "a-long-random-string-for-dev",
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  clientID: process.env.CLIENT_ID || "JdkChn08M3mqFMiN15QwFlH63lgyoa5D",
  issuerBaseURL:
    process.env.ISSUER_BASE_URL || "https://dev-a6bba2em8zvcglyj.eu.auth0.com",
};

app.use(auth(config));

// After successful Auth0 login the library redirects to the baseURL ('/').
// If the user is authenticated, redirect to the frontend callback route so
// the Angular app can finish the flow and request tokens from /auth/token.
app.get("/", (req, res) => {
  const frontendCallback = process.env.FRONTEND_CALLBACK;
  return res.redirect(frontendCallback);
});

// JSON endpoint for frontend to check auth status
app.get("/auth/status", (req, res) => {
  const isAuthenticated =
    !!req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated();
  const user = req.oidc && req.oidc.user ? req.oidc.user : null;
  res.json({ authenticated: Boolean(isAuthenticated), user });
});

// Return tokens to the frontend (called from the frontend callback route).
app.get("/auth/token", (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: "not_authenticated" });
  }

  // access token may be available on req.oidc.accessToken
  const accessToken =
    req.oidc.accessToken && req.oidc.accessToken.access_token
      ? req.oidc.accessToken.access_token
      : null;
  // id token may be available on req.oidc.idToken
  const idToken = req.oidc.idToken ? req.oidc.idToken : null;

  res.json({ accessToken, idToken });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));

// Handle Auth0 callback forms and redirect to frontend callback route
const FRONTEND_CALLBACK = process.env.FRONTEND_CALLBACK;

app.post("/callback", (req, res) => {
  if (req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated()) {
    return res.redirect(FRONTEND_CALLBACK);
  }
  return res.redirect("/");
});

app.get("/callback", (req, res) => {
  if (req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated()) {
    return res.redirect(FRONTEND_CALLBACK);
  }
  return res.redirect("/");
});
