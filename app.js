const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/exTr";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "spendy-dev-secret-change-me";
const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      touchAfter: 24 * 3600,
    }),
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? {
        name: req.session.userName,
        email: req.session.userEmail,
      }
    : null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

const Transaction = require("./models/Transaction");
const requireAuth = require("./middleware/requireAuth");

app.use(require("./routes/auth"));

app.use("/transactions", requireAuth, require("./routes/transactions"));

app.get("/", requireAuth, async (req, res) => {
  const owner = req.session.userId;
  const transactions = await Transaction.find({ owner }).lean();
  let income = 0;
  let expense = 0;

  transactions.forEach((txn) => {
    if (txn.IorE === "income") income += txn.amount;
    else if (txn.IorE === "expense" || txn.IorE === "expence") expense += txn.amount;
  });

  res.render("dashboard", {
    income,
    expense,
    balance: income - expense,
    transactions,
  });
});

async function main() {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
