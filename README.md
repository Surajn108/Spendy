# Spendy (Expense Tracker)

A small **Express** app for logging income and expenses, with a dashboard summary and a searchable transaction list. The UI is server-rendered with **EJS**; data lives in **MongoDB** via **Mongoose**. **Accounts, sessions, and per-user data** are implemented with **bcrypt** and **express-session** (sessions stored in MongoDB via **connect-mongo**).

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or any MongoDB URI you can reach

## Setup

```bash
cd ExpenceTracker
npm install
```

Ensure MongoDB is listening (default in code is `mongodb://localhost:27017`).

## Configuration

| Variable          | Description                                      | Default                                      |
| ----------------- | ------------------------------------------------ | -------------------------------------------- |
| `MONGO_URI`       | MongoDB connection string                        | `mongodb://localhost:27017/exTr`             |
| `SESSION_SECRET`  | Secret used to sign the session cookie (set in production) | `spendy-dev-secret-change-me` (dev only) |
| `PORT`            | HTTP port                                        | `3000`                                       |
| `NODE_ENV`        | Set to `production` for secure cookies behind HTTPS | unset                                   |

Example:

```bash
export MONGO_URI="mongodb://127.0.0.1:27017/exTr"
export SESSION_SECRET="$(openssl rand -hex 32)"
npm start
```

## Run

```bash
npm start          # production-style: node app.js
npm run dev        # auto-restart on file changes (nodemon)
```

Then open **http://127.0.0.1:3000** (or your `PORT`). You will be redirected to **Sign in** until you create an account from the same page.

Optional helper (macOS opens the default browser after a short delay; run in a second terminal while the server is up):

```bash
bash scripts/open-spendy.sh
```

Override URL or delay:

```bash
SPENDY_URL=http://127.0.0.1:3000 SPENDY_OPEN_DELAY=3 bash scripts/open-spendy.sh
```

## Features

- **Sign up / sign in** (`/login`) — email and password; passwords hashed with bcrypt; session cookie after login.
- **Sign out** — POST `/auth/logout` from the nav.
- **Dashboard** (`/`) — totals for income, spending, and balance for the signed-in user only.
- **Transactions** (`/transactions`) — list scoped to the current user; optional search `?q=` (title or category).
- **Add / edit / delete** — same routes as before; each row stores an `owner` user id.

## Data model

- **User** — `name`, `email` (unique), `passwordHash`.
- **Transaction** — `owner` (required), `title`, `amount`, `IorE` (`income` | `expense`), optional `category`, `date`.

If you had **old transactions without `owner`** from a previous version, they will not show up for any user until you attach an owner in MongoDB (for example with `updateMany` in `mongosh`). New entries always get the current user as owner.

## Project layout

| Path                         | Role                                      |
| ---------------------------- | ----------------------------------------- |
| `app.js`                     | Express app, Mongo connect, session, dashboard |
| `routes/auth.js`             | Login, register, logout                   |
| `routes/transactions.js`     | Transaction CRUD and list search        |
| `middleware/requireAuth.js` | Redirects guests away from protected routes |
| `models/User.js`             | User schema                               |
| `models/Transaction.js`      | Transaction schema                        |
| `views/`                     | EJS templates and partials              |
| `public/css/style.css`       | App styling                               |

## License

ISC (see `package.json`).
