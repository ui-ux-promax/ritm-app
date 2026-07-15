import { createElement } from 'react';
import { prisma } from '@/lib/prisma-client';
import { getResend } from '@/lib/email/resend-client';
import { sendEmail } from '@/lib/email/send-email';
import { NewsletterWelcomeEmail } from '@/emails/newsletter-welcome';
import { buildUnsubscribeUrl } from '@/lib/newsletter/unsubscribe-token';
import type { NewsletterSource } from '@/constants/config';
import { logger } from '@/lib/logger';

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: string };

async function syncToAudience(email: string): Promise<string | null> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const resend = getResend();
  if (!audienceId || !resend) return null;
  try {
    const { data, error } = await resend.contacts.create({ email, audienceId, unsubscribed: false });
    if (error || !data) {
      logger.warn('audience_sync_failed', { error: error?.message });
      return null;
    }
    return data.id;
  } catch (error) {
    logger.warn('audience_sync_threw', { err: String(error) });
    return null;
  }
}

export async function subscribe(emailRaw: string, source: NewsletterSource = 'footer'): Promise<SubscribeResult> {
  const email = emailRaw.trim().toLowerCase();
  const existing = await prisma.subscriber.findUnique({ where: { email } });

  if (existing && !existing.unsubscribedAt) {
    return { ok: true, alreadySubscribed: true };
  }

  const resendContactId = await syncToAudience(email);

  if (existing) {
    await prisma.subscriber.update({
      where: { email },
      data: { unsubscribedAt: null, ...(resendContactId ? { resendContactId } : {}) },
    });
  } else {
    await prisma.subscriber.create({ data: { email, source, resendContactId } });
  }

  try {
    await sendEmail({
      to: email,
      subject: 'Добро пожаловать в Ritm',
      kind: 'newsletter',
      react: createElement(NewsletterWelcomeEmail, { unsubscribeUrl: buildUnsubscribeUrl(email) }),
    });
  } catch (error) {
    logger.error('newsletter_welcome_failed', error);
  }

  return { ok: true, alreadySubscribed: false };
}
