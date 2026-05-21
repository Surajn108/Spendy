const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

function normalizeIorE(value) {
  if (value === "expence") return "expense";
  return value;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ownerId(req) {
  return req.session.userId;
}

// View all transactions (optional ?q= title/category filter)
router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const owner = ownerId(req);
  const filter = { owner };
  if (q) {
    filter.$or = [
      { title: new RegExp(escapeRegex(q), "i") },
      { category: new RegExp(escapeRegex(q), "i") },
    ];
  }
  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.render("transactions/index", {
    transactions,
    searchQuery: q || "",
  });
});

// Add form
router.get("/add", (req, res) => res.render("transactions/add"));

// Add transaction
router.post("/add", async (req, res) => {
  const { title, amount, IorE, category, date } = req.body;
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) {
    return res.status(400).send("Invalid amount");
  }
  await new Transaction({
    title,
    amount: n,
    IorE: normalizeIorE(IorE),
    category,
    date: date || undefined,
    owner: ownerId(req),
  }).save();
  res.redirect("/transactions");
});

// Edit form
router.get("/:id/edit", async (req, res) => {
  const txn = await Transaction.findOne({
    _id: req.params.id,
    owner: ownerId(req),
  });
  if (!txn) {
    return res.status(404).send("Not found");
  }
  res.render("transactions/edit", { txn });
});

// Update
router.post("/:id/edit", async (req, res) => {
  const { title, amount, IorE, category, date } = req.body;
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) {
    return res.status(400).send("Invalid amount");
  }
  const updated = await Transaction.findOneAndUpdate(
    { _id: req.params.id, owner: ownerId(req) },
    {
      title,
      amount: n,
      IorE: normalizeIorE(IorE),
      category,
      date: date || undefined,
    },
    { new: false }
  );
  if (!updated) {
    return res.status(404).send("Not found");
  }
  res.redirect("/transactions");
});

// Delete
router.post("/:id/delete", async (req, res) => {
  const deleted = await Transaction.findOneAndDelete({
    _id: req.params.id,
    owner: ownerId(req),
  });
  if (!deleted) {
    return res.status(404).send("Not found");
  }
  res.redirect("/transactions");
});

module.exports = router;
