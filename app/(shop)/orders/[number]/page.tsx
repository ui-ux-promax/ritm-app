import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma-client';
import { formatPrice } from '@/lib/format';
import { OrderStatusBadge } from '@/components/shared/orders/order-status-badge';
import { CancelOrderButton } from '@/components/shared/orders/cancel-order-button';
import { Button } from '@/components/ui';
import { getPaymentStatus } from '@/lib/yookassa';
import { reconcilePaymentStatus } from '@/lib/payment-sync';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { ReviewForm } from '@/components/shared/product/review-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Р—Р°РєР°Р·' };

// РџРѕР·РёС†РёРё + СЃРІСЏР·СЊ С‚РѕРІР°СЂР° (productId/slug/name) вЂ” РЅСѓР¶РЅРѕ РґР»СЏ С„РѕСЂРјС‹ РѕС‚Р·С‹РІР° РЅР° СЃС‚СЂР°РЅРёС†Рµ Р·Р°РєР°Р·Р°.
const orderInclude = {
  items: {
    include: {
      productVariant: {
        select: { colorway: { select: { productId: true, product: { select: { slug: true, name: true } } } } },
      },
    },
  },
  payment: true,
} satisfies Prisma.OrderInclude;

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { number } = await params;
  const orderNumber = Number(number);
  if (!Number.isInteger(orderNumber)) notFound();

  let order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  if (!order || order.userId !== session.user.id) notFound();

  // РСЃС‚РѕС‡РЅРёРє РїСЂР°РІРґС‹ РїРѕ РѕРїР»Р°С‚Рµ вЂ” Р®Kassa, Р° РЅРµ РІРµР±С…СѓРє (РѕРЅ РјРѕР¶РµС‚ РЅРµ РґРѕР№С‚Рё РЅР° preview/С…СЌС€-URL).
  // Р•СЃР»Рё РїР»Р°С‚С‘Р¶ РµС‰С‘ pending вЂ” СЃРїСЂР°С€РёРІР°РµРј Р°РєС‚СѓР°Р»СЊРЅС‹Р№ СЃС‚Р°С‚СѓСЃ Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓРµРј Р‘Р” РїСЂРё РІРѕР·РІСЂР°С‚Рµ СЃ РѕРїР»Р°С‚С‹.
  if (order.status === 'PENDING' && order.payment && order.payment.status === 'pending') {
    try {
      const remote = await getPaymentStatus(order.payment.id);
      const sync = await reconcilePaymentStatus({
        paymentId: order.payment.id,
        remoteStatus: remote,
        source: 'order-page',
      });
      if (sync.kind === 'applied' || sync.kind === 'repaired') {
        order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
      }
    } catch (e) {
      logger.error('order_payment_sync_failed', e, { orderNumber });
    }
    if (!order) notFound();
  }

  // РўРѕРІР°СЂС‹ Р·Р°РєР°Р·Р° (РґРµРґСѓРї РїРѕ productId) + СѓР¶Рµ РѕСЃС‚Р°РІР»РµРЅРЅС‹Рµ РѕС‚Р·С‹РІС‹ вЂ” РґР»СЏ С„РѕСЂРјС‹ В«РћС†РµРЅРёС‚Рµ РїРѕРєСѓРїРєСѓВ».
  const productsInOrder: { id: string; slug: string; name: string }[] = [];
  const seenProductIds = new Set<string>();
  for (const it of order.items) {
    const cw = it.productVariant.colorway;
    if (!seenProductIds.has(cw.productId)) {
      seenProductIds.add(cw.productId);
      productsInOrder.push({ id: cw.productId, slug: cw.product.slug, name: cw.product.name });
    }
  }
  // РћС‚Р·С‹РІ РґРѕСЃС‚СѓРїРµРЅ, С‚РѕР»СЊРєРѕ РµСЃР»Рё СЌС‚РѕС‚ Р·Р°РєР°Р· вЂ” СЂРµР°Р»СЊРЅР°СЏ РїРѕРєСѓРїРєР°: РЅРµ РѕС‚РјРµРЅС‘РЅ Р (COD РР›Р РѕРЅР»Р°Р№РЅ РѕРїР»Р°С‡РµРЅ).
  // РќРµРѕРїР»Р°С‡РµРЅРЅС‹Р№ РѕРЅР»Р°Р№РЅ-Р·Р°РєР°Р· (В«РћР¶РёРґР°РµС‚ РѕРїР»Р°С‚С‹В») С„РѕСЂРјС‹ РЅРµ РґР°С‘С‚.
  const orderIsPurchase =
    order.status !== 'CANCELLED' && (order.paymentMethod === 'cod' || order.payment?.status === 'succeeded');
  const canLeaveReviews = orderIsPurchase && productsInOrder.length > 0;
  const reviewedProductIds = canLeaveReviews
    ? new Set(
        (
          await prisma.review.findMany({
            where: { userId: session.user.id, productId: { in: productsInOrder.map((p) => p.id) } },
            select: { productId: true },
          })
        ).map((r) => r.productId),
      )
    : new Set<string>();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Р—Р°РєР°Р· #{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} paymentStatus={order.payment?.status} />
      </div>
      <p className="text-ink-muted text-sm">
        {order.createdAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {order.items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 p-4 text-sm">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-soft shrink-0">
              {it.imageUrl && <Image src={it.imageUrl} alt={it.productName} fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/product/${it.productVariant.colorway.product.slug}`} className="font-medium hover:underline underline-offset-2">{it.productName}</Link>
              <p className="text-ink-muted">{it.colorwayName} В· {it.size} В· {it.quantity} С€С‚.</p>
            </div>
            <span className="font-semibold tnum shrink-0">{formatPrice(it.lineTotal)}</span>
          </li>
        ))}
      </ul>

      {canLeaveReviews && (
        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <h2 className="font-semibold">РћС†РµРЅРёС‚Рµ РїРѕРєСѓРїРєСѓ</h2>
          {productsInOrder.map((p) => (
            <div key={p.id} className="space-y-2">
              <Link href={`/product/${p.slug}`} className="text-sm font-medium underline-offset-2 hover:underline">{p.name}</Link>
              {reviewedProductIds.has(p.id) ? (
                <p className="text-sm text-ink-muted">Р’С‹ СѓР¶Рµ РѕСЃС‚Р°РІРёР»Рё РѕС‚Р·С‹РІ РЅР° СЌС‚РѕС‚ С‚РѕРІР°СЂ. РЎРїР°СЃРёР±Рѕ!</p>
              ) : (
                <ReviewForm productId={p.id} />
              )}
            </div>
          ))}
        </section>
      )}

      <div className="rounded-2xl border border-line bg-surface p-5 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-ink-muted">РўРѕРІР°СЂС‹</span><span className="tnum">{formatPrice(order.itemsTotal)}</span></div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between"><span className="text-ink-muted">РЎРєРёРґРєР°{order.couponCode ? ` (${order.couponCode})` : ''}</span><span className="text-success tnum">в€’{formatPrice(order.discountAmount)}</span></div>
        )}
        <div className="flex justify-between"><span className="text-ink-muted">Р”РѕСЃС‚Р°РІРєР°</span><span className="tnum">{order.shippingAmount === 0 ? 'Р‘РµСЃРїР»Р°С‚РЅРѕ' : formatPrice(order.shippingAmount)}</span></div>
        <div className="flex justify-between border-t border-line pt-2 text-base"><span className="font-semibold">РС‚РѕРіРѕ</span><span className="font-display font-bold tnum">{formatPrice(order.totalAmount)}</span></div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 text-sm space-y-1">
        <p className="font-semibold">Р”РѕСЃС‚Р°РІРєР°</p>
        <p className="text-ink-muted">{order.shippingMethod === 'pickup' ? 'РЎР°РјРѕРІС‹РІРѕР·' : 'РљСѓСЂСЊРµСЂ'} В· {[order.city, order.addressLine].filter(Boolean).join(', ')}</p>
        <p className="text-ink-muted">{order.contactName} В· {order.contactPhone}</p>
        <p className="text-ink-muted">
            {order.payment
              ? order.payment.status === 'succeeded'
                ? 'РћРїР»Р°С‡РµРЅРѕ РѕРЅР»Р°Р№РЅ'
                : order.payment.status === 'canceled'
                  ? 'РћРїР»Р°С‚Р° РѕС‚РјРµРЅРµРЅР°'
                  : 'РћР¶РёРґР°РЅРёРµ РѕРїР»Р°С‚С‹вЂ¦'
              : 'РћРїР»Р°С‚Р° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё'}
          </p>
      </div>

      {order.status === 'PENDING' && (
        <div className="flex flex-wrap gap-3">
          {order.payment && order.payment.status === 'pending' && order.payment.confirmationUrl && (
            <Button asChild variant="primary" size="lg">
              <a href={order.payment.confirmationUrl}>РџСЂРѕРґРѕР»Р¶РёС‚СЊ РѕРїР»Р°С‚Сѓ</a>
            </Button>
          )}
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </main>
  );
}

