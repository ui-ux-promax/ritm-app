# Recovery Rehearsal Record

## Latest Rehearsal

Status: not yet performed.

Reason: Neon/Vercel recovery rehearsal requires external production access and explicit owner authorization.

## Evidence Template

- Date:
- Operator:
- Source Neon branch:
- Recovery timestamp:
- Isolated recovery branch:
- Verification deployment URL:
- Expected category count:
- Actual category count:
- Expected product count:
- Actual product count:
- Expected variant count:
- Actual variant count:
- Start time:
- End time:
- RPO:
- RTO:
- `npm run smoke:production` result:
- Manual reset first invariants:
- Manual reset second invariants:
- Cleanup confirmation:
- Notes:

## Completion Criteria

- Isolated branch restored without touching active demo database.
- Catalog counts match canonical seed data.
- Smoke passes against isolated verification deployment.
- Two reset invocations return identical invariants.
- Rehearsal compute and branch deleted or archived by owner policy.
