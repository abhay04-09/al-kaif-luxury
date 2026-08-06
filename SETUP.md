# AL-KAIFF — Setup Guide

The project is now two parts:

```
AL-KAIFF/
├── frontend/   React + Vite customer storefront   → deploys to Cloudflare Pages
├── admin/      Standalone admin panel app         → deploys to Cloudflare Pages (separate site)
└── backend/    Hono API on Cloudflare Workers     → talks to Supabase + R2 + Razorpay
```

Everything below is on **free tiers**. You need three accounts: Cloudflare, Supabase, Razorpay.

---

## 1. Supabase (database)

1. Go to https://supabase.com → create a free account → **New project** (pick a region close to you, e.g. Mumbai).
2. Once the project is created, open **SQL Editor → New query**, paste the entire contents of `backend/schema.sql`, and click **Run**. This creates all the tables.
3. Go to **Project Settings → API** and copy two values:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **service_role key** (under "Project API keys" — this is secret, never put it in frontend code)

## 2. Razorpay (payments)

1. Sign up at https://razorpay.com → complete KYC for live payments (test mode works immediately without KYC).
2. Go to **Account & Settings → API Keys → Generate Test Key**.
3. Copy the **Key ID** (`rzp_test_...`) and **Key Secret**.
4. When you're ready for real money, generate Live keys and replace them.

## 3. Backend — run locally first

```bash
cd backend
npm install
copy .dev.vars.example .dev.vars
```

Open `.dev.vars` in a text editor and fill in:

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — from step 1
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — from step 2
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — the login you'll use for the admin panel

Then start it:

```bash
npm run dev        # API runs at http://localhost:8787
```

**One-time initialization** (creates your admin account + seeds the product catalogue). In another terminal:

```bash
curl -X POST http://localhost:8787/api/setup/init
```

## 4. Frontend — run locally

```bash
cd frontend
npm install
npm run dev        # site runs at http://localhost:5173 (or 3000)
```

The dev server automatically forwards `/api/...` calls to the backend on port 8787, so run both at the same time.

## 4b. Admin panel — run locally

```bash
cd admin
npm install
npm run dev        # admin panel runs at http://localhost:5175
```

Log in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Only accounts with the admin role can get in. It has: Dashboard (revenue/orders/products/subscriber stats), Products (add/edit/delete with photo upload to R2), Orders (status updates), and Subscribers (newsletter list).

## 5. Deploy the backend to Cloudflare Workers

```bash
cd backend
npx wrangler login                                  # opens browser, sign in to Cloudflare
npx wrangler r2 bucket create al-kaiff-images       # one-time: create the image bucket
npx wrangler deploy
```

Then set the production secrets (each command prompts you to paste the value):

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
```

Deploy again so the secrets take effect, then initialize production once:

```bash
npx wrangler deploy
curl -X POST https://al-kaiff-api.YOUR-SUBDOMAIN.workers.dev/api/setup/init
```

(The deploy output prints your real Worker URL.)

## 6. Deploy the frontend to Cloudflare Pages

1. Push the project to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add an **environment variable**:
   - `VITE_API_URL` = `https://al-kaiff-api.YOUR-SUBDOMAIN.workers.dev`
5. Deploy. Your shop is live.

## 7. Deploy the admin panel to Cloudflare Pages

Same as step 6, but create a **second** Pages project from the same repo:

- **Root directory:** `admin`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- Environment variable `VITE_API_URL` = your Worker URL

This gives the admin panel its own private URL (e.g. `al-kaiff-admin.pages.dev`) separate from the shop.

---

## What the backend provides

| Endpoint | Who | What |
|---|---|---|
| `POST /api/auth/register`, `/api/auth/login`, `GET /api/auth/me` | public | Real accounts — passwords hashed (PBKDF2), JWT sessions |
| `GET /api/products` (+ filters), `GET /api/products/:id` | public | Catalogue from Supabase |
| `POST/PUT/DELETE /api/products/:id` | admin only | Product management |
| `GET /api/orders` | signed in | Customers see their own orders; admin sees all |
| `POST /api/orders` | public | Places an order — totals are recomputed server-side so prices can't be tampered with; Razorpay signature verified before marking Paid |
| `PUT /api/orders/:id/status` | admin only | Order status updates |
| `POST /api/payments/razorpay/order` | public | Creates a real Razorpay payment order |
| `POST /api/uploads`, `GET /api/images/*` | admin / public | Product photo upload to R2 + serving with long cache |
| `POST /api/newsletter` | public | Newsletter signups |
| `GET /api/newsletter` | admin only | List newsletter subscribers |
| `POST /api/setup/init` | one-time | Creates admin user + seeds products if empty |

## Notes

- The old fake logins are gone: "Demo admin", Google button, and OTP were removed. Admin access now requires the real password.
- `.dev.vars` holds your secrets locally — it is git-ignored. Never commit it.
- Free-tier limits: Workers 100k requests/day, R2 10 GB storage, Supabase 500 MB database — plenty for launch.
