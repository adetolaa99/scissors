import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import path from "path";
import { connectMongoDB } from "./config/database";
import { connectRedis } from "./config/redis";
import urlRoutes from "./routes/url.routes";
import authRoutes from "./routes/auth.routes";
import { isAuthenticated } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

import dotenv from "dotenv";
dotenv.config();

// Views Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Mounting the routes
app.use("/auth", authRoutes);
app.use("/api", isAuthenticated, urlRoutes);

// Route for the home page
app.get("/", (req, res) => {
  res.render("login", { user: req.user });
});

// Sign-up page
app.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

// Log-in page
app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// Example dashboard route
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/shorten-url", isAuthenticated, (req, res) => {
  res.render("shorten-url", { user: req.user });
});

app.get("/qrcode", isAuthenticated, (req, res) => {
  res.render("qrcode", { user: req.user });
});

app.get("/analytics", isAuthenticated, (req, res) => {
  res.render("analytics", { user: req.user });
});

app.get("/history", isAuthenticated, (req, res) => {
  res.render("history", { user: req.user });
});

// Catch-all route for shortCode
app.get("/:shortCode", urlRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("Page not found");
});

const startServer = async () => {
  connectMongoDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`The Server is running on port http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

export default app;
