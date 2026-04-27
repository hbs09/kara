-- ============================================================
-- KARA — Supabase Schema Completo
-- Loja de roupa minimalista / essenciais premium
-- ============================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================

-- Categorias de produtos
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  description text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- Produtos
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  sku         text unique not null,
  name        text not null,
  slug        text unique not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  type        text,                -- 'T-Shirt', 'Sweatshirt', 'Trouser', etc.
  weight      text,                -- '320 GSM', '14 oz', etc.
  origin      text,                -- 'Portugal', 'Japan', etc.
  materials   text[],              -- ['100% Organic Cotton']
  is_active   boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Imagens de produtos
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- Tags de produtos (New, Best Seller, Limited, etc.)
create table public.product_tags (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  tag         text not null,
  unique(product_id, tag)
);

-- Cores disponíveis globalmente
create table public.colors (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  hex         text not null,
  sort_order  int default 0
);

-- Cores por produto
create table public.product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  color_id    uuid not null references public.colors(id) on delete cascade,
  sort_order  int default 0,
  unique(product_id, color_id)
);

-- Tamanhos disponíveis
create table public.sizes (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  sort_order  int default 0
);

-- Variantes de produto (sku + cor + tamanho + stock)
create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  color_id    uuid references public.colors(id) on delete set null,
  size_id     uuid references public.sizes(id) on delete set null,
  stock       int not null default 0 check (stock >= 0),
  is_available boolean generated always as (stock > 0) stored,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(product_id, color_id, size_id)
);

-- ============================================================
-- UTILIZADORES / AUTENTICAÇÃO
-- ============================================================

-- Perfis de clientes (extende auth.users do Supabase)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text,
  last_name     text,
  phone         text,
  customer_ref  text unique default 'KR-' || extract(year from now())::text || '-' || floor(random()*9000+1000)::text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Moradas
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  label       text default 'Principal',      -- 'Principal', 'Faturação', etc.
  first_name  text,
  last_name   text,
  address_1   text not null,
  address_2   text,
  city        text not null,
  postal_code text not null,
  country     text not null default 'Portugal',
  phone       text,
  is_default  boolean default false,
  is_billing  boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- CARRINHO
-- ============================================================

-- Sessões de carrinho (anónimos + autenticados)
create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles(id) on delete set null,
  session_id  text,               -- para utilizadores anónimos
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  variant_id  uuid not null references public.product_variants(id) on delete cascade,
  qty         int not null default 1 check (qty > 0),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(cart_id, variant_id)
);

-- ============================================================
-- WISHLIST
-- ============================================================

create table public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(profile_id, product_id)
);

-- ============================================================
-- ENCOMENDAS
-- ============================================================

create type public.order_status as enum (
  'pending',        -- aguarda confirmação pagamento
  'confirmed',      -- pagamento confirmado
  'processing',     -- em preparação
  'shipped',        -- enviado
  'delivered',      -- entregue
  'cancelled',      -- cancelado
  'refunded'        -- reembolsado
);

create type public.payment_method as enum (
  'card',
  'paypal',
  'mbway',
  'multibanco'
);

create type public.shipping_method as enum (
  'standard',
  'express',
  'pickup'
);

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_ref       text unique not null default 'KR-' || floor(random()*900000+100000)::text,
  profile_id      uuid references public.profiles(id) on delete set null,
  email           text not null,
  status          public.order_status default 'pending',

  -- Morada de entrega (snapshot no momento da encomenda)
  ship_first_name text,
  ship_last_name  text,
  ship_address_1  text,
  ship_address_2  text,
  ship_city       text,
  ship_postal     text,
  ship_country    text default 'Portugal',
  ship_phone      text,

  -- Morada de faturação
  bill_same_as_ship boolean default true,
  bill_address_1  text,
  bill_city       text,
  bill_postal     text,
  bill_country    text,

  -- Envio e pagamento
  shipping_method public.shipping_method default 'standard',
  shipping_cost   numeric(10,2) default 0,
  payment_method  public.payment_method default 'card',
  payment_ref     text,           -- referência externa (ex: Stripe PI)

  -- Valores
  subtotal        numeric(10,2) not null default 0,
  discount        numeric(10,2) default 0,
  tax             numeric(10,2) default 0,
  total           numeric(10,2) not null default 0,

  -- Notas
  notes           text,
  coupon_code     text,

  -- Tracking
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  tracking_number text,
  tracking_url    text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  variant_id  uuid references public.product_variants(id) on delete set null,

  -- Snapshot do produto no momento da compra
  product_name  text not null,
  product_sku   text not null,
  color_label   text,
  size_label    text,
  image_url     text,

  qty           int not null default 1 check (qty > 0),
  unit_price    numeric(10,2) not null,
  total_price   numeric(10,2) generated always as (qty * unit_price) stored,
  created_at    timestamptz default now()
);

