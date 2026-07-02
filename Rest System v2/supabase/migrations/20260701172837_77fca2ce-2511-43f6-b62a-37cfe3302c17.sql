
-- =========================================================
-- CORE: tenants + memberships (multi-tenant)
-- =========================================================
create type public.app_role as enum ('admin','gestor','sdr','closer','atendimento','operacao','financeiro','leitura');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  accent_color text default '#00ffb2',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now(),
  unique(tenant_id, user_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- security definer helpers (avoid RLS recursion)
create or replace function public.is_tenant_member(_tenant uuid, _user uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.tenant_members where tenant_id=_tenant and user_id=_user)
$$;

create or replace function public.has_tenant_role(_tenant uuid, _user uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.tenant_members where tenant_id=_tenant and user_id=_user and role=_role)
$$;

grant select,insert,update,delete on public.tenants to authenticated;
grant select,insert,update,delete on public.tenant_members to authenticated;
grant select,insert,update on public.profiles to authenticated;
grant all on public.tenants, public.tenant_members, public.profiles to service_role;

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.profiles enable row level security;

create policy "members can read their tenants" on public.tenants for select
  using (public.is_tenant_member(id, auth.uid()));
create policy "any auth can create tenant" on public.tenants for insert
  with check (auth.uid() = created_by);
create policy "admin can update tenant" on public.tenants for update
  using (public.has_tenant_role(id, auth.uid(), 'admin'));
create policy "admin can delete tenant" on public.tenants for delete
  using (public.has_tenant_role(id, auth.uid(), 'admin'));

create policy "read own memberships" on public.tenant_members for select
  using (user_id = auth.uid() or public.has_tenant_role(tenant_id, auth.uid(), 'admin'));
create policy "admin manages memberships" on public.tenant_members for all
  using (public.has_tenant_role(tenant_id, auth.uid(), 'admin') or user_id = auth.uid())
  with check (public.has_tenant_role(tenant_id, auth.uid(), 'admin') or user_id = auth.uid());

create policy "read own profile" on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update using (id = auth.uid());
create policy "insert own profile" on public.profiles for insert with check (id = auth.uid());

-- auto-create tenant + admin membership when tenant is inserted
create or replace function public.after_tenant_created()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.tenant_members(tenant_id, user_id, role)
  values (new.id, new.created_by, 'admin')
  on conflict do nothing;
  return new;
end $$;
create trigger trg_after_tenant_created after insert on public.tenants
  for each row execute function public.after_tenant_created();

-- auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- shared updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_touch_tenants before update on public.tenants
  for each row execute function public.touch_updated_at();

-- =========================================================
-- PIPELINE (funil) + STAGES
-- =========================================================
create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text default '#00ffb2',
  is_won boolean default false,
  is_lost boolean default false,
  created_at timestamptz not null default now()
);

grant select,insert,update,delete on public.pipelines, public.stages to authenticated;
grant all on public.pipelines, public.stages to service_role;
alter table public.pipelines enable row level security;
alter table public.stages enable row level security;

create policy "tenant reads pipelines" on public.pipelines for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant writes pipelines" on public.pipelines for all
  using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

create policy "tenant reads stages" on public.stages for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant writes stages" on public.stages for all
  using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

-- =========================================================
-- PRODUCTS
-- =========================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  category text,
  price numeric(12,2) default 0,
  cost numeric(12,2) default 0,
  delivery_days int,
  scope text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select,insert,update,delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "tenant products r" on public.products for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant products w" on public.products for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));
create trigger trg_touch_products before update on public.products for each row execute function public.touch_updated_at();

