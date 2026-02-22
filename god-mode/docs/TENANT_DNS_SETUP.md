# Tenant DNS Setup (Without Adding Domains to Coolify)

Coolify only needs **two domains** for SSL and routing:

- **JFactory**: `factory.jumpstartscaling.com`, `www.factory.jumpstartscaling.com`
- **god-mode-api**: `api.jumpstartscaling.com`

Tenant sites (e.g. `chrisamaya.work`) are handled via DNS + proxy so you **don't add each tenant domain to Coolify**.

---

## Option A: Path-Based (Recommended, Simplest)

All tenants live under the primary domain:

| Tenant | URL |
|--------|-----|
| chrisamaya.work | `https://factory.jumpstartscaling.com/chrisamaya` |
| (future tenant) | `https://factory.jumpstartscaling.com/tenant-slug` |

**DNS for custom domains (optional):**
- `chrisamaya.work` → CNAME to `factory.jumpstartscaling.com`
- In Cloudflare/your DNS: add a **Redirect Rule** or **Page Rule**: `chrisamaya.work` → `https://factory.jumpstartscaling.com/chrisamaya` (301)
- Or keep using the factory subpath URL; no custom domain needed.

**Coolify:** Only `factory.jumpstartscaling.com` is configured. No tenant domains.

---

## Option B: Cloudflare Proxy (Custom Domains Without Coolify)

Use Cloudflare in front of your Coolify server:

1. **Coolify:** Add only `factory.jumpstartscaling.com` and `api.jumpstartscaling.com` (or use a single origin domain).
2. **Cloudflare:**
   - Add `chrisamaya.work` as a site (or under your Cloudflare account).
   - DNS: `chrisamaya.work` → CNAME `factory.jumpstartscaling.com` (or A record to your server IP).
   - Proxy: **Proxied** (orange cloud) so Cloudflare terminates SSL for `chrisamaya.work`.
3. **Origin:** Point Cloudflare origin to your Coolify server IP (or `factory.jumpstartscaling.com`).
4. **Coolify/Traefik:** Must accept requests for `chrisamaya.work` and route to JFactory. Options:
   - Add `chrisamaya.work` to JFactory domains in Coolify (one-time per tenant), **or**
   - Use Coolify/Traefik **default/catch-all** so all Hosts go to JFactory (if available).
   - Coolify may support a **wildcard** or **default backend**; check Proxy settings.

With a catch-all, Coolify needs no tenant domains; Cloudflare + your app handle routing.

---

## Option C: Server Wildcard (Same Root Domain)

If all tenants use subdomains of one domain (e.g. `*.jumpstartscaling.com`):

1. **Coolify Server** → Settings → set **Wildcard Domain** (e.g. `*.jumpstartscaling.com`).
2. **DNS:** `tenant1.jumpstartscaling.com`, `tenant2.jumpstartscaling.com` → CNAME to `factory.jumpstartscaling.com` (or A to server).
3. Coolify issues a wildcard cert and routes all `*.jumpstartscaling.com` to JFactory.

Does not cover different root domains (e.g. `chrisamaya.work`).

---

## Summary

- **Path-based (A):** Use `factory.jumpstartscaling.com/chrisamaya`. Custom domains redirect there. No tenant domains in Coolify.
- **Cloudflare (B):** Custom domains in Cloudflare; origin is Coolify. Requires catch-all or wildcard in Coolify.
- **Wildcard (C):** Only for `*.yourdomain.com` tenants.

For most setups, **Option A** is the simplest and requires no tenant domains in Coolify.
