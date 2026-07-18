# Ritm Portfolio Release Checklist

## Source and CI

- [ ] `npm ci`, Prisma generation, typecheck, tests, and build pass in GitHub Actions.
- [ ] `git diff --check` reports no errors and `git status --short` contains no `.env` file.

## Vercel and environment

- [ ] Production URL is `https://ritm-app-eight.vercel.app` and points to the reviewed commit SHA.
- [ ] Vercel Preview and Production contain demo/sandbox Neon, YooKassa, Upstash, Sentry, Resend, Cloudinary, `DEMO_MODE=true`, `CRON_SECRET`, and `AUTH_TRUST_HOST=true`; enable host trust only behind Vercel or another trusted reverse proxy. Redeploy after changing the variable. No value is copied into this document.

## Storefront and payment

- [ ] `npm run smoke:production` passes against the production URL.
- [ ] One YooKassa sandbox order returns to Ritm and appears in the customer profile with no real charge.

## Administration boundaries

- [ ] Guest and CUSTOMER requests to `/admin` are denied.
- [ ] `/demo-admin` and its four section routes are public and contain only synthetic data.
- [ ] Demo-admin isolation tests prove no Prisma, Auth.js, or admin mutation import.

## Security and observability

- [ ] CSP, HSTS, nosniff, and referrer-policy headers match `docs/operations/security-verification.md`.
- [ ] `/api/health` returns 200 with Upstash configured.
- [ ] Controlled Sentry event has production environment, reviewed release SHA, readable TypeScript frames, and no PII.
- [ ] Sentry production issue alert delivers one owner notification.

## Reset and recovery

- [ ] Two authorized reset calls return identical invariants.
- [ ] Vercel rollback procedure is verified against a known-good deployment.
- [ ] Neon isolated recovery rehearsal restores canonical catalog counts and records RPO/RTO.

## Portfolio presentation

- [ ] README live links and four screenshots render on GitHub.
- [ ] Desktop 1440x1000 and mobile 390x844 checks pass for storefront and demo admin.
- [ ] Portfolio limitations state sandbox payments, synthetic demo-admin data, and no SLA.
