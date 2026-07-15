import { Button, Heading, Link, Text } from '@react-email/components';
import { EmailLayout } from './_layout';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cloudd3r.eu.cc';

export function NewsletterWelcomeEmail({ unsubscribeUrl }: { unsubscribeUrl: string }) {
  return (
    <EmailLayout preview="Вы подписаны на новости Ritm">
      <Text style={{ color: '#2f8f66', fontSize: 12, fontWeight: 700, letterSpacing: '1.2px', margin: '0 0 10px', textTransform: 'uppercase' }}>
        Ritm news
      </Text>
      <Heading style={{ color: '#171717', fontSize: 26, lineHeight: '32px', margin: '0 0 12px' }}>Спасибо за подписку</Heading>
      <Text style={{ color: '#5f5a53', fontSize: 15, lineHeight: '23px', margin: '0 0 24px' }}>
        Теперь вы первыми узнаете о новых коллекциях, специальных предложениях и избранных вещах Ritm. Только важное — без лишних писем.
      </Text>
      <Button href={`${SITE}/catalog`} style={{ backgroundColor: '#171717', borderRadius: 8, color: '#ffffff', fontSize: 14, fontWeight: 700, padding: '13px 22px', textDecoration: 'none' }}>
        Смотреть каталог
      </Button>
      <Text style={{ color: '#746f67', fontSize: 12, lineHeight: '18px', margin: '24px 0 0' }}>
        Не хотите получать новости? <Link href={unsubscribeUrl} style={{ color: '#746f67', textDecoration: 'underline' }}>Отписаться</Link>.
      </Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return <NewsletterWelcomeEmail unsubscribeUrl={`${SITE}/unsubscribe?token=demo`} />;
}
