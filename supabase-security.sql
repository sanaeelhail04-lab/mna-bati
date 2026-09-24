-- M.N.A BATI: protection des tables de formulaires
-- A executer une seule fois dans Supabase > SQL Editor.

alter table public.contacts enable row level security;
alter table public.devis enable row level security;

-- Aucun acces direct aux donnees pour le role public.
revoke all on table public.contacts from anon;
revoke all on table public.devis from anon;

drop policy if exists "anon can insert contacts" on public.contacts;
drop policy if exists "anon can insert devis" on public.devis;
drop policy if exists "admins can read contacts" on public.contacts;
drop policy if exists "admins can update contacts" on public.contacts;
drop policy if exists "admins can delete contacts" on public.contacts;
drop policy if exists "admins can read devis" on public.devis;
drop policy if exists "admins can update devis" on public.devis;
drop policy if exists "admins can delete devis" on public.devis;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and coalesce(is_active, true) = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "admins can read contacts"
  on public.contacts for select to authenticated
  using (public.is_admin());

create policy "admins can update contacts"
  on public.contacts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete contacts"
  on public.contacts for delete to authenticated
  using (public.is_admin());

create policy "admins can read devis"
  on public.devis for select to authenticated
  using (public.is_admin());

create policy "admins can update devis"
  on public.devis for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete devis"
  on public.devis for delete to authenticated
  using (public.is_admin());

create or replace function public.submit_contact(
  p_prenom text,
  p_nom text,
  p_email text,
  p_telephone text,
  p_sujet text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid;
begin
  if length(trim(coalesce(p_prenom, ''))) not between 1 and 80
    or length(trim(coalesce(p_nom, ''))) not between 1 and 80
    or length(trim(coalesce(p_sujet, ''))) not between 1 and 120
    or length(trim(coalesce(p_message, ''))) not between 1 and 5000
    or length(trim(coalesce(p_email, ''))) > 254
    or trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception 'Données de contact invalides';
  end if;

  if exists (
    select 1 from public.contacts
    where lower(email) = lower(trim(p_email))
      and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'Veuillez patienter avant de renvoyer un message';
  end if;

  insert into public.contacts (prenom, nom, email, telephone, sujet, message, status)
  values (trim(p_prenom), trim(p_nom), lower(trim(p_email)), nullif(trim(p_telephone), ''),
          trim(p_sujet), trim(p_message), 'new')
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.submit_devis(
  p_prenom text,
  p_nom text,
  p_email text,
  p_telephone text,
  p_projet text,
  p_delai text,
  p_surface integer,
  p_commune text,
  p_code_postal text,
  p_type_terrain text,
  p_budget text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid;
begin
  if length(trim(coalesce(p_prenom, ''))) not between 1 and 80
    or length(trim(coalesce(p_nom, ''))) not between 1 and 80
    or length(trim(coalesce(p_projet, ''))) not between 1 and 120
    or length(trim(coalesce(p_delai, ''))) not between 1 and 120
    or length(trim(coalesce(p_type_terrain, ''))) not between 1 and 120
    or length(trim(coalesce(p_email, ''))) > 254
    or trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_surface is not null and (p_surface < 0 or p_surface > 100000)
  then
    raise exception 'Données de devis invalides';
  end if;

  if exists (
    select 1 from public.devis
    where lower(email) = lower(trim(p_email))
      and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'Veuillez patienter avant de renvoyer une demande';
  end if;

  insert into public.devis (
    prenom, nom, email, telephone, projet, delai, surface, commune,
    code_postal, type_terrain, budget, message, status
  )
  values (
    trim(p_prenom), trim(p_nom), lower(trim(p_email)), trim(p_telephone),
    trim(p_projet), trim(p_delai), p_surface, nullif(trim(p_commune), ''),
    nullif(trim(p_code_postal), ''), trim(p_type_terrain), nullif(trim(p_budget), ''),
    nullif(trim(p_message), ''), 'new'
  )
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.submit_contact(text, text, text, text, text, text) from public;
revoke all on function public.submit_devis(text, text, text, text, text, text, integer, text, text, text, text, text) from public;
grant execute on function public.submit_contact(text, text, text, text, text, text) to anon;
grant execute on function public.submit_devis(text, text, text, text, text, text, integer, text, text, text, text, text) to anon;
