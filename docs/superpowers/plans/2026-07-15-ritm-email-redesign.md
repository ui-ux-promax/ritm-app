# Ritm Email Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy STRIDE email presentation with a cohesive Ritm transactional and newsletter email experience.

**Architecture:** Keep email layout primitives in `emails/_layout.tsx` and let the three templates supply only their message-specific content. Align outgoing subjects and fallback sender identities with the same Ritm brand while retaining existing service interfaces and unsubscribe behaviour.

**Tech Stack:** React Email, React, TypeScript, Vitest.

## Global Constraints

- Preserve the existing Russian language, props, and unsubscribe link flow.
- Use inline styles compatible with email clients; do not add client-side dependencies.
- Use the Ritm brand name in templates, previews, email subjects, and fallback sender labels.

---

### Task 1: Lock the brand contract with tests

**Files:**
- Create: `tests/email-branding.test.ts`
- Modify: `tests/verification-service.test.ts`
- Modify: `tests/newsletter-service.test.ts`

**Interfaces:**
- Consumes: email source files and the existing `sendEmail` mocks.
- Produces: regression coverage for Ritm template branding and outgoing subject lines.

- [ ] **Step 1: Write failing assertions**

```ts
expect(source).toContain('Ritm');
expect(source).not.toContain('STRIDE');
expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Код подтверждения Ritm' }));
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- tests/email-branding.test.ts tests/verification-service.test.ts tests/newsletter-service.test.ts`

Expected: FAIL because legacy STRIDE branding remains.

### Task 2: Build the shared Ritm email visual system

**Files:**
- Modify: `emails/_layout.tsx`
- Modify: `emails/verification-code.tsx`
- Modify: `emails/welcome.tsx`
- Modify: `emails/newsletter-welcome.tsx`

**Interfaces:**
- Consumes: `EmailLayout({ preview, children })`.
- Produces: unchanged template exports with a warm Ritm layout, dark wordmark header, green accent, and readable footer.

- [ ] **Step 1: Replace the outer layout styles and legacy wordmark**

```tsx
<Text style={{ color: '#16171a', fontSize: 30, fontWeight: 800 }}>Ritm</Text>
```

- [ ] **Step 2: Update every template preview and copy to Ritm**

```tsx
<EmailLayout preview={`Код подтверждения Ritm: ${code}`}>
```

- [ ] **Step 3: Keep content semantic and email-client safe**

```tsx
<Button style={{ backgroundColor: '#16171a', borderRadius: 8, color: '#ffffff' }} />
```

### Task 3: Align email delivery metadata and verify

**Files:**
- Modify: `lib/verification/service.ts`
- Modify: `lib/newsletter/service.ts`
- Modify: `lib/email/send-email.ts`
- Modify: `tests/send-email.test.ts`

**Interfaces:**
- Consumes: existing `sendEmail(kind, payload)` API.
- Produces: unchanged delivery flow with Ritm subjects and fallback sender labels.

- [ ] **Step 1: Update subjects and fallback identities**

```ts
subject: 'Код подтверждения Ritm'
return process.env.EMAIL_FROM_TRANSACTIONAL ?? 'Ritm <no-reply@cloudd3r.eu.cc>';
```

- [ ] **Step 2: Run focused tests**

Run: `npm test -- tests/email-branding.test.ts tests/send-email.test.ts tests/verification-service.test.ts tests/newsletter-service.test.ts`

Expected: PASS.

- [ ] **Step 3: Run repository verification**

Run: `npm run typecheck; npm test; git diff --check`

Expected: all commands exit with code 0.
