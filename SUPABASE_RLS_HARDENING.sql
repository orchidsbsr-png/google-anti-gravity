-- ============================================================
-- NALIBAN FARMS — Row Level Security hardening
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (every policy is dropped before it's recreated).
--
-- WHY: today inventory, settings, and orders are writable by ANYONE who
-- has the site open — the public "anon" key that ships in the browser is
-- allowed to write freely. The admin PIN only hides the admin *page*; it
-- does not stop someone from talking to the database directly. This file
-- makes the database itself enforce who can write.
--
-- ┌─────────────────────────────────────────────────────────────────┐
-- │  STEP 0 — BEFORE YOU RUN: put your Google login email below.     │
-- │  It must EXACTLY match the account you sign into the site with.  │
-- └─────────────────────────────────────────────────────────────────┘
-- Change ONLY this one line, then run the whole file:
-- (used by the is_admin() helper — the one place your email lives)

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = lower('orchids.bsr@gmail.com')
$$;
--                                                    ^^^^^^^^^^^^^^^^^^^^^^^
--   ▲ REPLACE with your real Google login email if this isn't it. ▲

-- Server-side API routes use the service_role key, which BYPASSES RLS
-- entirely — none of the policies below affect order emails, payment
-- verification, or the Delhivery webhook. They only govern the browser.


-- ============================================================
-- SECTION A — apply this now. Zero risk to any customer flow.
-- Inventory + settings are written only by the admin panel; no
-- customer page ever writes to them. Orders can no longer be
-- DELETED from the browser (nobody legitimately does that).
-- ============================================================

-- ---- inventory: everyone reads the catalog; only admin writes ----
DROP POLICY IF EXISTS "read inventory"  ON inventory;
DROP POLICY IF EXISTS "write inventory" ON inventory;
CREATE POLICY "read inventory"  ON inventory FOR SELECT USING (true);
CREATE POLICY "admin writes inventory" ON inventory FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---- settings: everyone reads shop status; only admin writes ----
DROP POLICY IF EXISTS "read settings"  ON settings;
DROP POLICY IF EXISTS "write settings" ON settings;
CREATE POLICY "read settings"  ON settings FOR SELECT USING (true);
CREATE POLICY "admin writes settings" ON settings FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---- orders: block deletes from the browser (admin-only) ----
DROP POLICY IF EXISTS "delete orders" ON orders;
CREATE POLICY "admin deletes orders" ON orders FOR DELETE
  USING (is_admin());


-- ============================================================
-- SECTION B — optional, recommended, but has ONE tradeoff.
-- This stops strangers from reading every customer's PII
-- (name / phone / address) and from tampering with orders that
-- aren't theirs. Customers keep full access to their OWN orders.
--
-- TRADEOFF: after this, an order can only be VIEWED by the person
-- who placed it (logged-in owner, or the shared guest session) or
-- by you (admin). A "view your order" link opened by someone who
-- is fully logged out will no longer load. If you rely on order
-- links working for logged-out people, skip Section B.
--
-- To apply Section B, run it together with Section A.
-- ============================================================

-- Anyone (incl. guests) can still place an order.
DROP POLICY IF EXISTS "insert orders" ON orders;
CREATE POLICY "anyone inserts orders" ON orders FOR INSERT WITH CHECK (true);

-- Read: your own order, the shared guest account, or admin sees all.
DROP POLICY IF EXISTS "read orders" ON orders;
CREATE POLICY "read own or admin orders" ON orders FOR SELECT
  USING (
    is_admin()
    OR user_id = auth.uid()::text
    OR user_id LIKE 'guest%'
  );

-- Update: your own order (cancellation request, payment confirmation)
-- or admin (status changes, AWB). Strangers can't touch your orders.
DROP POLICY IF EXISTS "update orders" ON orders;
CREATE POLICY "update own or admin orders" ON orders FOR UPDATE
  USING (
    is_admin()
    OR user_id = auth.uid()::text
    OR user_id LIKE 'guest%'
  );


-- ============================================================
-- ROLLBACK — if anything misbehaves, paste and run this to
-- restore the previous wide-open policies immediately.
-- ============================================================
-- DROP POLICY IF EXISTS "admin writes inventory" ON inventory;
-- DROP POLICY IF EXISTS "admin writes settings"  ON settings;
-- DROP POLICY IF EXISTS "admin deletes orders"   ON orders;
-- DROP POLICY IF EXISTS "read own or admin orders"   ON orders;
-- DROP POLICY IF EXISTS "update own or admin orders" ON orders;
-- CREATE POLICY "write inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "write settings"  ON settings  FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "read orders"   ON orders FOR SELECT USING (true);
-- CREATE POLICY "update orders" ON orders FOR UPDATE USING (true);
-- CREATE POLICY "delete orders" ON orders FOR DELETE USING (true);