-- ============================================================
-- CUPÕES DE DESCONTO
-- ============================================================

create type public.coupon_type as enum ('percentage', 'fixed');

create table public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  description     text,
  type            public.coupon_type default 'percentage',
  value           numeric(10,2) not null,  -- % ou € fixo
  min_order       numeric(10,2) default 0,
  max_uses        int,
  used_count      int default 0,
  is_active       boolean default true,
  expires_at      timestamptz,
  created_at      timestamptz default now()
);

-- ============================================================
-- NEWSLETTER
-- ============================================================

create table public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  first_name  text,
  profile_id  uuid references public.profiles(id) on delete set null,
  is_active   boolean default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- ============================================================
-- AVALIAÇÕES
-- ============================================================

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete set null,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean default false,  -- compra verificada
  is_approved boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- ENVIOS (métodos e preços)
-- ============================================================

create table public.shipping_options (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  description text,
  price       numeric(10,2) not null default 0,
  free_above  numeric(10,2),       -- grátis acima deste valor
  estimated_days_min int,
  estimated_days_max int,
  is_active   boolean default true,
  sort_order  int default 0
);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_products_category on public.products(category_id);
create index idx_products_active on public.products(is_active);
create index idx_products_slug on public.products(slug);
create index idx_variants_product on public.product_variants(product_id);
create index idx_variants_available on public.product_variants(is_available);
create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_orders_profile on public.orders(profile_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_ref on public.orders(order_ref);
create index idx_wishlists_profile on public.wishlists(profile_id);

-- ============================================================
-- TRIGGERS — updated_at automático
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_carts_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

-- Trigger para criar perfil automaticamente ao registar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS em todas as tabelas com dados de utilizador
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- Tabelas públicas (produtos, categorias, etc.)
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_tags enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_variants enable row level security;
alter table public.colors enable row level security;
alter table public.sizes enable row level security;
alter table public.shipping_options enable row level security;

-- Políticas: produtos (leitura pública)
create policy "Produtos visíveis publicamente"
  on public.products for select using (is_active = true);

create policy "Categorias visíveis publicamente"
  on public.categories for select using (true);

create policy "Imagens visíveis publicamente"
  on public.product_images for select using (true);

create policy "Tags visíveis publicamente"
  on public.product_tags for select using (true);

create policy "Cores de produto visíveis publicamente"
  on public.product_colors for select using (true);

create policy "Variantes visíveis publicamente"
  on public.product_variants for select using (true);

create policy "Cores visíveis publicamente"
  on public.colors for select using (true);

create policy "Tamanhos visíveis publicamente"
  on public.sizes for select using (true);

create policy "Envios visíveis publicamente"
  on public.shipping_options for select using (is_active = true);

-- Políticas: perfis
create policy "Utilizadores veem o seu perfil"
  on public.profiles for select using (auth.uid() = id);

create policy "Utilizadores editam o seu perfil"
  on public.profiles for update using (auth.uid() = id);

-- Políticas: moradas
create policy "Utilizadores veem as suas moradas"
  on public.addresses for select using (auth.uid() = profile_id);

create policy "Utilizadores gerem as suas moradas"
  on public.addresses for all using (auth.uid() = profile_id);

-- Políticas: carrinhos
create policy "Utilizadores veem o seu carrinho"
  on public.carts for select using (auth.uid() = profile_id);

create policy "Utilizadores gerem o seu carrinho"
  on public.carts for all using (auth.uid() = profile_id);

create policy "Itens do carrinho visíveis ao dono"
  on public.cart_items for select
  using (exists (
    select 1 from public.carts
    where id = cart_items.cart_id and profile_id = auth.uid()
  ));

create policy "Utilizadores gerem itens do seu carrinho"
  on public.cart_items for all
  using (exists (
    select 1 from public.carts
    where id = cart_items.cart_id and profile_id = auth.uid()
  ));

-- Políticas: wishlist
create policy "Utilizadores veem a sua wishlist"
  on public.wishlists for select using (auth.uid() = profile_id);

create policy "Utilizadores gerem a sua wishlist"
  on public.wishlists for all using (auth.uid() = profile_id);

-- Políticas: encomendas
create policy "Utilizadores veem as suas encomendas"
  on public.orders for select using (auth.uid() = profile_id);

create policy "Utilizadores criam encomendas"
  on public.orders for insert with check (auth.uid() = profile_id);

create policy "Itens de encomenda visíveis ao dono"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where id = order_items.order_id and profile_id = auth.uid()
  ));

