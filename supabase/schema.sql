-- Question Pro · esquema inicial para Supabase/PostgreSQL
-- Ejecutar una sola vez desde Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.salons (
  id text primary key,
  name text not null,
  owner text not null default '',
  phone text not null default '',
  address text not null default '',
  slug text not null unique,
  has_access boolean not null default false,
  whatsapp_connected boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  salon_id text references public.salons(id),
  name text not null,
  phone text not null default '',
  email text not null default '',
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professionals (
  id text primary key,
  salon_id text not null references public.salons(id),
  name text not null,
  color text not null default '#b7d33d',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id text primary key,
  salon_id text not null references public.salons(id),
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price bigint not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  salon_id text not null references public.salons(id),
  customer_id text not null references public.customers(id),
  professional_id text not null references public.professionals(id),
  service_id text not null references public.services(id),
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price bigint not null check (price >= 0),
  status text not null default 'confirmed',
  reminder_status text not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  source_product_id bigint,
  name text not null,
  variant text not null default '',
  sku text not null default 'N/A',
  slug text not null default '',
  category text not null default 'Otros',
  image_url text not null default '',
  description text not null default '',
  professional_price bigint not null default 0 check (professional_price >= 0),
  public_price bigint not null default 0 check (public_price >= 0),
  b2c_enabled boolean not null default false,
  physical_stock integer not null default 0 check (physical_stock >= 0),
  reserved_stock integer not null default 0 check (reserved_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reserved_stock <= physical_stock)
);

create table if not exists public.influencers (
  id text primary key,
  name text not null,
  slug text not null unique,
  phone text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  type text not null,
  source text not null,
  salon_id text references public.salons(id),
  influencer_id text references public.influencers(id),
  customer_id text references public.customers(id),
  recipient_name text not null,
  delivery_mode text not null,
  delivery_address text not null default '',
  status text not null default 'received',
  payment_method text not null,
  payment_status text not null default 'pending',
  payment_provider_id text,
  subtotal bigint not null check (subtotal >= 0),
  shipping_fee bigint not null default 0 check (shipping_fee >= 0),
  total bigint not null check (total >= 0),
  commission bigint not null default 0 check (commission >= 0),
  delivery_date timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price bigint not null check (unit_price >= 0),
  commission bigint not null default 0 check (commission >= 0)
);

create table if not exists public.ledger_entries (
  id text primary key,
  salon_id text not null references public.salons(id),
  reference_id text,
  type text not null,
  description text not null,
  debit bigint not null default 0 check (debit >= 0),
  credit bigint not null default 0 check (credit >= 0),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id text primary key,
  product_id text not null references public.products(id),
  type text not null,
  quantity integer not null,
  reference_id text,
  user_name text not null default 'Administrador Question',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.influencer_commissions (
  id text primary key,
  influencer_id text not null references public.influencers(id),
  product_id text not null references public.products(id),
  amount bigint not null default 0 check (amount >= 0),
  percent integer not null default 0 check (percent >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (influencer_id, product_id)
);

create table if not exists public.audit_logs (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_json jsonb,
  after_json jsonb,
  user_name text not null default 'Administrador Question',
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_salon_start
  on public.appointments(salon_id, starts_at);
create index if not exists idx_appointments_professional_start
  on public.appointments(professional_id, starts_at);
create index if not exists idx_customers_salon_phone
  on public.customers(salon_id, phone);
create index if not exists idx_orders_status
  on public.orders(status, created_at desc);
create index if not exists idx_orders_salon
  on public.orders(salon_id, created_at desc);
create index if not exists idx_ledger_salon_date
  on public.ledger_entries(salon_id, occurred_at desc);
create index if not exists idx_stock_product_date
  on public.stock_movements(product_id, created_at desc);

-- La aplicación escribe solamente desde rutas seguras del servidor usando la
-- clave secreta de Supabase. El navegador no recibe acceso directo a las tablas.
alter table public.salons enable row level security;
alter table public.customers enable row level security;
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.products enable row level security;
alter table public.influencers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.stock_movements enable row level security;
alter table public.influencer_commissions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;

-- Datos ficticios para probar todos los recorridos.
insert into public.salons
  (id, name, owner, phone, address, slug, has_access, whatsapp_connected)
values
  ('salon-griselda', 'Peluquería Griselda', 'Griselda', '221 555-0134', 'Calle 12 847, La Plata', 'griselda', false, false),
  ('salon-lola', 'Lola Estudio', 'Laura Méndez', '221 555-0192', 'Diagonal 74 1120, La Plata', 'lola-estudio', true, true),
  ('salon-norte', 'Norte Hair Lab', 'Martín Vidal', '221 555-0181', 'Camino Centenario 1860, City Bell', 'norte-hair', true, true),
  ('salon-aura', 'Aura Color', 'Camila Ruiz', '221 555-0129', 'Calle 49 618, La Plata', 'aura-color', true, true),
  ('salon-mirta', 'Peluquería Mirta', 'Mirta Gómez', '221 555-0162', 'Av. 7 2341, La Plata', 'mirta', false, false)
on conflict (id) do nothing;

insert into public.customers
  (id, salon_id, name, phone, email, marketing_consent)
values
  ('c-1', 'salon-lola', 'Julieta Ramos', '221 555-4051', 'julieta@example.com', true),
  ('c-2', 'salon-lola', 'Sofía Prieto', '221 555-4038', '', true),
  ('c-3', 'salon-lola', 'Marina Acosta', '221 555-4027', 'marina@example.com', false),
  ('c-4', 'salon-lola', 'Elena Ortiz', '221 555-4099', '', true)
on conflict (id) do nothing;

insert into public.professionals (id, salon_id, name, color)
values
  ('pro-laura', 'salon-lola', 'Laura', '#b7d33d'),
  ('pro-vale', 'salon-lola', 'Valentina', '#fc7d65'),
  ('pro-lucia', 'salon-lola', 'Lucía', '#7e9fe8')
on conflict (id) do nothing;

insert into public.services (id, salon_id, name, duration_minutes, price)
values
  ('srv-corte', 'salon-lola', 'Corte mujer', 45, 1400000),
  ('srv-color', 'salon-lola', 'Color completo', 120, 3800000),
  ('srv-balayage', 'salon-lola', 'Balayage', 180, 6200000),
  ('srv-brushing', 'salon-lola', 'Brushing', 45, 1250000),
  ('srv-tratamiento', 'salon-lola', 'Tratamiento reparador', 60, 2100000)
on conflict (id) do nothing;

insert into public.products
  (id, source_product_id, name, variant, sku, slug, category, image_url,
   professional_price, public_price, b2c_enabled, physical_stock, reserved_stock)
values
  ('q-101-1', 101, 'Lumiplex Color', '1 · Negro natural', 'N/A', 'lumiplex-color', 'Coloración', '', 742000, 1030000, false, 24, 5),
  ('q-101-3', 101, 'Lumiplex Color', '3 · Castaño oscuro', 'N/A', 'lumiplex-color', 'Coloración', '', 742000, 1030000, false, 9, 4),
  ('q-101-4', 101, 'Lumiplex Color', '4 · Castaño', 'N/A', 'lumiplex-color', 'Coloración', '', 742000, 1030000, false, 18, 2),
  ('q-201-330', 201, 'Shampoo Intelligent Repair', '330 ml', 'N/A', 'shampoo-intelligent-repair', 'Cuidado domiciliario', '', 895000, 1290000, true, 31, 7),
  ('q-201-1500', 201, 'Shampoo Intelligent Repair', '1.500 ml', 'N/A', 'shampoo-intelligent-repair', 'Tratamientos', '', 2145000, 2990000, false, 11, 3),
  ('q-202-330', 202, 'Acondicionador Intelligent Repair', '330 ml', 'N/A', 'acondicionador-intelligent-repair', 'Cuidado domiciliario', '', 940000, 1360000, true, 22, 4),
  ('q-203', 203, 'Máscara Intelligent Repair', '250 g', 'N/A', 'mascara-intelligent-repair', 'Cuidado domiciliario', '', 1180000, 1690000, true, 15, 2),
  ('q-301', 301, 'Óleo Lumiplex', '60 ml', 'N/A', 'oleo-lumiplex', 'Finalización', '', 1060000, 1510000, true, 7, 3),
  ('q-302', 302, 'Protector térmico Q Style', '200 ml', 'N/A', 'protector-termico', 'Finalización', '', 830000, 1190000, true, 28, 8),
  ('q-401-20', 401, 'Oxidante en crema', '20 vol · 1.000 ml', 'N/A', 'oxidante-en-crema', 'Técnicos', '', 980000, 1380000, false, 13, 5)
on conflict (id) do nothing;

insert into public.influencers (id, name, slug, phone)
values ('inf-mica', 'Mica Beauty', 'mica-beauty', '221 555-0298')
on conflict (id) do nothing;

insert into public.appointments
  (id, salon_id, customer_id, professional_id, service_id, starts_at,
   duration_minutes, price, status, reminder_status)
values
  ('apt-1', 'salon-lola', 'c-1', 'pro-laura', 'srv-color', '2026-08-28T09:00:00-03:00', 120, 3800000, 'confirmed', 'confirmed'),
  ('apt-2', 'salon-lola', 'c-2', 'pro-vale', 'srv-corte', '2026-08-28T10:30:00-03:00', 45, 1400000, 'confirmed', 'sent'),
  ('apt-3', 'salon-lola', 'c-3', 'pro-lucia', 'srv-brushing', '2026-08-28T12:00:00-03:00', 45, 1250000, 'confirmed', 'confirmed'),
  ('apt-4', 'salon-lola', 'c-4', 'pro-laura', 'srv-balayage', '2026-08-28T14:00:00-03:00', 180, 6200000, 'confirmed', 'sent'),
  ('apt-5', 'salon-lola', 'c-1', 'pro-vale', 'srv-tratamiento', '2026-08-29T11:00:00-03:00', 60, 2100000, 'confirmed', 'pending')
on conflict (id) do nothing;

insert into public.orders
  (id, type, source, salon_id, influencer_id, recipient_name, delivery_mode,
   delivery_address, status, payment_method, payment_status, subtotal,
   shipping_fee, total, commission, notes, created_at)
values
  ('QP-1842', 'b2b', 'assisted', 'salon-griselda', null, 'Griselda', 'salon', 'Calle 12 847, La Plata', 'ready', 'current_account', 'pending', 11820000, 0, 11820000, 0, 'Lumiplex Color × 12 · Oxidante × 3', '2026-08-28T09:20:00-03:00'),
  ('QP-1841', 'b2c', 'salon_link', 'salon-lola', null, 'Julieta Ramos', 'home', 'Calle 46 731, La Plata', 'preparing', 'mercadopago', 'paid', 2980000, 0, 2980000, 875000, 'Shampoo Intelligent Repair · Máscara Intelligent Repair', '2026-08-28T08:54:00-03:00'),
  ('QP-1840', 'b2c', 'influencer_link', null, 'inf-mica', 'Ana Belén López', 'home', 'Calle 15 122, City Bell', 'confirmed', 'cash', 'pending', 2380000, 0, 2380000, 286000, 'Protector térmico Q Style × 2', '2026-08-27T18:31:00-03:00'),
  ('QP-1839', 'b2c', 'salon_link', 'salon-norte', null, 'Micaela Díaz', 'salon', 'Camino Centenario 1860, City Bell', 'in_transit', 'cash', 'pending', 1510000, 0, 1510000, 450000, 'Óleo Lumiplex', '2026-08-27T16:05:00-03:00'),
  ('QP-1838', 'b2b', 'salon_app', 'salon-aura', null, 'Camila Ruiz', 'salon', 'Calle 49 618, La Plata', 'delivered', 'current_account', 'charged_to_salon', 26460000, 0, 26460000, 0, 'Lumiplex Color × 24 · Shampoo 1.500 ml × 4', '2026-08-26T10:12:00-03:00')
on conflict (id) do nothing;

insert into public.ledger_entries
  (id, salon_id, type, description, debit, credit, occurred_at)
values
  ('mov-1', 'salon-lola', 'commission', 'Comisión venta QP-1841', 0, 875000, '2026-08-28T08:55:00-03:00'),
  ('mov-2', 'salon-lola', 'payment', 'Pago recibido', 0, 12000000, '2026-08-26T10:00:00-03:00'),
  ('mov-3', 'salon-lola', 'invoice', 'Pedido profesional QP-1826', 21075000, 0, '2026-08-24T10:00:00-03:00'),
  ('mov-4', 'salon-lola', 'adjustment', 'Ajuste de cuenta', 0, 3200000, '2026-08-15T10:00:00-03:00')
on conflict (id) do nothing;

insert into public.settings (key, value)
values
  ('free_shipping_minimum', '4500000'),
  ('flat_shipping_fee', '450000'),
  ('demo_mode', 'true')
on conflict (key) do nothing;
