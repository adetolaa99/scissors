import express from "express";
import session from "express-session";
import passport from "./config/passport";
import path from "path";
import { connectMongoDB } from "./config/database";
import { connectRedis } from "./config/redis";
import urlRoutes from "./routes/url.routes";
import authRoutes from "./routes/auth.routes";

console.log("Starting to configure Express app");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Mounting the API routes
console.log("Mounting API routes");
app.use("/api", urlRoutes);
app.use("/auth", authRoutes);

// Route for the home page
app.get("/", (req, res) => {
  res.render("index");
});

// Sign-up page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Log-in page
app.get("/login", (req, res) => {
  res.render("login");
});

// Redirect route
app.get("/:shortCode", urlRoutes);

import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
  console.log("Starting server...");
  connectMongoDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`The Server is running on port http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

app.use((req, res, next) => {
  console.log(`Unhandled request: ${req.method} ${req.path}`);
  next();
});

export default app;
