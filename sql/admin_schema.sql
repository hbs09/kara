-- =============================================================
-- Kara Admin Schema — colar no SQL Editor do Supabase Studio
-- =============================================================

-- 1. Stock nos produtos
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 10;

-- Stock inicial para os produtos existentes (ajusta os SKUs conforme os teus)
UPDATE public.products SET stock_quantity = 42, low_stock_threshold = 10 WHERE sku ILIKE '%TEE%' AND sku ILIKE '%HR%';
UPDATE public.products SET stock_quantity = 28, low_stock_threshold = 10 WHERE sku ILIKE '%SWT%';
UPDATE public.products SET stock_quantity = 8,  low_stock_threshold = 10 WHERE sku ILIKE '%TRS%' OR sku ILIKE '%PNT%';
UPDATE public.products SET stock_quantity = 0,  low_stock_threshold = 10 WHERE sku ILIKE '%KNT%';
UPDATE public.products SET stock_quantity = 65, low_stock_threshold = 10 WHERE sku ILIKE '%ACC%';
UPDATE public.products SET stock_quantity = 31, low_stock_threshold = 10 WHERE sku ILIKE '%COT%' OR sku ILIKE '%OUT%';
UPDATE public.products SET stock_quantity = 18, low_stock_threshold = 10 WHERE sku ILIKE '%HDY%' OR sku ILIKE '%CRW%';
-- Actualiza o resto que ficou a 0
UPDATE public.products SET stock_quantity = 20 WHERE stock_quantity = 0 AND sku NOT ILIKE '%KNT%';

-- 2. Email nos perfis (requer service role — corre via Supabase SQL Editor)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL;

-- 3. Actualizar products_full para incluir stock
DROP VIEW IF EXISTS public.products_full;
CREATE VIEW public.products_full AS
SELECT
  p.id, p.sku, p.name, p.slug, p.description, p.price, p.type,
  p.materials, p.weight, p.origin, p.sort_order, p.is_active,
  p.stock_quantity, p.low_stock_threshold,
  sub.slug  AS category_slug,  sub.label AS category_label,
  par.slug  AS gender_slug,    par.label AS gender_label,
  COALESCE(
    (SELECT json_agg(json_build_object('url', pi.url, 'alt', pi.alt) ORDER BY pi.sort_order)
     FROM product_images pi WHERE pi.product_id = p.id), '[]'
  ) AS images,
  COALESCE(
    (SELECT json_agg(DISTINCT pt.tag) FROM product_tags pt WHERE pt.product_id = p.id), '[]'
  ) AS tags,
  COALESCE(
    (SELECT json_agg(json_build_object('id', col.id, 'slug', col.slug, 'label', col.label, 'hex', col.hex) ORDER BY pc.sort_order)
     FROM product_colors pc JOIN colors col ON col.id = pc.color_id WHERE pc.product_id = p.id), '[]'
  ) AS colors,
  COALESCE(
    (SELECT json_agg(DISTINCT s.label ORDER BY s.label)
     FROM product_variants pv JOIN sizes s ON s.id = pv.size_id WHERE pv.product_id = p.id), '[]'
  ) AS sizes,
  COALESCE(
    (SELECT json_agg(DISTINCT s.label ORDER BY s.label)
     FROM product_variants pv JOIN sizes s ON s.id = pv.size_id
     WHERE pv.product_id = p.id AND pv.is_available = true), '[]'
  ) AS available_sizes,
  COALESCE((SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r WHERE r.product_id = p.id), 0) AS avg_rating,
  COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id), 0) AS review_count
FROM public.products p
LEFT JOIN public.categories sub ON sub.id = p.category_id
LEFT JOIN public.categories par ON par.id = sub.parent_id
WHERE p.is_active = true;

-- 4. Adicionar colunas que faltam à tabela orders existente
--    (a tabela orders já existe em kara_schema.sql)
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'paid' AFTER 'pending';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'unfulfilled'
    CHECK (fulfillment_status IN ('unfulfilled','fulfilled','on_hold','returned')),
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'web'
    CHECK (channel IN ('web','mobile','instagram','other'));