-- Políticas: avaliações
create policy "Avaliações aprovadas visíveis publicamente"
  on public.reviews for select using (is_approved = true);

create policy "Utilizadores criam avaliações"
  on public.reviews for insert with check (auth.uid() = profile_id);

create policy "Utilizadores editam as suas avaliações"
  on public.reviews for update using (auth.uid() = profile_id);

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- Vista de produtos com dados completos
create or replace view public.products_full as
select
  p.id,
  p.sku,
  p.name,
  p.slug,
  p.description,
  p.price,
  p.type,
  p.weight,
  p.origin,
  p.materials,
  p.is_active,
  p.sort_order,
  p.created_at,
  c.slug  as category_slug,
  c.label as category_label,
  coalesce(
    (select json_agg(pi2 order by pi2.sort_order)
     from public.product_images pi2 where pi2.product_id = p.id),
    '[]'::json
  ) as images,
  coalesce(
    (select json_agg(pt.tag)
     from public.product_tags pt where pt.product_id = p.id),
    '[]'::json
  ) as tags,
  coalesce(
    (select json_agg(
       json_build_object(
         'id', col.id,
         'slug', col.slug,
         'label', col.label,
         'hex', col.hex
       ) order by pc.sort_order
     )
     from public.product_colors pc
     join public.colors col on col.id = pc.color_id
     where pc.product_id = p.id),
    '[]'::json
  ) as colors,
  coalesce(
    (select json_agg(distinct s.label order by s.label)
     from public.product_variants pv
     join public.sizes s on s.id = pv.size_id
     where pv.product_id = p.id),
    '[]'::json
  ) as sizes,
  coalesce(
    (select json_agg(distinct s.label order by s.label)
     from public.product_variants pv
     join public.sizes s on s.id = pv.size_id
     where pv.product_id = p.id and pv.is_available = true),
    '[]'::json
  ) as available_sizes,
  (select round(avg(rating), 1) from public.reviews r where r.product_id = p.id and r.is_approved) as avg_rating,
  (select count(*) from public.reviews r where r.product_id = p.id and r.is_approved) as review_count
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true;

-- Vista de encomendas com totais
create or replace view public.orders_summary as
select
  o.*,
  p.first_name || ' ' || p.last_name as customer_name,
  (select count(*) from public.order_items oi where oi.order_id = o.id) as item_count
from public.orders o
left join public.profiles p on p.id = o.profile_id;

-- ============================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================

-- Calcular total do carrinho
create or replace function public.cart_total(p_cart_id uuid)
returns numeric language sql stable as $$
  select coalesce(sum(pr.price * ci.qty), 0)
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  join public.products pr on pr.id = pv.product_id
  where ci.cart_id = p_cart_id;
$$;

-- Converter carrinho em encomenda
create or replace function public.checkout_cart(
  p_cart_id       uuid,
  p_email         text,
  p_ship_fname    text,
  p_ship_lname    text,
  p_ship_address  text,
  p_ship_city     text,
  p_ship_postal   text,
  p_ship_country  text default 'Portugal',
  p_ship_phone    text default null,
  p_ship_method   public.shipping_method default 'standard',
  p_pay_method    public.payment_method default 'card',
  p_notes         text default null,
  p_coupon        text default null
)
returns uuid language plpgsql security definer as $$
declare
  v_order_id    uuid;
  v_subtotal    numeric;
  v_ship_cost   numeric;
  v_discount    numeric := 0;
  v_total       numeric;
  v_profile_id  uuid;
  v_coupon      public.coupons%rowtype;
