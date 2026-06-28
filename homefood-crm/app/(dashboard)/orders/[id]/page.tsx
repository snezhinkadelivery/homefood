import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { StatusSelector } from '@/components/orders/StatusSelector';
import { ToastViewport } from '@/components/ui/Toast';
import { formatDateTime, formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!orderId) notFound();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !data) notFound();
  const order = data as Order;
  const addressPhotoUrl = await getAddressPhotoUrl(order.address_photo_url);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="text-sm text-[#64748B] hover:text-[#1E293B]">
            ← К заказам
          </Link>
          <h1 className="text-2xl font-bold text-[#1E293B]">Заказ {order.order_number}</h1>
          <StatusBadge status={order.status} />
        </div>
        <StatusSelector orderId={order.id} current={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Клиент">
          <Row label="Имя" value={order.customer_name} />
          <Row label="Телефон" value={order.phone} />
          <Row label="Telegram ID" value={order.user_tg_id ? String(order.user_tg_id) : '—'} />
          <Row label="Создан" value={formatDateTime(order.created_at)} />
          <Row label="Обновлён" value={formatDateTime(order.updated_at)} />
        </Card>

        <Card title="Доставка">
          {order.address_text && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-[#64748B]">Адрес</p>
              <p className="mt-1 text-sm text-[#1E293B]">{order.address_text}</p>
            </div>
          )}
          {order.address_photo_url && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-[#64748B]">Фото адреса</p>
              {addressPhotoUrl ? (
                <a
                  href={addressPhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-[#2563EB] hover:underline"
                >
                  Открыть фото →
                </a>
              ) : (
                <p className="mt-1 text-sm text-red-600">Фото недоступно</p>
              )}
            </div>
          )}
          {order.comment && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#64748B]">Комментарий</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[#1E293B]">{order.comment}</p>
            </div>
          )}
          {!order.address_text && !order.address_photo_url && !order.comment && (
            <p className="text-sm text-[#64748B]">Нет дополнительной информации</p>
          )}
        </Card>
      </div>

      <Card title="Состав заказа">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E2E8F0]">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-[#64748B]">
                  Блюдо
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#64748B]">
                  Кол-во
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#64748B]">
                  Цена
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#64748B]">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {order.items_json.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-sm text-[#1E293B]">{item.name}</td>
                  <td className="px-3 py-2 text-right text-sm">{item.qty}</td>
                  <td className="px-3 py-2 text-right text-sm">{formatPrice(item.price)}</td>
                  <td className="px-3 py-2 text-right text-sm font-medium">
                    {formatPrice(item.price * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
          <Row label="Товары" value={formatPrice(order.subtotal)} />
          <Row
            label="Доставка"
            value={order.delivery_fee === 0 ? 'Бесплатно' : formatPrice(order.delivery_fee)}
          />
          <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
            <span className="font-bold text-[#1E293B]">Итого</span>
            <span className="text-lg font-bold text-[#2563EB]">{formatPrice(order.total)}</span>
          </div>
        </div>
      </Card>

      <ToastViewport />
    </div>
  );
}

async function getAddressPhotoUrl(filePath: string | null): Promise<string | null> {
  if (!filePath) return null;
  if (/^https?:\/\//.test(filePath)) return filePath;

  const { data, error } = await supabaseAdmin.storage
    .from('address-photos')
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    console.error('[orders] address photo signed url error:', error);
    return null;
  }

  return data.signedUrl;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#64748B]">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-[#64748B]">{label}</span>
      <span className="font-medium text-[#1E293B]">{value}</span>
    </div>
  );
}
