'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Switch } from '@/components/admin/ui/switch';
import { couponSchema, type CouponValues } from '@/services/dto/coupon-admin.dto';
import { createCoupon, updateCoupon } from '@/app/actions/admin/coupons';

export interface CouponFormInitial {
  id: string;
  code: string;
  percent: number;
  active: boolean;
  expiresAt: string | null; // ISO; СЃСЂРµР·Р°РµРј РґРѕ YYYY-MM-DD РґР»СЏ <input type="date">
}

export function CouponForm({ initial }: { initial?: CouponFormInitial }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initial?.code ?? '',
      percent: initial?.percent ?? 10,
      active: initial?.active ?? true,
      expiresAt: initial?.expiresAt ? initial.expiresAt.slice(0, 10) : '',
    },
  });

  const active = watch('active');

  async function onSubmit(values: CouponValues) {
    setServerError(null);
    const res = initial ? await updateCoupon(initial.id, values) : await createCoupon(values);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    router.push('/admin/marketing');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <label className="text-sm font-medium text-admin-on-surface">РљРѕРґ</label>
        <Input
          {...register('code', {
            // РљРѕСЃРјРµС‚РёС‡РµСЃРєРёР№ uppercase (client-safe РёРЅР»Р°Р№РЅ, С‡С‚РѕР±С‹ РЅРµ С‚СЏРЅСѓС‚СЊ @/lib/couponв†’prisma РІ Р±Р°РЅРґР»).
            // РђРІС‚РѕСЂРёС‚РµС‚РЅР°СЏ РЅРѕСЂРјР°Р»РёР·Р°С†РёСЏ вЂ” normalizeCouponCode РІ server action РїРµСЂРµРґ РІР°Р»РёРґР°С†РёРµР№/Р‘Р”.
            onBlur: (e) => setValue('code', e.target.value.trim().toUpperCase()),
          })}
          placeholder="RITM10"
          autoCapitalize="characters"
        />
        {errors.code && <p className="text-sm text-admin-error">{errors.code.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-admin-on-surface">РЎРєРёРґРєР°, %</label>
        <Input type="number" min={1} max={100} {...register('percent')} placeholder="10" />
        {errors.percent && <p className="text-sm text-admin-error">{errors.percent.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-admin-on-surface">Р”РµР№СЃС‚РІСѓРµС‚ РґРѕ</label>
        <Input type="date" {...register('expiresAt')} />
        <p className="text-xs text-admin-on-surface-variant">РџСѓСЃС‚Рѕ вЂ” Р±РµСЃСЃСЂРѕС‡РЅС‹Р№.</p>
        {errors.expiresAt && <p className="text-sm text-admin-error">{errors.expiresAt.message}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={active} onCheckedChange={(v) => setValue('active', v)} />
        <span className="text-sm font-medium text-admin-on-surface">РђРєС‚РёРІРµРЅ</span>
      </div>

      {serverError && <p className="text-sm text-admin-error">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {initial ? 'РЎРѕС…СЂР°РЅРёС‚СЊ' : 'РЎРѕР·РґР°С‚СЊ'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/marketing')}>
          РћС‚РјРµРЅР°
        </Button>
      </div>
    </form>
  );
}