begin
  -- Obter perfil do carrinho
  select profile_id into v_profile_id
  from public.carts where id = p_cart_id;

  -- Calcular subtotal
  v_subtotal := public.cart_total(p_cart_id);

  -- Custo de envio
  select price into v_ship_cost
  from public.shipping_options
  where slug = p_ship_method::text and is_active = true
  limit 1;

  -- Aplicar envio gratuito se elegível
  if p_ship_method = 'standard' and v_subtotal >= 120 then
    v_ship_cost := 0;
  end if;

  -- Aplicar cupão
  if p_coupon is not null then
    select * into v_coupon from public.coupons
    where code = upper(p_coupon)
      and is_active = true
      and (expires_at is null or expires_at > now())
      and (max_uses is null or used_count < max_uses)
      and min_order <= v_subtotal;

    if found then
      if v_coupon.type = 'percentage' then
        v_discount := round(v_subtotal * v_coupon.value / 100, 2);
      else
        v_discount := least(v_coupon.value, v_subtotal);
      end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    end if;
  end if;

  v_total := v_subtotal + coalesce(v_ship_cost, 0) - v_discount;

  -- Criar encomenda
  insert into public.orders (
    profile_id, email,
    ship_first_name, ship_last_name, ship_address_1,
    ship_city, ship_postal, ship_country, ship_phone,
    shipping_method, shipping_cost,
    payment_method,
    subtotal, discount, tax, total,
    notes, coupon_code
  ) values (
    v_profile_id, p_email,
    p_ship_fname, p_ship_lname, p_ship_address,
    p_ship_city, p_ship_postal, p_ship_country, p_ship_phone,
    p_ship_method, coalesce(v_ship_cost, 0),
    p_pay_method,
    v_subtotal, v_discount, round(v_subtotal * 0.23, 2), v_total,
    p_notes, p_coupon
  ) returning id into v_order_id;

  -- Copiar itens do carrinho para a encomenda
  insert into public.order_items (
    order_id, variant_id,
    product_name, product_sku, color_label, size_label, image_url,
    qty, unit_price
  )
  select
    v_order_id,
    ci.variant_id,
    pr.name,
    pr.sku,
    col.label,
    sz.label,
    (select url from public.product_images pi2 where pi2.product_id = pr.id order by pi2.sort_order limit 1),
    ci.qty,
    pr.price
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  join public.products pr on pr.id = pv.product_id
  left join public.colors col on col.id = pv.color_id
  left join public.sizes sz on sz.id = pv.size_id
  where ci.cart_id = p_cart_id;

  -- Limpar carrinho
  delete from public.cart_items where cart_id = p_cart_id;

  return v_order_id;
end;
$$;

-- ============================================================
-- DADOS INICIAIS — Seed
-- ============================================================

-- Categorias
insert into public.categories (slug, label, description, sort_order) values
  ('tops',        'Tops',        'T-shirts, sweatshirts e malhas',      1),
  ('bottoms',     'Bottoms',     'Calças, jeans e calções',             2),
  ('outerwear',   'Outerwear',   'Casacos e coletes',                   3),
  ('accessories', 'Acessórios',  'Bonés, malas e acessórios diversos',  4);

-- Cores
insert into public.colors (slug, label, hex, sort_order) values
  ('black',   'Preto',    '#0a0a0a', 1),
  ('cream',   'Creme',    '#e8e2d6', 2),
  ('olive',   'Olive',    '#4a4a3a', 3),
  ('graphite','Grafite',  '#3a3a3a', 4),
  ('taupe',   'Taupe',    '#7a6e5e', 5),
  ('navy',    'Azul-Marinho', '#1c2233', 6),
  ('indigo',  'Índigo',   '#1c2840', 7);

-- Tamanhos
insert into public.sizes (slug, label, sort_order) values
  ('xs',       'XS',       1),
  ('s',        'S',        2),
  ('m',        'M',        3),
  ('l',        'L',        4),
  ('xl',       'XL',       5),
  ('xxl',      'XXL',      6),
  ('28',       '28',       7),
  ('30',       '30',       8),
  ('32',       '32',       9),
  ('34',       '34',       10),
  ('36',       '36',       11),
  ('one-size', 'Tamanho Único', 12);

