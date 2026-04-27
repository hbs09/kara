-- =============================================================
-- Kara Admin Schema — colar no SQL Editor do Supabase Studio
-- =============================================================

-- 1. Stock nos produtos
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity   integer NOT NULL DEFAULT 0,
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

-- 2. Email nos perfis (opcional mas útil)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- Preenche email a partir dos dados de auth.users (requer service role — corre via Supabase SQL Editor)
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
    (SELECT json_agg(json_build_object('slug', pc.slug, 'label', pc.label, 'hex', pc.hex) ORDER BY pc.sort_order)
     FROM product_colors pc WHERE pc.product_id = p.id), '[]'
  ) AS colors,
  COALESCE(
    (SELECT json_agg(s ORDER BY s.sort_order) FROM product_sizes s WHERE s.product_id = p.id), '[]'
  ) AS sizes,
  COALESCE(
    (SELECT json_agg(DISTINCT ps.size_label) FROM product_sizes ps
     WHERE ps.product_id = p.id AND ps.is_available = true), '[]'
  ) AS available_sizes,
  COALESCE((SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r WHERE r.product_id = p.id), 0) AS avg_rating,
  COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id), 0) AS review_count
FROM public.products p
LEFT JOIN public.categories sub ON sub.id = p.category_id
LEFT JOIN public.categories par ON par.id = sub.parent_id
WHERE p.is_active = true;

-- 4. Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email        text,
  status             text        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','paid','cancelled','refunded')),
  fulfillment_status text        NOT NULL DEFAULT 'unfulfilled'
                                 CHECK (fulfillment_status IN ('unfulfilled','fulfilled','on_hold','returned')),
  channel            text        NOT NULL DEFAULT 'web'
                                 CHECK (channel IN ('web','mobile','instagram','other')),
  subtotal           numeric(10,2) NOT NULL DEFAULT 0,
  shipping           numeric(10,2) NOT NULL DEFAULT 0,
  tax                numeric(10,2) NOT NULL DEFAULT 0,
  total              numeric(10,2) NOT NULL DEFAULT 0,
  shipping_name      text,
  shipping_address   jsonb,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- 5. Itens de pedido
CREATE TABLE IF NOT EXISTS public.order_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   uuid        REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text        NOT NULL,
  product_sku  text,
  size         text,
  quantity     integer     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   numeric(10,2) NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 6. Vista orders_full (agrega itens + dados do cliente)
CREATE OR REPLACE VIEW public.orders_full AS
SELECT
  o.id, o.profile_id, o.guest_email, o.status, o.fulfillment_status, o.channel,
  o.subtotal, o.shipping, o.tax, o.total,
  o.shipping_name, o.shipping_address, o.notes,
  o.created_at, o.updated_at,
  p.first_name, p.last_name, p.email AS profile_email,
  COALESCE(NULLIF(TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')), ''),
           o.guest_email, 'Guest') AS customer_name,
  COALESCE(SUM(oi.quantity), 0)::int AS total_items,
  COUNT(oi.id)::int                  AS line_count
FROM public.orders o
LEFT JOIN public.profiles    p  ON p.id  = o.profile_id
LEFT JOIN public.order_items oi ON oi.order_id = o.id
GROUP BY o.id, p.first_name, p.last_name, p.email;

-- 7. RLS
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Admin vê e faz tudo
DROP POLICY IF EXISTS "admin_orders"      ON public.orders;
DROP POLICY IF EXISTS "admin_order_items" ON public.order_items;

CREATE POLICY "admin_orders" ON public.orders FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_order_items" ON public.order_items FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Clientes vêem os seus próprios pedidos
DROP POLICY IF EXISTS "own_orders_select"      ON public.orders;
DROP POLICY IF EXISTS "own_orders_insert"      ON public.orders;
DROP POLICY IF EXISTS "own_order_items_select" ON public.order_items;

CREATE POLICY "own_orders_select" ON public.orders
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "own_orders_insert" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

CREATE POLICY "own_order_items_select" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND profile_id = auth.uid()));

-- Admin pode actualizar stock de produtos
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admin_update_products" ON public.products
  FOR UPDATE TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. Pedidos de exemplo (descomenta e substitui o profile_id pelo teu UUID real)
-- SELECT id FROM auth.users LIMIT 5;  -- para ver os IDs disponíveis

/*
DO $$
DECLARE
  pid uuid := (SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 1);
  p1  uuid; p2 uuid; p3 uuid;
BEGIN
  -- Pedido 1
  INSERT INTO public.orders (profile_id, status, fulfillment_status, channel, subtotal, shipping, tax, total)
  VALUES (pid, 'paid', 'fulfilled', 'web', 289.00, 15.00, 24.34, 328.34)
  RETURNING id INTO p1;
  INSERT INTO public.order_items (order_id, product_name, product_sku, size, quantity, unit_price)
  VALUES (p1, 'T-Shirt Essentials', 'HR-TEE-001', 'M', 1, 289.00);

  -- Pedido 2
  INSERT INTO public.orders (profile_id, status, fulfillment_status, channel, subtotal, shipping, tax, total)
  VALUES (pid, 'paid', 'unfulfilled', 'mobile', 158.00, 15.00, 13.27, 186.27)
  RETURNING id INTO p2;
  INSERT INTO public.order_items (order_id, product_name, product_sku, size, quantity, unit_price)
  VALUES (p2, 'Sweatshirt Classic', 'HR-SWT-003', 'L', 1, 158.00);

  -- Pedido 3 (guest)
  INSERT INTO public.orders (guest_email, status, fulfillment_status, channel, subtotal, shipping, tax, total)
  VALUES ('guest@example.com', 'pending', 'unfulfilled', 'instagram', 320.00, 15.00, 26.88, 361.88)
  RETURNING id INTO p3;
  INSERT INTO public.order_items (order_id, product_name, product_sku, size, quantity, unit_price)
  VALUES (p3, 'Calças Cargo', 'HR-TRS-005', '32', 2, 160.00);
END $$;
*/
