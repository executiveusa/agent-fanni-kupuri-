begin;

-- These tables are server-only. Privileges are revoked and RLS policies make the
-- denial explicit for both anonymous and authenticated browser roles.

drop policy if exists deny_browser_lead_diagnostics on fanni.lead_diagnostics;
create policy deny_browser_lead_diagnostics
on fanni.lead_diagnostics
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists deny_browser_billing_checkout_requests on fanni.billing_checkout_requests;
create policy deny_browser_billing_checkout_requests
on fanni.billing_checkout_requests
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists deny_browser_billing_events on fanni.billing_events;
create policy deny_browser_billing_events
on fanni.billing_events
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists deny_browser_billing_entitlements on fanni.billing_entitlements;
create policy deny_browser_billing_entitlements
on fanni.billing_entitlements
for all
to anon, authenticated
using (false)
with check (false);

commit;