-- Opções de envio
insert into public.shipping_options (slug, label, description, price, free_above, estimated_days_min, estimated_days_max, sort_order) values
  ('standard', 'Standard',       '3–5 dias úteis',                   4.95, 120, 3, 5, 1),
  ('express',  'Express',        '1–2 dias úteis',                   9.95, null, 1, 2, 2),
  ('pickup',   'Click & Collect','Lisboa — pronto em 24h',           0.00, null, 0, 1, 3);

-- Produtos
with
  cat_tops as (select id from public.categories where slug = 'tops'),
  cat_bottoms as (select id from public.categories where slug = 'bottoms'),
  cat_outer as (select id from public.categories where slug = 'outerwear'),
  cat_acc as (select id from public.categories where slug = 'accessories'),

  col_black   as (select id from public.colors where slug = 'black'),
  col_cream   as (select id from public.colors where slug = 'cream'),
  col_olive   as (select id from public.colors where slug = 'olive'),
  col_graphite as (select id from public.colors where slug = 'graphite'),
  col_taupe   as (select id from public.colors where slug = 'taupe'),
  col_navy    as (select id from public.colors where slug = 'navy'),
  col_indigo  as (select id from public.colors where slug = 'indigo'),

  sz_xs as (select id from public.sizes where slug = 'xs'),
  sz_s  as (select id from public.sizes where slug = 's'),
  sz_m  as (select id from public.sizes where slug = 'm'),
  sz_l  as (select id from public.sizes where slug = 'l'),
  sz_xl as (select id from public.sizes where slug = 'xl'),
  sz_xxl as (select id from public.sizes where slug = 'xxl'),
  sz_28 as (select id from public.sizes where slug = '28'),
  sz_30 as (select id from public.sizes where slug = '30'),
  sz_32 as (select id from public.sizes where slug = '32'),
  sz_34 as (select id from public.sizes where slug = '34'),
  sz_36 as (select id from public.sizes where slug = '36'),
  sz_os as (select id from public.sizes where slug = 'one-size'),

  ins as (
    insert into public.products (sku, name, slug, description, price, category_id, type, weight, origin, materials, sort_order)
    select * from (values
      ('KR-TEE-001-BLK', 'Heavyweight Tee 001',    'heavyweight-tee-001',   'T-shirt em algodão pesado construída num fio de anel simples. Corte boxy com gola canelada reforçada. Pré-lavada para mínima retração.',                          65,  (select id from cat_tops),    'T-Shirt',   '320 GSM', 'Portugal', array['100% Algodão Orgânico'],       1),
      ('KR-CRW-002-CRM', 'Loopback Crewneck',      'loopback-crewneck',     'Sweatshirt relaxada em french terry loopback pesado. Ombros caídos, punhos e barra canelados. Tingida em peça para profundidade tonal.',                           145, (select id from cat_tops),    'Sweatshirt','480 GSM', 'Portugal', array['85% Algodão','15% Poliéster'], 2),
      ('KR-PNT-003-BLK', 'Wide Leg Trouser',       'wide-leg-trouser',      'Calça de perna larga em mistura de lã de quatro estações. Frente com uma prega, bolsos laterais inclinados e barra limpa sem acabamento.',                          195, (select id from cat_bottoms), 'Calças',    '240 GSM', 'Itália',   array['68% Lã','30% Poliéster','2% Elastano'], 3),
      ('KR-OUT-004-BLK', 'Type-04 Field Coat',     'type-04-field-coat',    'Casaco de campo utilitário com quatro bolsos foles e fecho com flap de proteção. Construído em canvas encerado japonês que desenvolve pátina única com o uso.',     425, (select id from cat_outer),   'Casaco',    '14 oz',   'Japão',    array['100% Algodão (Encerado)'],     4),
      ('KR-KNT-005-OLV', 'Merino Half-Zip',        'merino-half-zip',       'Meia-fecho em merino de malha fina com gola canelada estruturada. Peso médio, respirável, regulação natural da temperatura.',                                        215, (select id from cat_tops),    'Malha',     '12 GG',   'Escócia',  array['100% Lã Merino'],              5),
      ('KR-PNT-006-CRM', 'Carpenter Pant',         'carpenter-pant',        'Calça de carpinteiro relaxada em canvas pesado. Loop de martelo, joelhos duplos e subida limpa na frente.',                                                         175, (select id from cat_bottoms), 'Calças',    '12 oz',   'Portugal', array['100% Canvas de Algodão'],      6),
      ('KR-ACC-007-BLK', 'Object Cap',             'object-cap',            'Boné de seis painéis sem estrutura. Fecho em tecido próprio com ferragens em latão envelhecido.',                                                                    55,  (select id from cat_acc),     'Boné',      '—',       'Portugal', array['100% Sarja de Algodão'],      7),
      ('KR-OUT-008-BLK', 'Cropped Liner Vest',     'cropped-liner-vest',    'Colete acolchoado compressível em nylon ripstop reciclado. Fecho duplo, bolso interno com fecho.',                                                                   165, (select id from cat_outer),   'Colete',    '—',       'Vietname', array['100% Nylon Reciclado'],        8),
      ('KR-TEE-009-CRM', 'Tubular Long Sleeve',    'tubular-long-sleeve',   'Manga longa cortada numa máquina de malha tubular — um corpo único, sem costuras, para uma queda limpa.',                                                            85,  (select id from cat_tops),    'T-Shirt',   '220 GSM', 'Peru',     array['100% Algodão Pima'],           9),
      ('KR-ACC-010-BLK', 'Utility Tote',           'utility-tote',          'Tote em canvas pesado com base reforçada, pegas com rebites e bolso interior com fecho.',                                                                            95,  (select id from cat_acc),     'Mala',      '16 oz',   'Portugal', array['100% Canvas de Algodão'],     10),
      ('KR-KNT-011-BLK', 'Cashmere Beanie',        'cashmere-beanie',       'Gorro canelado em caxemira. Dupla dobra, estruturado, macio.',                                                                                                        85,  (select id from cat_acc),     'Gorro',     '7 GG',    'Itália',   array['100% Caxemira Mongol'],       11),
      ('KR-PNT-012-BLK', 'Selvedge Denim',         'selvedge-denim',        'Denim bruto tecido em teares de lançadeira vintage em Okayama. Perna direita, cintura média, construção com rebites escondidos.',                                    245, (select id from cat_bottoms), 'Ganga',     '14.5 oz', 'Japão',    array['100% Algodão (Selvedge)'],    12)
    ) as t(sku, name, slug, description, price, category_id, type, weight, origin, materials, sort_order)
    returning id, sku
  )