-- 5. Vista orders_full (usa os nomes reais das colunas da tabela orders)
CREATE OR REPLACE VIEW public.orders_full AS
SELECT
  o.id,
  o.order_ref,
  o.profile_id,
  o.email,
  o.email          AS guest_email,         -- alias para compatibilidade com o admin
  o.status::text,
  o.fulfillment_status,
  o.channel,
  o.subtotal,
  o.shipping_cost  AS shipping,
  o.tax,
  o.total,
  TRIM(COALESCE(o.ship_first_name,'') || ' ' || COALESCE(o.ship_last_name,'')) AS shipping_name,
  json_build_object(
    'address1', o.ship_address_1,
    'address2', o.ship_address_2,
    'city',     o.ship_city,
    'postal',   o.ship_postal,
    'country',  o.ship_country,
    'phone',    o.ship_phone
  ) AS shipping_address,
  o.notes,
  o.tracking_number,
  o.tracking_url,
  o.shipped_at,
  o.delivered_at,
  o.payment_method::text,
  o.payment_ref,
  o.created_at,
  o.updated_at,
  p.first_name,
  p.last_name,
  p.email AS profile_email,
  COALESCE(
    NULLIF(TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')), ''),
    o.email,
    'Guest'
  ) AS customer_name,
  COALESCE(SUM(oi.qty), 0)::int AS total_items,
  COUNT(oi.id)::int              AS line_count
FROM public.orders o
LEFT JOIN public.profiles    p  ON p.id = o.profile_id
LEFT JOIN public.order_items oi ON oi.order_id = o.id
GROUP BY
  o.id, o.order_ref, o.profile_id, o.email, o.status, o.fulfillment_status, o.channel,
  o.subtotal, o.shipping_cost, o.tax, o.total,
  o.ship_first_name, o.ship_last_name, o.ship_address_1, o.ship_address_2,
  o.ship_city, o.ship_postal, o.ship_country, o.ship_phone,
  o.notes, o.tracking_number, o.tracking_url, o.shipped_at, o.delivered_at,
  o.payment_method, o.payment_ref, o.created_at, o.updated_at,
  p.first_name, p.last_name, p.email;

-- 6. Políticas RLS para admin (as de cliente já existem em kara_schema.sql)
DROP POLICY IF EXISTS "admin_orders"      ON public.orders;
DROP POLICY IF EXISTS "admin_order_items" ON public.order_items;

CREATE POLICY "admin_orders" ON public.orders FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_order_items" ON public.order_items FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin pode gerir produtos (criar, editar, apagar)
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
DROP POLICY IF EXISTS "admin_manage_products" ON public.products;
CREATE POLICY "admin_manage_products" ON public.products FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin pode gerir cores e variantes dos produtos
DROP POLICY IF EXISTS "admin_manage_product_colors" ON public.product_colors;
CREATE POLICY "admin_manage_product_colors" ON public.product_colors FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_manage_product_variants" ON public.product_variants;
CREATE POLICY "admin_manage_product_variants" ON public.product_variants FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Role de admin nos perfis (se ainda não tiver sido feito)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'admin'));

-- Dar role de admin ao teu utilizador:
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'dev.henriquesousa@gmail.com');

-- 8. Imagens de produto (tabela + storage)
-- RLS: admin gere product_images
DROP POLICY IF EXISTS "admin_manage_product_images" ON public.product_images;
CREATE POLICY "admin_manage_product_images" ON public.product_images FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Leitura pública da tabela product_images
DROP POLICY IF EXISTS "public_read_product_images" ON public.product_images;
CREATE POLICY "public_read_product_images" ON public.product_images FOR SELECT
  USING (true);

-- Storage bucket "products" (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DROP POLICY IF EXISTS "storage_public_read_products"  ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_upload_products" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_delete_products" ON storage.objects;

CREATE POLICY "storage_public_read_products" ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "storage_admin_upload_products" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "storage_admin_delete_products" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. Pedidos de exemplo (descomenta para criar dados de teste)
/*
DO $$
DECLARE
  pid uuid := (SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 1);
  p1  uuid; p2 uuid; p3 uuid;
BEGIN
  INSERT INTO public.orders (profile_id, email, status, subtotal, shipping_cost, tax, total, channel)
  VALUES (pid, 'cliente@example.com', 'paid', 289.00, 15.00, 24.34, 328.34, 'web')
  RETURNING id INTO p1;
  INSERT INTO public.order_items (order_id, product_name, product_sku, size_label, qty, unit_price)
  VALUES (p1, 'T-Shirt Essentials', 'HR-TEE-001', 'M', 1, 289.00);

  INSERT INTO public.orders (profile_id, email, status, fulfillment_status, subtotal, shipping_cost, tax, total, channel)
  VALUES (pid, 'cliente@example.com', 'paid', 'unfulfilled', 158.00, 15.00, 13.27, 186.27, 'mobile')
  RETURNING id INTO p2;
  INSERT INTO public.order_items (order_id, product_name, product_sku, size_label, qty, unit_price)
  VALUES (p2, 'Sweatshirt Classic', 'HR-SWT-003', 'L', 1, 158.00);

  INSERT INTO public.orders (email, status, subtotal, shipping_cost, tax, total, channel)
  VALUES ('guest@example.com', 'pending', 320.00, 15.00, 26.88, 361.88, 'instagram')
  RETURNING id INTO p3;
  INSERT INTO public.order_items (order_id, product_name, product_sku, size_label, qty, unit_price)
  VALUES (p3, 'Calças Cargo', 'HR-TRS-005', '32', 2, 160.00);
END $$;
*/