-- =========================================================
-- LEADS
-- =========================================================
create type public.lead_temperature as enum ('frio','morno','quente');
create type public.lead_status as enum ('novo','em_andamento','follow_up','ganho','perdido','cliente');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  company text,
  source text,
  tags text[] default '{}',
  temperature public.lead_temperature default 'frio',
  status public.lead_status default 'novo',
  pipeline_id uuid references public.pipelines(id) on delete set null,
  stage_id uuid references public.stages(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  ai_paused boolean default false,
  last_message_at timestamptz,
  next_followup_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.leads(tenant_id, stage_id);
create index on public.leads(tenant_id, status);
grant select,insert,update,delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "tenant leads r" on public.leads for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant leads w" on public.leads for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));
create trigger trg_touch_leads before update on public.leads for each row execute function public.touch_updated_at();

-- =========================================================
-- CONVERSATIONS & MESSAGES (WhatsApp CRM mock)
-- =========================================================
create type public.message_role as enum ('lead','agent','ai','system');
create type public.message_status as enum ('sent','delivered','read','failed');

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  channel text default 'whatsapp',
  ai_enabled boolean default true,
  last_message_at timestamptz,
  unread_count int default 0,
  created_at timestamptz not null default now()
);
create index on public.conversations(tenant_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  status public.message_status default 'sent',
  sent_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.messages(conversation_id, created_at);

grant select,insert,update,delete on public.conversations, public.messages to authenticated;
grant all on public.conversations, public.messages to service_role;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
create policy "tenant convos r" on public.conversations for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant convos w" on public.conversations for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant msgs r" on public.messages for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant msgs w" on public.messages for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

-- =========================================================
-- FOLLOW-UPS
-- =========================================================
create type public.followup_status as enum ('pendente','concluido','pulado','cancelado');

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  scheduled_at timestamptz not null,
  attempt int default 1,
  script_id uuid,
  status public.followup_status default 'pendente',
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.followups(tenant_id, scheduled_at);
grant select,insert,update,delete on public.followups to authenticated;
grant all on public.followups to service_role;
alter table public.followups enable row level security;
create policy "tenant fu r" on public.followups for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant fu w" on public.followups for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

-- =========================================================
-- SCRIPTS
-- =========================================================
create type public.script_type as enum ('abertura','qualificacao','follow_up','objecao','agendamento','fechamento','reativacao','ia_base');

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  type public.script_type not null default 'abertura',
  content text not null,
  product_id uuid references public.products(id) on delete set null,
  stage_id uuid references public.stages(id) on delete set null,
  performance_score numeric(5,2) default 0,
  usage_count int default 0,
  version int default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select,insert,update,delete on public.scripts to authenticated;
grant all on public.scripts to service_role;
alter table public.scripts enable row level security;
create policy "tenant scripts r" on public.scripts for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant scripts w" on public.scripts for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));
create trigger trg_touch_scripts before update on public.scripts for each row execute function public.touch_updated_at();

-- =========================================================
-- CUSTOMERS + customer_products + files + tasks
-- =========================================================
create type public.customer_status as enum ('ativo','pausado','encerrado','em_onboarding');

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  status public.customer_status default 'em_onboarding',
  owner_id uuid references auth.users(id) on delete set null,
  origin_lead_id uuid references public.leads(id) on delete set null,
  start_date date,
  renewal_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select,insert,update,delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "tenant customers r" on public.customers for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant customers w" on public.customers for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));
create trigger trg_touch_customers before update on public.customers for each row execute function public.touch_updated_at();

create type public.delivery_status as enum ('pendente','em_andamento','concluido','atrasado');

create table public.customer_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  status public.delivery_status default 'pendente',
  progress int default 0,
  started_at timestamptz,
  due_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
grant select,insert,update,delete on public.customer_products to authenticated;
grant all on public.customer_products to service_role;
alter table public.customer_products enable row level security;
create policy "tenant cp r" on public.customer_products for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant cp w" on public.customer_products for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

create table public.files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  name text not null,
  kind text default 'documento',
  url text,
  size_bytes bigint,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
grant select,insert,update,delete on public.files to authenticated;
grant all on public.files to service_role;
alter table public.files enable row level security;
create policy "tenant files r" on public.files for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant files w" on public.files for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

create type public.task_status as enum ('aberta','em_andamento','concluida','cancelada');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status default 'aberta',
  due_at timestamptz,
  assignee_id uuid references auth.users(id) on delete set null,
  lead_id uuid references public.leads(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select,insert,update,delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "tenant tasks r" on public.tasks for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant tasks w" on public.tasks for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));
create trigger trg_touch_tasks before update on public.tasks for each row execute function public.touch_updated_at();

-- =========================================================
-- AI LOGS + AUTOMATIONS + NOTIFICATIONS
-- =========================================================
create table public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  action text not null,
  input jsonb,
  output jsonb,
  model text,
  created_at timestamptz not null default now()
);
grant select,insert on public.ai_logs to authenticated;
grant all on public.ai_logs to service_role;
alter table public.ai_logs enable row level security;
create policy "tenant ai r" on public.ai_logs for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant ai w" on public.ai_logs for insert with check (public.is_tenant_member(tenant_id, auth.uid()));

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  trigger text not null,
  action jsonb not null default '{}',
  is_active boolean default true,
  created_at timestamptz not null default now()
);
grant select,insert,update,delete on public.automations to authenticated;
grant all on public.automations to service_role;
alter table public.automations enable row level security;
create policy "tenant auto r" on public.automations for select using (public.is_tenant_member(tenant_id, auth.uid()));
create policy "tenant auto w" on public.automations for all using (public.is_tenant_member(tenant_id, auth.uid())) with check (public.is_tenant_member(tenant_id, auth.uid()));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
grant select,insert,update,delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifs r" on public.notifications for select using (user_id = auth.uid());
create policy "own notifs w" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