select 1;  -- just to run the CTE

-- Imagens dos produtos
insert into public.product_images (product_id, url, sort_order)
select p.id, img.url, img.sort_order from public.products p
cross join lateral (values
  ('KR-TEE-001-BLK', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-TEE-001-BLK', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-TEE-001-BLK', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=80&auto=format&fit=crop', 2),
  ('KR-TEE-001-BLK', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80&auto=format&fit=crop', 3),
  ('KR-CRW-002-CRM', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-CRW-002-CRM', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-CRW-002-CRM', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80&auto=format&fit=crop', 2),
  ('KR-PNT-003-BLK', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-PNT-003-BLK', 'https://images.unsplash.com/photo-1473966968600-fa801b3a9746?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-OUT-004-BLK', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-OUT-004-BLK', 'https://images.unsplash.com/photo-1591047139756-eb1ab9c8f99e?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-OUT-004-BLK', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80&auto=format&fit=crop', 2),
  ('KR-KNT-005-OLV', 'https://images.unsplash.com/photo-1614093302611-8efc4de12407?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-KNT-005-OLV', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-PNT-006-CRM', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-PNT-006-CRM', 'https://images.unsplash.com/photo-1542272454315-7ad9f1b4e64e?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-ACC-007-BLK', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-ACC-007-BLK', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-OUT-008-BLK', 'https://images.unsplash.com/photo-1591047139756-eb1ab9c8f99e?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-OUT-008-BLK', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-TEE-009-CRM', 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-TEE-009-CRM', 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-ACC-010-BLK', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-ACC-010-BLK', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-KNT-011-BLK', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-KNT-011-BLK', 'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=900&q=80&auto=format&fit=crop', 1),
  ('KR-PNT-012-BLK', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80&auto=format&fit=crop', 0),
  ('KR-PNT-012-BLK', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=900&q=80&auto=format&fit=crop', 1)
) as img(sku, url, sort_order)
where p.sku = img.sku;

-- Tags
insert into public.product_tags (product_id, tag)
select p.id, t.tag from public.products p
join (values
  ('KR-TEE-001-BLK', 'Novo'),
  ('KR-CRW-002-CRM', 'Mais Vendido'),
  ('KR-OUT-004-BLK', 'Novo'),
  ('KR-OUT-008-BLK', 'Edição Limitada'),
  ('KR-PNT-012-BLK', 'Mais Vendido')
) as t(sku, tag) on p.sku = t.sku;

-- Cores por produto
insert into public.product_colors (product_id, color_id, sort_order)
select p.id, c.id, pc.sort_order from public.products p
join (values
  ('KR-TEE-001-BLK', 'black',    0), ('KR-TEE-001-BLK', 'cream', 1), ('KR-TEE-001-BLK', 'olive', 2),
  ('KR-CRW-002-CRM', 'cream',    0), ('KR-CRW-002-CRM', 'black', 1), ('KR-CRW-002-CRM', 'graphite', 2),
  ('KR-PNT-003-BLK', 'black',    0), ('KR-PNT-003-BLK', 'taupe', 1),
  ('KR-OUT-004-BLK', 'black',    0), ('KR-OUT-004-BLK', 'navy',  1),
  ('KR-KNT-005-OLV', 'olive',    0), ('KR-KNT-005-OLV', 'cream', 1), ('KR-KNT-005-OLV', 'black', 2),
  ('KR-PNT-006-CRM', 'cream',    0), ('KR-PNT-006-CRM', 'black', 1),
  ('KR-ACC-007-BLK', 'black',    0), ('KR-ACC-007-BLK', 'cream', 1),
  ('KR-OUT-008-BLK', 'black',    0), ('KR-OUT-008-BLK', 'olive', 1),
  ('KR-TEE-009-CRM', 'cream',    0), ('KR-TEE-009-CRM', 'black', 1),
  ('KR-ACC-010-BLK', 'black',    0), ('KR-ACC-010-BLK', 'cream', 1),
  ('KR-KNT-011-BLK', 'black',    0), ('KR-KNT-011-BLK', 'graphite', 1), ('KR-KNT-011-BLK', 'cream', 2),
  ('KR-PNT-012-BLK', 'black',    0), ('KR-PNT-012-BLK', 'indigo', 1)
) as pc(sku, color_slug, sort_order) on p.sku = pc.sku
join public.colors c on c.slug = pc.color_slug;

-- Variantes (stock)
insert into public.product_variants (product_id, color_id, size_id, stock)
select p.id, c.id, s.id, v.stock
from public.products p
join (values
  -- Heavyweight Tee 001
  ('KR-TEE-001-BLK','black','xs',15),('KR-TEE-001-BLK','black','s',20),('KR-TEE-001-BLK','black','m',25),('KR-TEE-001-BLK','black','l',18),('KR-TEE-001-BLK','black','xl',10),('KR-TEE-001-BLK','black','xxl',0),
  ('KR-TEE-001-BLK','cream','xs',8), ('KR-TEE-001-BLK','cream','s',12),('KR-TEE-001-BLK','cream','m',15),('KR-TEE-001-BLK','cream','l',10),('KR-TEE-001-BLK','cream','xl',5),
  ('KR-TEE-001-BLK','olive','s',6), ('KR-TEE-001-BLK','olive','m',8), ('KR-TEE-001-BLK','olive','l',5),
  -- Loopback Crewneck
  ('KR-CRW-002-CRM','cream','s',10),('KR-CRW-002-CRM','cream','m',14),('KR-CRW-002-CRM','cream','l',12),('KR-CRW-002-CRM','cream','xl',8),
  ('KR-CRW-002-CRM','black','s',8), ('KR-CRW-002-CRM','black','m',10),('KR-CRW-002-CRM','black','l',9), ('KR-CRW-002-CRM','black','xl',5),
  ('KR-CRW-002-CRM','graphite','s',5),('KR-CRW-002-CRM','graphite','m',7),('KR-CRW-002-CRM','graphite','l',4),
  -- Wide Leg Trouser
  ('KR-PNT-003-BLK','black','28',8),('KR-PNT-003-BLK','black','30',12),('KR-PNT-003-BLK','black','32',15),('KR-PNT-003-BLK','black','34',10),('KR-PNT-003-BLK','black','36',0),
  ('KR-PNT-003-BLK','taupe','28',5),('KR-PNT-003-BLK','taupe','30',8), ('KR-PNT-003-BLK','taupe','32',6), ('KR-PNT-003-BLK','taupe','34',4),
  -- Type-04 Field Coat
  ('KR-OUT-004-BLK','black','s',0),('KR-OUT-004-BLK','black','m',6),('KR-OUT-004-BLK','black','l',8),('KR-OUT-004-BLK','black','xl',5),
  ('KR-OUT-004-BLK','navy','m',4),('KR-OUT-004-BLK','navy','l',5),('KR-OUT-004-BLK','navy','xl',3),
  -- Merino Half-Zip
  ('KR-KNT-005-OLV','olive','s',8),('KR-KNT-005-OLV','olive','m',10),('KR-KNT-005-OLV','olive','l',7),('KR-KNT-005-OLV','olive','xl',0),
  ('KR-KNT-005-OLV','cream','s',5),('KR-KNT-005-OLV','cream','m',7),('KR-KNT-005-OLV','cream','l',4),
  ('KR-KNT-005-OLV','black','s',3),('KR-KNT-005-OLV','black','m',5),('KR-KNT-005-OLV','black','l',3),
  -- Carpenter Pant
  ('KR-PNT-006-CRM','cream','28',10),('KR-PNT-006-CRM','cream','30',14),('KR-PNT-006-CRM','cream','32',16),('KR-PNT-006-CRM','cream','34',12),('KR-PNT-006-CRM','cream','36',8),
  ('KR-PNT-006-CRM','black','28',8),('KR-PNT-006-CRM','black','30',10),('KR-PNT-006-CRM','black','32',12),('KR-PNT-006-CRM','black','34',9),('KR-PNT-006-CRM','black','36',5),
  -- Object Cap
  ('KR-ACC-007-BLK','black','one-size',30),
  ('KR-ACC-007-BLK','cream','one-size',20),
  -- Cropped Liner Vest
  ('KR-OUT-008-BLK','black','s',5),('KR-OUT-008-BLK','black','m',7),('KR-OUT-008-BLK','black','l',6),('KR-OUT-008-BLK','black','xl',0),
  ('KR-OUT-008-BLK','olive','s',3),('KR-OUT-008-BLK','olive','m',5),('KR-OUT-008-BLK','olive','l',4),
  -- Tubular Long Sleeve
  ('KR-TEE-009-CRM','cream','s',12),('KR-TEE-009-CRM','cream','m',15),('KR-TEE-009-CRM','cream','l',10),('KR-TEE-009-CRM','cream','xl',6),
  ('KR-TEE-009-CRM','black','s',8),('KR-TEE-009-CRM','black','m',10),('KR-TEE-009-CRM','black','l',7),('KR-TEE-009-CRM','black','xl',4),
  -- Utility Tote
  ('KR-ACC-010-BLK','black','one-size',25),
  ('KR-ACC-010-BLK','cream','one-size',15),
  -- Cashmere Beanie
  ('KR-KNT-011-BLK','black','one-size',20),
  ('KR-KNT-011-BLK','graphite','one-size',12),
  ('KR-KNT-011-BLK','cream','one-size',10),
  -- Selvedge Denim
  ('KR-PNT-012-BLK','black','28',0),('KR-PNT-012-BLK','black','30',6),('KR-PNT-012-BLK','black','32',8),('KR-PNT-012-BLK','black','34',5),('KR-PNT-012-BLK','black','36',0),
  ('KR-PNT-012-BLK','indigo','30',4),('KR-PNT-012-BLK','indigo','32',6),('KR-PNT-012-BLK','indigo','34',3)
) as v(sku, color_slug, size_slug, stock) on p.sku = v.sku
join public.colors c on c.slug = v.color_slug
join public.sizes s on s.slug = v.size_slug;

-- Cupão de exemplo
insert into public.coupons (code, description, type, value, min_order, max_uses)
values ('KARA10', 'Desconto de boas-vindas 10%', 'percentage', 10, 50, 100);

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
