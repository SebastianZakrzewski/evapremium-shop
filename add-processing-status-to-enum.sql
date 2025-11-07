-- Add 'processing' status to abandoned_cart_status enum
-- This allows carts to be locked during deal creation to prevent duplicates

ALTER TYPE abandoned_cart_status ADD VALUE IF NOT EXISTS 'processing';



