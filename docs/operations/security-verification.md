# Production Security Verification

## Scope

Run the checks below against a deployed portfolio URL. Do not print environment values, credentials, DSNs, tokens, cookies, payment data, or PII. Changing Vercel, Sentry, Upstash, or GitHub configuration requires separate owner authorization.

## Read-Only Headers

```powershell
$base = 'https://ritm-app-eight.vercel.app'
$r = Invoke-WebRequest "$base/demo-admin"
$r.Headers['Content-Security-Policy']
$r.Headers['Strict-Transport-Security']
$r.Headers['X-Content-Type-Options']
$r.Headers['Referrer-Policy']
```

Expected: CSP exists, HSTS contains `max-age=31536000`, `X-Content-Type-Options` is `nosniff`, and referrer policy is `strict-origin-when-cross-origin`.

## Readiness

```powershell
Invoke-WebRequest "$base/api/health" | Select-Object StatusCode, Content
```

Expected: `200` and `{ "ok": true }`. A separately authorized preview-only test with missing Upstash configuration must return `503` and `{ "ok": false }`; restore configuration immediately after that authorized test.

## Controlled Sentry Event

After explicit authorization, an authenticated `ADMIN` may send `POST $base/api/admin/observability/test`. Record the returned event ID, then confirm in Sentry: event tag `portfolio_sentry_test`, environment `production`, release equal to the deployed commit SHA, mapped TypeScript frames, and no cookies, authorization values, or contact data.

## Alert Setup

After explicit authorization, configure an issue alert for the project configured by the Production DSN (currently `ritm-app`), environment `production`, on first-seen or reopened issues, delivered to the owner's verified Sentry email. Record the alert URL here after configuration:

`Alert URL: not configured`

## Dependency And History Checks

```powershell
npm audit --omit=dev
git log -p --all -- . ':!.env.example' | Select-String -Pattern 'BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|sk_live_|SENTRY_AUTH_TOKEN=' -CaseSensitive
```

Record high or critical runtime advisories here with package, affected path, exploitability, mitigation, and review date. The secret-history scan must return no matches.

Current local check on 2026-07-13:

- `npm audit --omit=dev` reports two moderate runtime advisories through `next@15.5.19` and bundled `postcss <8.5.10` (`GHSA-qx2v-qp2m-jg93`). The suggested `npm audit fix --force` downgrades Next and is not safe for this release; track upstream Next/PostCSS patch before production sign-off.
- Secret-history scan returned no matches for private keys, `sk_live_`, or `SENTRY_AUTH_TOKEN=`.
