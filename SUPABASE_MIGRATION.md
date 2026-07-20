# Supabase Migration Guide

The app code is now **fully Supabase-native** — auth, orders, cart, addresses,
inventory, settings, and the payment-verification API all use Supabase.
Firebase is no longer imported anywhere (the old `src/firebase.js` file remains
but is dead code and can be deleted later along with the `firebase` npm package).

You need ~15 minutes in the Supabase dashboard to make it live.

---

## Step 1 — Create the project (2 min)

1. Go to https://supabase.com → Sign in (use your Google account) → **New project**.
2. Name: `farm-fresh` · Region: **Mumbai (ap-south-1)** (closest to your customers).
3. Set a strong database password (you won't need it day-to-day) → **Create**.

## Step 2 — Create the tables (1 min)

1. In the left sidebar: **SQL Editor** → **New query**.
2. Open the file `SUPABASE_SCHEMA.sql` from this project, copy ALL of it, paste, **Run**.
3. You should see "Success". This creates `orders`, `inventory`, `settings`,
   `addresses`, `carts`, enables Row Level Security, turns on Realtime,
   and seeds inventory for all 13 varieties.

## Step 3 — Enable Google login (5 min)

Supabase handles Google sign-in itself; you reuse the same Google account you
used for Firebase.

1. Supabase dashboard → **Authentication → Providers → Google** → Enable.
2. It shows you a **Callback URL** like
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` — copy it.
3. Go to https://console.cloud.google.com → APIs & Services → **Credentials**.
   - You already have an OAuth 2.0 Client from Firebase ("Web client").
   - Open it → under **Authorized redirect URIs** → Add the Supabase callback
     URL from step 2 → Save.
   - Copy the **Client ID** and **Client Secret**.
4. Paste Client ID + Secret into the Supabase Google provider form → Save.
5. Supabase dashboard → **Authentication → URL Configuration**:
   - Site URL: your production URL (e.g. `https://your-app.vercel.app`)
   - Additional Redirect URLs: `http://localhost:5173`, `http://localhost:5174`

## Step 4 — Copy the keys (1 min)

Supabase dashboard → **Project Settings → API**:

- **Project URL** → goes in two places
- **anon / public key** → client key (safe to expose)
- **service_role key** → SERVER ONLY, never in client code

### Local: edit `.env`
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```
Restart `npm run dev` after saving.

### Production: Vercel → Project → Settings → Environment Variables
```
VITE_SUPABASE_URL          = https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY     = eyJ...anon...
SUPABASE_URL               = https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = eyJ...service-role...
```
Then redeploy. The old `VITE_FIREBASE_*` and `FIREBASE_SERVICE_ACCOUNT_JSON`
vars can be deleted after you confirm everything works.

## Step 5 — Verify (2 min)

1. `npm run dev` → open the app.
2. Log in with Google → should redirect and come back signed in.
3. Add a product to the cart → check Supabase **Table Editor → carts** (row appears).
4. Save an address in Profile → check `addresses`.
5. Place a COD test order → check `orders`.
6. Open `/admin` → orders list shows; change a status → the row updates live.

---

## What changed in the code

| Before (Firebase) | After (Supabase) |
|---|---|
| `src/firebase.js` | `src/supabase.js` |
| Firebase Auth Google popup | `supabase.auth.signInWithOAuth` (redirect) |
| Firestore `users/{uid}/cart` docs | `carts` table (jsonb rows) |
| Firestore `users/{uid}/addresses` | `addresses` table |
| Firestore `inventory` + `settings/shop` | `inventory` + `settings` tables |
| Firestore `orders` | `orders` table (UUID ids) |
| `onSnapshot` realtime | Supabase Realtime channels + refetch |
| `api/_lib/firebase_admin.js` | `api/_lib/supabase_admin.js` |

Bonus fixes made during migration:
- `api/verify_payment.js` was missing the Razorpay **signature comparison**
  (it computed the HMAC but never checked it) and had unbalanced braces.
  It now rejects invalid signatures and marks orders paid **server-side**.

## Notes

- **Guest mode** still works exactly as before (shared `guest_123` account).
- **Old Firestore data**: existing orders in Firebase are not auto-copied.
  If you need them, export from Firebase console → I can write an import
  script into the `orders` table.
- **Admin security**: the admin PIN is now verified server-side
  (`/api/admin_auth`, PIN in the `ADMIN_PIN` env var — no longer in the
  browser bundle). To also stop direct database tampering with the public
  key, run `SUPABASE_RLS_HARDENING.sql` in the SQL editor — it ties
  inventory/settings/order writes to your Google login. Requirement: be
  signed in with the owner Google account when using the admin panel.
- The `functions/` folder (Firebase Cloud Functions) appears unused by the
  app (Vercel `api/` does the work) and can be deleted in a cleanup pass.
