-- ============================================================
-- MIGRATION: shipment tracking + push + abandoned-cart reminders
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- (Safe to re-run — everything is IF NOT EXISTS / idempotent.)
-- ============================================================

-- 1. AWB on orders — written by createDelhiveryShipment, read by the
--    Delhivery tracking webhook and the MyOrders tracking UI.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_number TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_awb ON orders (awb_number);

-- 2. Web-push subscriptions (one row per browser/device)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own push subscriptions" ON push_subscriptions;
CREATE POLICY "own push subscriptions" ON push_subscriptions FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- 3. Abandoned-cart reminder log (server-only via service role; no
--    client policies on purpose)
CREATE TABLE IF NOT EXISTS cart_reminders (
  user_id TEXT PRIMARY KEY,
  sent_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE cart_reminders ENABLE ROW LEVEL SECURITY;
