const path    = require("path");
const express  = require("express");
const cors     = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB      = require("./config/db");
const authRoutes     = require("./routes/authRoutes");
const contentRoutes  = require("./routes/contentRoutes");

// ─── DB ──────────────────────────────────────────────────────────────────────
connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

// ─── CORS ────────────────────────────────────────────────────────────────────
// In production the frontend is served from the same Express process,
// so same-origin requests need no CORS header.  If you ever split them
// again, set CLIENT_URL to the frontend origin.
const corsOptions = isProd
  ? {
      origin: process.env.CLIENT_URL || true, // true = mirror the request origin
      credentials: true,
    }
  : { origin: "*" };                           // permissive in dev

app.use(cors(corsOptions));
app.use(express.json());

// ─── API ROUTES ──────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/content", contentRoutes);

// ─── STATIC FRONTEND (production only) ───────────────────────────────────────
// Vite builds the React app into <repo-root>/dist.
// backend/server.js sits one level inside, so ../dist resolves correctly.
if (isProd) {
  const distPath = path.join(__dirname, "..", "dist");

  app.use(express.static(distPath));

  // React Router catch-all — must come AFTER all API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Dev: Vite runs on its own port; just keep a health-check route
  app.get("/", (req, res) => {
    res.json({ success: true, message: "AI Marketing Backend Running 🚀" });
  });
}

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running in ${isProd ? "production" : "development"} mode on port ${PORT}`);
});