import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/shorten-url", (req, res) => {
  res.render("shorten-url", { user: req.user });
});

router.get("/qrcode", (req, res) => {
  res.render("qrcode", { user: req.user });
});

router.get("/analytics", (req, res) => {
  res.render("analytics", { user: req.user });
});

router.get("/history", (req, res) => {
  res.render("history", { user: req.user });
});

export default router;
