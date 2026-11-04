-- MAR T-SHIRTS STORE | Estrutura inicial do Supabase
-- Execute no SQL Editor do projeto Supabase.
-- IMPORTANTE: configure também os buckets públicos "products" e "site-assets".
-- A chave service_role NUNCA deve ser colocada no frontend.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  category text not null default 'Unissex',
  sizes text[] not null default '{}',
  images text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  value text not null default ''
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending_whatsapp',
  customer_note text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.site_content enable row level security;
alter table public.orders enable row level security;

-- Catálogo público: visitantes só leem produtos disponíveis.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select to anon, authenticated using (active = true);

-- Administradores autenticados podem gerenciar produtos.
drop policy if exists "Authenticated users manage products" on public.products;
create policy "Authenticated users manage products" on public.products
for all to authenticated using (true) with check (true);

-- Conteúdo público pode ser lido; apenas usuários autenticados editam.
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content" on public.site_content
for select to anon, authenticated using (true);

drop policy if exists "Authenticated users manage site content" on public.site_content;
create policy "Authenticated users manage site content" on public.site_content
for all to authenticated using (true) with check (true);

-- Pedido inicial pode ser criado por visitantes; leitura e gestão apenas autenticadas.
drop policy if exists "Visitors can create orders" on public.orders;
create policy "Visitors can create orders" on public.orders
for insert to anon, authenticated with check (true);

drop policy if exists "Authenticated users manage orders" on public.orders;
create policy "Authenticated users manage orders" on public.orders
for all to authenticated using (true) with check (true);

insert into public.site_content(key,value) values
('about_text','A MAR nasceu do coração de uma mãe, Carol Hottis, que desejava estar mais perto de suas filhas, Maria Alice e Rebeca.'),
('club_url',''),
('whatsapp_number','5573998211690')
on conflict (key) do nothing;

-- STORAGE: crie os buckets products e site-assets como PUBLIC no painel Storage.
-- Políticas recomendadas para os buckets:
-- products: SELECT público; INSERT/UPDATE/DELETE apenas authenticated.
-- site-assets: SELECT público; INSERT/UPDATE/DELETE apenas authenticated.
-- O bucket products deve aceitar imagens e ter limite de tamanho adequado (ex.: 5 MB).
