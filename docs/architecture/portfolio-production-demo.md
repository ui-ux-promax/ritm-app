# Portfolio Production Demo Architecture

The storefront and demo admin are separate public experiences. The demo admin reads only static synthetic fixtures and has no Prisma, Auth.js, or mutation path. The real owner admin remains server-authorized and is not linked from demo-admin controls.

```mermaid
flowchart LR
  Visitor --> Storefront["Next.js storefront"]
  Reviewer --> DemoAdmin["/demo-admin · synthetic read-only snapshot"]
  Owner --> RealAdmin["/admin · Auth.js ADMIN"]
  Storefront --> Neon["Neon demo database"]
  Storefront --> YooKassa["YooKassa sandbox"]
  Storefront --> Upstash["Upstash rate limits"]
  Storefront --> Sentry["Sentry errors"]
  Cron["Vercel Cron"] --> Reset["Idempotent demo reset"]
  Reset --> Neon
```

The public demo admin is a presentation surface, not a proxy to Neon or the private admin. Its pages deliberately exclude live imports and all write actions. Demo reset protects canonical fixture state independently of the presentation layer.
