# Demo Data Operations Runbook

## Scope

Use this runbook only for the public portfolio demo deployment. Never paste secrets, database URLs, Sentry payloads, payment tokens, or personal data into docs, issues, commits, logs, or screenshots.

## Manual Demo Reset

Prerequisites:

- `DEMO_MODE=true` in Vercel Production.
- `CRON_SECRET` exists only in Vercel Production and local operator shell.
- Upstash Redis is configured for the deployment.
- Operator has explicit owner approval.

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Uri 'https://ritm-app-eight.vercel.app/api/cron/reset-demo' -Headers $headers
```

Expected: `{ ok: true, invariants: ... }`.

Immediately repeat the same command. Expected: the second response returns identical invariants.

Failure handling:

- `401`: check bearer token source; do not print it.
- `503`: production secret missing; verify Vercel env config.
- `500`: inspect Sentry/logs by `runId`; response intentionally hides internal error details.

## Vercel Rollback

1. Open Vercel project Deployments.
2. Select last known-good production deployment.
3. Promote it to Production.
4. Run:

```powershell
$env:SMOKE_BASE_URL = 'https://ritm-app-eight.vercel.app'
npm run smoke:production
```

5. Verify Vercel Cron Jobs page after rollback. Instant rollback does not guarantee cron config changed to match the promoted deployment.

## Neon Recovery Rehearsal

Use only isolated recovery paths. Never restore over the active demo branch during rehearsal.

1. In Neon Backup & Restore, select a timestamp before the rehearsal marker.
2. Use Time Travel Assist to confirm expected canonical category, product, and variant counts.
3. Restore to a new isolated branch.
4. Connect only the isolated verification environment to that branch.
5. Run catalog and smoke checks against that isolated environment.
6. Record RPO, RTO, branch name, deployment URL, smoke result, and cleanup confirmation in `docs/operations/recovery-rehearsal.md`.
7. Delete the rehearsal compute and branch after evidence is recorded.
