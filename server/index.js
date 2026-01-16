const express = require("express");
const cors = require("cors");
const { auth } = require("express-openid-connect");
const mongoose = require("mongoose");

require("dotenv").config();
const app = express();

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

const requireAuth = (req, res, next) => {
  const isAuth =
    req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated();
  console.log(
    "[requireAuth] isAuthenticated:",
    isAuth,
    "user:",
    req.oidc?.user?.name || "none"
  );
  if (!isAuth) {
    return res.status(401).json({ error: "Unauthorized: please login first" });
  }
  next();
};

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || null;
if (!mongoUri) {
  console.warn(
    "Warning: No MongoDB connection string found. Set MONGODB_URI in your .env."
  );
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      console.log("Mongoose connection name:", mongoose.connection.name);
      console.log("Mongoose host:", mongoose.connection.host);
    })
    .catch((err) => console.error("MongoDB connection error:", err));
}

app.get("/api/collections", requireAuth, async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    const requestedDb = req.query.db;
    const db = requestedDb
      ? mongoose.connection.client.db(requestedDb)
      : mongoose.connection.db;

    const cols = await db.listCollections().toArray();
    console.log(
      "collections for db",
      db.databaseName,
      cols.map((c) => c.name)
    );
    return res.json({
      db: db.databaseName,
      collections: cols.map((c) => c.name),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/collections/:name", requireAuth, async (req, res) => {
  try {
    const name = req.params.name;
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    const requestedDb = req.query.db;
    const db = requestedDb
      ? mongoose.connection.client.db(requestedDb)
      : mongoose.connection.db;

    console.log("fetching from db", db.databaseName, "collection", name);
    const docs = await db.collection(name).find({}).limit(100).toArray();
    return res.json({
      db: db.databaseName,
      collection: name,
      count: docs.length,
      docs,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  const frontendCallback =
    process.env.FRONTEND_CALLBACK || "http://localhost:4200";
  return res.redirect(frontendCallback);
});

app.get("/auth/status", (req, res) => {
  const isAuthenticated =
    !!req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated();
  const user = req.oidc && req.oidc.user ? req.oidc.user : null;
  res.json({ authenticated: Boolean(isAuthenticated), user });
});

app.get("/auth/token", (req, res) => {
  if (!req.oidc || !req.oidc.isAuthenticated || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: "not_authenticated" });
  }

  const accessToken =
    req.oidc.accessToken && req.oidc.accessToken.access_token
      ? req.oidc.accessToken.access_token
      : null;
  const idToken = req.oidc.idToken ? req.oidc.idToken : null;

  res.json({ accessToken, idToken });
});

app.post("/callback", (req, res) => {
  const frontendCallback =
    process.env.FRONTEND_CALLBACK || "http://localhost:4200";
  if (req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated()) {
    return res.redirect(frontendCallback);
  }
  return res.redirect("/");
});

app.get("/callback", (req, res) => {
  const frontendCallback =
    process.env.FRONTEND_CALLBACK || "http://localhost:4200";
  if (req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated()) {
    return res.redirect(frontendCallback);
  }
  return res.redirect("/");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
