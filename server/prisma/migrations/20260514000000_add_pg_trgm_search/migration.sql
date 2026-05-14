-- Phase 9: Enable trigram fuzzy search on the products table.
--
-- This migration is safe to re-run because every statement uses IF NOT EXISTS.
-- Run with:
--   npx prisma migrate deploy        (production)
--   npx prisma migrate dev           (development)
--
-- If you previously used `prisma db push`, first initialize migration history:
--   npx prisma migrate dev --name init --create-only
--   npx prisma migrate resolve --applied init

-- Enable the trigram extension on the connected database.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on product name — accelerates `similarity(name, $1)` queries.
CREATE INDEX IF NOT EXISTS products_name_trgm_idx
  ON products USING GIN (name gin_trgm_ops);

-- GIN index on description — supports broader fuzzy matching.
CREATE INDEX IF NOT EXISTS products_description_trgm_idx
  ON products USING GIN (description gin_trgm_ops);
