const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();
const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

router.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/");
  }
  const tab = req.query.tab === "signup" ? "signup" : "login";
  res.render("transactions/log_sign", {
    activeTab: tab,
    searchQuery: "",
  });
});

router.post("/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";
  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    req.session.flash = {
      type: "error",
      text: "That email or password does not match our records.",
    };
    return res.redirect("/login");
  }
  const userId = user._id.toString();
  const userName = user.name;
  const userEmail = user.email;
  req.session.regenerate((regErr) => {
    if (regErr) {
      console.error(regErr);
      req.session.flash = {
        type: "error",
        text: "Could not start a session. Try again.",
      };
      return res.redirect("/login");
    }
    req.session.userId = userId;
    req.session.userName = userName;
    req.session.userEmail = userEmail;
    req.session.flash = { type: "success", text: `Signed in as ${userName}.` };
    res.redirect("/");
  });
});

router.post("/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";
  const confirmPassword = req.body.confirmPassword || "";

  if (password.length < 6) {
    req.session.flash = {
      type: "error",
      text: "Use a password of at least six characters.",
    };
    return res.redirect("/login?tab=signup");
  }
  if (password !== confirmPassword) {
    req.session.flash = {
      type: "error",
      text: "Password and confirmation did not match.",
    };
    return res.redirect("/login?tab=signup");
  }
  if (!name || !email) {
    req.session.flash = { type: "error", text: "Name and email are required." };
    return res.redirect("/login?tab=signup");
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });
    const userId = user._id.toString();
    const userName = user.name;
    const userEmail = user.email;
    req.session.regenerate((regErr) => {
      if (regErr) {
        console.error(regErr);
        req.session.flash = {
          type: "error",
          text: "Account created but session failed. Try signing in.",
        };
        return res.redirect("/login");
      }
      req.session.userId = userId;
      req.session.userName = userName;
      req.session.userEmail = userEmail;
      req.session.flash = { type: "success", text: "Account created. Welcome." };
      res.redirect("/");
    });
  } catch (err) {
    if (err && err.code === 11000) {
      req.session.flash = {
        type: "error",
        text: "An account with that email already exists. Try signing in.",
      };
      return res.redirect("/login?tab=signup");
    }
    console.error(err);
    req.session.flash = {
      type: "error",
      text: "Something went wrong creating the account. Try again.",
    };
    res.redirect("/login?tab=signup");
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect("/login");
  });
});

module.exports = router;
