const express = require("express");
const cors = require("cors");
const { auth } = require("express-openid-connect");
const mongoose = require("mongoose");

require("dotenv").config();
const app = express();

// Allow requests from the frontend during development. Set FRONTEND_ORIGIN
// to your frontend origin (e.g. http://localhost:4200). Credentials must be
// allowed so the browser sends cookies for session-based auth.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:4200",
    credentials: true,
  }),
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

// --- Auth middleware: ensure user is logged in ---
const requireAuth = (req, res, next) => {
  const isAuth =
    req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated();
  console.log(
    "[requireAuth] isAuthenticated:",
    isAuth,
    "user:",
    req.oidc?.user?.name || "none",
  );
  if (!isAuth) {
    return res.status(401).json({ error: "Unauthorized: please login first" });
  }
  next();
};

// --- MongoDB Atlas connection (via Mongoose) ---
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || null;
if (!mongoUri) {
  console.warn(
    "Warning: No MongoDB connection string found. Set MONGODB_URI in your .env.",
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

// API: list collections and fetch documents from a collection
app.get("/api/collections", requireAuth, async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    // allow overriding the database using ?db=sample_mflix
    const requestedDb = req.query.db;
    const db = requestedDb
      ? mongoose.connection.client.db(requestedDb)
      : mongoose.connection.db;

    const cols = await db.listCollections().toArray();
    console.log(
      "collections for db",
      db.databaseName,
      cols.map((c) => c.name),
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

// --- Movie API endpoints ---
// POST: Add a new movie
app.post("/api/movies", requireAuth, async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    const db = mongoose.connection.client.db("sample_mflix");
    const moviesCollection = db.collection("movies");

    const movieData = {
      title: req.body.title,
      year: req.body.year,
      rated: req.body.rated || "",
      genres: req.body.genres || [],
      plot: req.body.plot || "",
      runtime: req.body.runtime || 0,
      poster: req.body.poster || "", // Base64 encoded image
      directors: req.body.directors || [],
      createdAt: new Date(),
      createdBy: req.oidc?.user?.sub || "unknown",
    };

    const result = await moviesCollection.insertOne(movieData);
    console.log("Movie added:", result.insertedId);

    return res.status(201).json({
      message: "Movie added successfully",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Error adding movie:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET: Fetch a movie by ID
app.get("/api/movies/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    const db = mongoose.connection.client.db("sample_mflix");
    const moviesCollection = db.collection("movies");

    const { ObjectId } = require("mongodb");
    let movieId;
    try {
      movieId = new ObjectId(req.params.id);
    } catch (e) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const movie = await moviesCollection.findOne({ _id: movieId });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    return res.json(movie);
  } catch (err) {
    console.error("Error fetching movie:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT: Update a movie
app.put("/api/movies/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    const db = mongoose.connection.client.db("sample_mflix");
    const moviesCollection = db.collection("movies");

    const { ObjectId } = require("mongodb");
    let movieId;
    try {
      movieId = new ObjectId(req.params.id);
    } catch (e) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const updateData = {
      title: req.body.title,
      year: req.body.year,
      rated: req.body.rated || "",
      genres: req.body.genres || [],
      plot: req.body.plot || "",
      runtime: req.body.runtime || 0,
      poster: req.body.poster || "",
      directors: req.body.directors || [],
      updatedAt: new Date(),
      updatedBy: req.oidc?.user?.sub || "unknown",
    };

    const result = await moviesCollection.updateOne(
      { _id: movieId },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    console.log("Movie updated:", movieId);
    return res.json({
      message: "Movie updated successfully",
      id: movieId,
    });
  } catch (err) {
    console.error("Error updating movie:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete a movie
app.delete("/api/movies/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.client) {
      return res.status(500).json({ error: "No DB connection" });
    }

    const db = mongoose.connection.client.db("sample_mflix");
    const moviesCollection = db.collection("movies");

    const { ObjectId } = require("mongodb");
    let movieId;
    try {
      movieId = new ObjectId(req.params.id);
    } catch (e) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const result = await moviesCollection.deleteOne({ _id: movieId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    console.log("Movie deleted:", movieId);
    return res.json({
      message: "Movie deleted successfully",
      id: movieId,
    });
  } catch (err) {
    console.error("Error deleting movie:", err);
    return res.status(500).json({ error: err.message });
  }
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
