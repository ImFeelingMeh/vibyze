-- Ensure API roles have table-level privileges (RLS policies still govern row access).
-- Supabase Cloud normally sets these automatically, but re-asserting them here
-- is a safe no-op if already present and fixes projects where they're missing.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select on all tables in schema public to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant select on tables to anon;
