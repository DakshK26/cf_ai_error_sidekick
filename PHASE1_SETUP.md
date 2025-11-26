# Phase 1 Setup Guide - Cloudflare Service Provisioning

This document outlines the **manual steps** you need to complete in the Cloudflare dashboard and terminal to provision the required services for Phase 1.

## Prerequisites

✅ Cloudflare account created  
✅ Wrangler CLI installed and authenticated (`wrangler login` - already done)

---

## Step 1: Create KV Namespace

```powershell
wrangler kv:namespace create "KV_STORE"
```

**Output will look like:**
```
✨ Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "KV_STORE"
id = "abc123xyz..."
```

**Action**: Copy the `id` value and replace `kv_store_id_placeholder` in `apps/worker/wrangler.toml`

---

## Step 2: Create D1 Database

```powershell
wrangler d1 create cf_ai_error_sidekick_db
```

**Output will look like:**
```
✨ Add the following to your wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "cf_ai_error_sidekick_db"
database_id = "abc-123-def-456..."
```

**Action**: Copy the `database_id` value and replace `d1_placeholder` in `apps/worker/wrangler.toml`

---

## Step 3: Create Vectorize Index

```powershell
wrangler vectorize create error_index --dimensions=768 --metric=cosine
```

**Note**: 768 dimensions matches the `@cf/baai/bge-base-en-v1.5` embedding model specified in wrangler.toml

**Output confirms:**
```
✅ Created Vectorize index 'error_index'
```

No additional wrangler.toml changes needed - already configured.

---

## Step 4: Enable Workers AI

Workers AI is automatically available for all Cloudflare accounts. No manual provisioning needed.

The `AI` binding will be automatically injected at runtime.

---

## Step 5: Workflows Setup

Workflows are configured in `wrangler.toml` but the actual workflow definition will be created in Phase 7 (Document Ingestion).

For now, the binding is declared but not yet implemented. This is expected.

---

## Step 6: Verify Configuration

After updating the placeholder IDs in `wrangler.toml`:

```powershell
cd apps/worker
pnpm dev
```

You should see console output:
```
⚠️ Workflow binding missing (expected - will add in Phase 7)
✅ All other Phase 1 bindings verified
```

Or warnings for any missing bindings that need attention.

---

## Step 7: Test the Worker

With `wrangler dev` running, visit:
```
http://localhost:8787
```

Expected response:
```
Worker running with Phase 1 bindings.
```

Check the terminal console for binding verification output.

---

## Troubleshooting

**Problem**: KV or D1 creation fails  
**Solution**: Ensure you're on a paid Cloudflare plan (Workers Paid or higher)

**Problem**: Vectorize not available  
**Solution**: Vectorize may be in beta - check Cloudflare dashboard for access

**Problem**: `wrangler dev` shows binding errors  
**Solution**: Verify IDs in `wrangler.toml` match the output from creation commands

---

## Next Steps

Once all bindings are provisioned and `wrangler dev` runs without critical errors:

✅ Phase 1 is complete!  
➡️ Ready to move to **Phase 2: Worker Routing & SSE**
