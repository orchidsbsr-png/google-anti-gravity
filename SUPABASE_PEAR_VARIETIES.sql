-- ============================================================
-- MIGRATION: new pear lineup (variety_ids 5-8)
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- (Safe to re-run — it only sets values, never creates anything.)
-- ============================================================
--
-- The pear varieties changed in src/data/mockData.js:
--
--   id 5:  Nashpati Pear  →  Red Bartlett   ₹399/kg
--   id 6:  Bosc Pear      →  Packham        ₹349/kg
--   id 7:  Concorde Pear  →  Bergamot       ₹379/kg
--   id 8:  Red Max        →  Tumba          ₹249/kg
--
-- Variety NAMES live in the app bundle, not the database — the only
-- thing Supabase holds per variety is price/stock/flags in `inventory`.
-- So all this migration does is put the right price on ids 5-8.
--
-- Note: pack prices are cached inside the pack_sizes jsonb, so they
-- have to be recomputed too — a stale pack price is what customers
-- actually get charged. Existing stock and pack weights are preserved.

UPDATE inventory
SET
  price_per_kg = v.price,
  pack_sizes = (
    SELECT jsonb_agg(
      jsonb_set(pack, '{price}', to_jsonb((pack->>'weight')::numeric * v.price))
      ORDER BY (pack->>'weight')::numeric
    )
    FROM jsonb_array_elements(inventory.pack_sizes) AS pack
  ),
  updated_at = NOW()
FROM (VALUES
  (5, 399::numeric),  -- Red Bartlett
  (6, 349::numeric),  -- Packham
  (7, 379::numeric),  -- Bergamot
  (8, 249::numeric)   -- Tumba
) AS v(variety_id, price)
WHERE inventory.variety_id = v.variety_id;

-- Check the result — four rows, prices matching the comments above.
SELECT variety_id, price_per_kg, is_active, is_bestseller, pack_sizes
FROM inventory
WHERE variety_id BETWEEN 5 AND 8
ORDER BY variety_id;


-- ------------------------------------------------------------
-- OPTIONAL: these are new fruit, so last season's pear stock
-- counts are meaningless. Run this only if you want to zero them
-- and re-enter real numbers in the admin panel.
-- ------------------------------------------------------------
-- UPDATE inventory
-- SET pack_sizes = (
--       SELECT jsonb_agg(jsonb_set(pack, '{stock}', '0'::jsonb)
--                        ORDER BY (pack->>'weight')::numeric)
--       FROM jsonb_array_elements(inventory.pack_sizes) AS pack
--     ),
--     updated_at = NOW()
-- WHERE variety_id BETWEEN 5 AND 8;


-- ------------------------------------------------------------
-- OPTIONAL: if one of the old pears was flagged "bestseller",
-- that badge now sits on a fruit nobody has tasted yet.
-- ------------------------------------------------------------
-- UPDATE inventory SET is_bestseller = false WHERE variety_id BETWEEN 5 AND 8;
